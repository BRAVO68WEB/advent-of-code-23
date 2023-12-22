#![allow(clippy::must_use_candidate, clippy::missing_panics_doc, clippy::identity_op)]
use std::{
    collections::{BTreeMap, BTreeSet, VecDeque},
    fmt::{Debug, Display},
};

use nom::{
    bytes::complete::tag,
    character::complete::{newline, u32},
    combinator::map,
    multi::separated_list1,
    sequence::{separated_pair, terminated, tuple},
    IResult,
};

type SupportMap = BTreeMap<usize, BTreeSet<usize>>;
type Input = (SupportMap, SupportMap);

fn parse(input: &str) -> Input {
    let mut idx = 0usize;
    let triple = |s| {
        map(
            tuple((terminated(u32, tag(",")), terminated(u32, tag(",")), u32)),
            |(x, y, z)| Triple::new(z, y, x),
        )(s)
    };
    let result: IResult<&str, Input> = map(
        separated_list1(
            newline,
            map(separated_pair(triple, tag("~"), triple), |(start, end)| {
                idx += 1;
                Brick::new(idx, start, end)
            }),
        ),
        |x| settle(&x),
    )(input);

    result.unwrap().1
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord)]
struct Triple {
    z: u32,
    y: u32,
    x: u32,
}

impl Triple {
    fn new(z: u32, y: u32, x: u32) -> Self {
        Self { z, y, x }
    }

    fn below(&self) -> Self {
        Self {
            z: self.z - 1,
            y: self.y,
            x: self.x,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq)]
struct Brick {
    id: usize,
    min: Triple,
    max: Triple,
    cubes: BTreeSet<Triple>,
}

impl Brick {
    fn new(id: usize, start: Triple, end: Triple) -> Self {
        let min = start.min(end);
        let max = start.max(end);
        let cubes = Self::cubes(min, max);
        Self {
            id,
            min,
            max,
            cubes,
        }
    }

    fn on_ground(&self) -> bool {
        self.min.z == 1
    }

    fn move_down(&mut self) {
        self.min.z -= 1;
        self.max.z -= 1;
        // this is probably inefficient?
        self.cubes = Self::cubes(self.min, self.max);
    }

    // generate all the cubes for this brick
    fn cubes(min: Triple, max: Triple) -> BTreeSet<Triple> {
        (min.z..=max.z)
            .flat_map(|z| {
                (min.y..=max.y)
                    .flat_map(move |y| (min.x..=max.x).map(move |x| Triple::new(z, y, x)))
            })
            .collect()
    }
}

impl Display for Brick {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "{}: {},{},{}~{},{},{}",
            self.id, self.min.z, self.min.y, self.min.x, self.max.z, self.max.y, self.max.x
        )
    }
}

impl PartialOrd for Brick {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for Brick {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        self.min.cmp(&other.min).then(self.max.cmp(&other.max))
    }
}

fn settle(input: &[Brick]) -> Input {
    // sort the bricks by z index
    let mut bricks = input.to_vec();
    bricks.sort();

    // The 3D tower, with brick id being the value
    let mut settled: BTreeMap<Triple, usize> = BTreeMap::new();

    // the "graph" indicating which bricks support other bricks
    let mut holding_up: SupportMap = BTreeMap::new();
    let mut sitting_on: SupportMap = BTreeMap::new();

    for brick in bricks.iter_mut() {
        // set up our graph from here
        holding_up.insert(brick.id, BTreeSet::new());
        sitting_on.insert(brick.id, BTreeSet::new());

        // move down until we find something below us
        let bricks_below = loop {
            // if we hit the ground, return nothing
            if brick.on_ground() {
                break vec![];
            }

            let bricks_below: Vec<usize> = brick
                .cubes
                .iter()
                .filter_map(|c| settled.get(&c.below()))
                .cloned()
                .collect();

            // if there are bricks below us, return their IDs
            if !bricks_below.is_empty() {
                break bricks_below;
            }

            brick.move_down();
        };

        // now that we dropped all the way, set the id where we landed
        settled.extend(brick.cubes.iter().map(|c| (*c, brick.id)));

        // set up the graph for each of the bricks
        for below in bricks_below {
            holding_up.entry(below).or_default().insert(brick.id);
            sitting_on.entry(brick.id).or_default().insert(below);
        }
    }

    (holding_up, sitting_on)
}

fn part1(input: &Input) -> usize {
    let (holding_up, sitting_on) = input;

    holding_up
        .iter()
        .filter(|(_brick, above)| above.iter().all(|a| sitting_on[&a].len() != 1))
        .count()
}

fn part2(input: &Input) -> usize {
    let (holding_up, sitting_on) = input;
    holding_up
        .iter()
        .map(|(brick, above)| {
            // start considering everything above us
            let mut queue: VecDeque<usize> = VecDeque::from_iter(above.iter().cloned());
            let mut unsupported: BTreeSet<usize> = BTreeSet::from_iter(vec![*brick]);

            while let Some(brick) = queue.pop_front() {
                // if all of the bricks that we're sitting on are unsupported
                if sitting_on[&brick].is_subset(&unsupported) {
                    // this one is unsupported, and consider the rest of the ones sitting on us
                    unsupported.insert(brick);
                    for b in &holding_up[&brick] {
                        queue.push_back(*b);
                    }
                }
            }

            // discount the original brick we put in the falling set to get the rest of it to work
            unsupported.len() - 1
        })
        .sum()
}


pub fn main() {
    let input = include_str!("../../../input/22.txt");
    let input = parse(input);

    println!("Part 1 : {}", part1(&input));
    println!("Part 2 : {}", part2(&input));
}