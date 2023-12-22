#![allow(clippy::must_use_candidate, clippy::missing_panics_doc)]

use static_init::dynamic;
use std::collections::BTreeMap;
use std::iter;

#[derive(Clone, Copy, Debug, Eq, Ord, PartialEq, PartialOrd)]
enum Direction {
    U,
    L,
    D,
    R,
}

#[dynamic]
static LUT: BTreeMap<(Direction, char), Direction> = [
    ((Direction::U, '|'), Direction::U),
    ((Direction::U, '7'), Direction::L),
    ((Direction::U, 'F'), Direction::R),
    ((Direction::L, '-'), Direction::L),
    ((Direction::L, 'F'), Direction::D),
    ((Direction::L, 'L'), Direction::U),
    ((Direction::D, '|'), Direction::D),
    ((Direction::D, 'L'), Direction::R),
    ((Direction::D, 'J'), Direction::L),
    ((Direction::R, '-'), Direction::R),
    ((Direction::R, 'J'), Direction::U),
    ((Direction::R, '7'), Direction::D),
]
.into_iter()
.collect();

fn step((y, x): (usize, usize), dir: Direction) -> Option<(usize, usize)> {
    Some(match dir {
        Direction::U => (y.checked_sub(1)?, x),
        Direction::L => (y, x.checked_sub(1)?),
        Direction::D => (y.checked_add(1)?, x),
        Direction::R => (y, x.checked_add(1)?),
    })
}

fn part1_helper(maze: &[&str]) -> Option<Vec<(usize, usize)>> {
    for (y, line) in maze.iter().enumerate() {
        for (x, char) in line.char_indices() {
            if char != 'S' {
                continue;
            }
            let start_pos = (y, x);
            for mut dir in [Direction::U, Direction::L, Direction::D, Direction::R] {
                let mut pos = start_pos;
                let mut path = iter::from_fn(|| {
                    pos = step(pos, dir)?;
                    dir =
                        *LUT.get(&(dir, maze[pos.0..].iter().next()?[pos.1..].chars().next()?))?;
                    Some(pos)
                })
                .collect::<Vec<_>>();
                if pos == start_pos && !path.is_empty() {
                    path.push(pos);
                    return Some(path);
                }
            }
        }
    }
    None
}

pub fn part1(data: &str) -> Option<usize> {
    Some(part1_helper(&data.lines().collect::<Vec<_>>())?.len() / 2)
}

pub fn part2(data: &str) -> Option<usize> {
    let path = part1_helper(&data.lines().collect::<Vec<_>>())?;
    let (n, m) = path
        .iter()
        .zip(path[1..].iter().chain(path.iter()))
        .map(|((y0, x0), (y1, x1))| (x0 * y1, x1 * y0))
        .fold((0, 0), |(a, b), (c, d)| (a + c, b + d));
    Some((2 + n.max(m) - n.min(m) - path.len()) / 2)
}

pub fn main() {
    let input = std::fs::read_to_string("../../input/10.txt").expect("Input file not found");
    println!("Part 1 : {}", part1(&input).unwrap());
    println!("Part 2 : {}", part2(&input).unwrap());
}
