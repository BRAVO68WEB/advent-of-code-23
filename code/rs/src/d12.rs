#![allow(
    clippy::must_use_candidate,
    clippy::missing_panics_doc,
    clippy::identity_op
)]

use itertools::Itertools;
use std::collections::HashMap;

struct Solver<'a> {
    memo: HashMap<(&'a str, &'a [usize]), usize>,
}

impl<'a> Solver<'a> {
    fn solve(&mut self, string: &'a str, runs: &'a [usize]) -> usize {
        let string = string.trim_matches('.');
        if let Some(&result) = self.memo.get(&(string, runs)) {
            return result;
        }
        let m = runs.iter().sum::<usize>();
        let result = if m < string.chars().filter(|&c| c == '#').count()
            || m > string.chars().filter(|&c| c != '.').count()
            || m + runs.len() > string.len() + 1
        {
            0
        } else if string.is_empty() || runs.is_empty() {
            1
        } else {
            let x = runs[0];
            (if string[..x].chars().any(|c| c == '.') || string[x..].starts_with('#') {
                0
            } else {
                self.solve(&string[(x + 1).min(string.len())..], &runs[1..])
            }) + if string.starts_with('#') {
                0
            } else {
                self.solve(&string[1..], runs)
            }
        };
        self.memo.insert((string, runs), result);
        result
    }
}

fn solve<const N: usize>(line: &str) -> Option<usize> {
    let (lhs, rhs) = line.split_once(' ')?;
    let rhs = rhs
        .split(',')
        .map(|x| x.parse().ok())
        .collect::<Option<Vec<_>>>()?;
    Some(
        Solver {
            memo: HashMap::new(),
        }
        .solve(
            &Itertools::intersperse([lhs; N].into_iter(), "?").collect::<String>(),
            &[&rhs; N].into_iter().flatten().copied().collect::<Vec<_>>(),
        ),
    )
}

pub fn part1(data: &str) -> usize {
    data.lines().filter_map(solve::<1>).sum()
}

pub fn part2(data: &str) -> usize {
    data.lines().filter_map(solve::<5>).sum()
}

pub fn main() {
    let input = std::fs::read_to_string("../../input/12.txt").expect("Input file not found");
    println!("Part 1 : {}", part1(&input));
    println!("Part 2 : {}", part2(&input));
}
