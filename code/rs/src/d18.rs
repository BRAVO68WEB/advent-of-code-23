#![allow(
    clippy::must_use_candidate,
    clippy::missing_panics_doc,
    clippy::identity_op
)]
enum Direction {
    R,
    D,
    L,
    U,
}

fn solve<I: IntoIterator<Item = (Direction, u32)>>(data: I) -> u64 {
    let (mut x, mut y, mut a, mut l) = (0, 0, 0, 0);
    for (d, n) in data {
        match d {
            Direction::R => {
                x += i64::from(n);
                a += y * i64::from(n);
            }
            Direction::D => {
                y += i64::from(n);
            }
            Direction::L => {
                x -= i64::from(n);
                a -= y * i64::from(n);
            }
            Direction::U => {
                y -= i64::from(n);
            }
        }
        l += u64::from(n);
    }
    debug_assert_eq!((x, y), (0, 0));
    a.unsigned_abs() + l / 2 + 1
}

pub fn part1(data: &str) -> u64 {
    solve(data.lines().filter_map(|line| {
        let mut iter = line.split(' ');
        let d = iter.next()?;
        let d = if d == "R" {
            Direction::R
        } else if d == "D" {
            Direction::D
        } else if d == "L" {
            Direction::L
        } else if d == "U" {
            Direction::U
        } else {
            return None;
        };
        Some((d, iter.next()?.parse::<u32>().ok()?))
    }))
}

pub fn part2(data: &str) -> u64 {
    solve(data.lines().filter_map(|line| {
        let line = line
            .split(' ')
            .next_back()?
            .strip_prefix("(#")?
            .strip_suffix(')')?;
        let d = match line.bytes().last()? {
            b'0' => Direction::R,
            b'1' => Direction::D,
            b'2' => Direction::L,
            b'3' => Direction::U,
            _ => {
                return None;
            }
        };
        Some((d, u32::from_str_radix(&line[..line.len() - 1], 16).ok()?))
    }))
}

pub fn main() {
    let input = std::fs::read_to_string("../../input/18.txt").expect("Input file not found");
    println!("Part 1 : {}", part1(&input).to_string());
    println!("Part 2 : {}", part2(&input).to_string());
}
