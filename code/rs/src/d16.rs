#![allow(
    clippy::must_use_candidate,
    clippy::missing_panics_doc,
    clippy::identity_op
)]
use rayon::iter::{ParallelBridge, ParallelIterator};
use static_init::dynamic;
use std::collections::BTreeMap;
use std::collections::BTreeSet;

#[derive(Clone, Copy, Debug, Eq, Ord, PartialEq, PartialOrd)]
enum Direction {
    U,
    L,
    D,
    R,
}

#[dynamic]
static LUT: BTreeMap<(Direction, char), &'static [Direction]> = {
    static DIRECTIONS: [Direction; 4] = [Direction::U, Direction::D, Direction::L, Direction::R];
    [
        ((Direction::U, '/'), &DIRECTIONS[3..4]),
        ((Direction::U, '\\'), &DIRECTIONS[2..3]),
        ((Direction::U, '-'), &DIRECTIONS[2..4]),
        ((Direction::L, '/'), &DIRECTIONS[1..2]),
        ((Direction::L, '\\'), &DIRECTIONS[0..1]),
        ((Direction::L, '|'), &DIRECTIONS[0..2]),
        ((Direction::D, '/'), &DIRECTIONS[2..3]),
        ((Direction::D, '\\'), &DIRECTIONS[3..4]),
        ((Direction::D, '-'), &DIRECTIONS[2..4]),
        ((Direction::R, '/'), &DIRECTIONS[0..1]),
        ((Direction::R, '\\'), &DIRECTIONS[1..2]),
        ((Direction::R, '|'), &DIRECTIONS[0..2]),
    ]
    .into_iter()
    .collect()
};

fn step(y: usize, x: usize, dir: Direction) -> Option<(usize, usize)> {
    Some(match dir {
        Direction::U => (y.checked_sub(1)?, x),
        Direction::L => (y, x.checked_sub(1)?),
        Direction::D => (y.checked_add(1)?, x),
        Direction::R => (y, x.checked_add(1)?),
    })
}

fn fill(data: &[&str], y: usize, x: usize, d: Direction) -> Option<usize> {
    let mut stack = vec![(y, x, d)];
    let mut visited = stack.iter().copied().collect::<BTreeSet<_>>();
    while let Some((y, x, d)) = stack.pop() {
        for &d in *LUT
            .get(&(d, data[y][x..].chars().next()?))
            .unwrap_or(&&[d][..])
        {
            let Some((y, x)) = step(y, x, d) else {
                continue;
            };
            if y < data.len() && x < data[y].len() && visited.insert((y, x, d)) {
                stack.push((y, x, d));
            }
        }
    }
    Some(
        visited
            .into_iter()
            .map(|(y, x, _)| (y, x))
            .collect::<BTreeSet<_>>()
            .len(),
    )
}

pub fn part1(data: &str) -> Option<usize> {
    fill(&data.lines().collect::<Vec<_>>(), 0, 0, Direction::R)
}

pub fn part2(data: &str) -> Option<usize> {
    // Split the input string into lines and collect into a vector
    let grid = data.lines().collect::<Vec<_>>();

    // Generate starting points for traversal in all four directions
    let right_starts = (0..grid.len()).map(|y| (y, 0, Direction::R));
    let down_starts = (0..grid.first()?.len()).map(|x| (0, x, Direction::D));
    let left_starts =
        (0..grid.len()).filter_map(|y| Some((y, grid[y].len().checked_sub(1)?, Direction::L)));
    let up_starts = (0..grid.last()?.len()).map(|x| (grid.len() - 1, x, Direction::U));

    // Combine all starting points and process in parallel
    let result = right_starts
        .chain(down_starts)
        .chain(left_starts)
        .chain(up_starts)
        .par_bridge()
        .filter_map(|(y, x, direction)| fill(&grid, y, x, direction))
        .max();

    // Return the result
    result
}

pub fn main() {
    let input = std::fs::read_to_string("../../input/16.txt").expect("Input file not found");
    println!("Part 1 : {}", part1(&input).unwrap().to_string());
    println!("Part 2 : {}", part2(&input).unwrap().to_string());
}
