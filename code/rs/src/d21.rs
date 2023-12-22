#![allow(
    clippy::must_use_candidate,
    clippy::missing_panics_doc,
    clippy::identity_op
)]
use lazy_static::lazy_static;
use std::collections::hash_map::Entry::Vacant;
use std::collections::{HashMap, HashSet, VecDeque};

struct Garden {
    rocks: HashSet<(isize, isize)>,
}

fn parse(input: &str) -> (Garden, (isize, isize)) {
    let width = input.lines().next().unwrap().len();
    let height = input.lines().count();

    let input = input.replace('\n', "");

    let start = input
        .chars()
        .enumerate()
        .position(|(_, c)| c == 'S')
        .unwrap();

    let start: (isize, isize) = ((start % width) as isize, (start / width) as isize);

    let rocks: HashSet<_> = input
        .chars()
        .enumerate()
        .filter(|(_, c)| *c == '#')
        .map(|(i, _)| i)
        .collect();

    let rocks: HashSet<(isize, isize)> = rocks
        .iter()
        .map(|i| ((i % width) as isize, (i / width) as isize))
        .map(|p| (p.0 - start.0, p.1 - start.1))
        .collect();

    (Garden { rocks }, (width as isize, height as isize))
}

fn generate_neighbors(position: (isize, isize)) -> Vec<(isize, isize)> {
    vec![
        (position.0 - 1, position.1),
        (position.0 + 1, position.1),
        (position.0, position.1 - 1),
        (position.0, position.1 + 1),
    ]
}

fn solve_steps(garden: Garden, num_steps: isize) -> usize {
    let mut queue = vec![((0, 0), 0)]; // position, number of steps so far
    let mut visited = HashSet::new();

    while let Some(state) = queue.pop() {
        if !visited.contains(&state) {
            if state.1 < num_steps {
                let neighbors = generate_neighbors(state.0);

                for neighbor in neighbors {
                    if !garden.rocks.contains(&neighbor) {
                        queue.push((neighbor, state.1 + 1));
                    }
                }
            }

            visited.insert(state);
        }
    }

    visited
        .iter()
        .filter_map(|(p, c)| (*c == num_steps).then_some(p))
        .collect::<HashSet<_>>()
        .len()
}

pub fn part1(input: &'static str) -> String {
    let garden = parse(input);

    solve_steps(garden.0, 64).to_string()
}

pub fn part2(input: &'static str) -> String {
    let (garden, (width, height)) = parse(input);

    let mut queue = VecDeque::new();
    queue.push_back(((0, 0), 0));

    let mut visited = HashMap::new();

    while let Some((coords, dist)) = queue.pop_front() {
        if let Vacant(e) = visited.entry(coords) {
            let neighbors = generate_neighbors(coords);

            for neighbor in neighbors {
                if !garden.rocks.contains(&neighbor)
                    && neighbor.0 >= -width / 2
                    && neighbor.1 >= -height / 2
                    && neighbor.0 <= width / 2
                    && neighbor.1 <= height / 2
                {
                    queue.push_back((neighbor, dist + 1));
                }
            }

            e.insert(dist);
        }
    }

    let visited_even_outside = visited
        .values()
        .filter(|v| **v % 2 == 0 && **v > 65)
        .count();

    let visited_even = visited.values().filter(|v| **v % 2 == 1).count();

    let visited_odd_outside = visited
        .values()
        .filter(|v| **v % 2 == 1 && **v > 65)
        .count();

    let visited_odd = visited.values().filter(|v| **v % 2 == 0).count();

    let n = 26501365 / width as usize;

    let visited_inside = visited_even * (n + 1) * (n + 1) + visited_odd * n * n;
    let visited_outside = n * visited_even_outside - (n + 1) * visited_odd_outside;

    (visited_inside + visited_outside).to_string()
}

lazy_static! {
    static ref INPUT: &'static str = { include_str!("../../../input/21.txt").trim() };
}

pub fn main() {
    println!("Part 1 : {}", part1(&INPUT).to_string());
    println!("Part 2 : {}", part2(&INPUT).to_string());
}
