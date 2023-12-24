#[derive(Debug, Copy, Clone, PartialEq, Eq, Hash)]
pub struct Point {
    pub x: i32,
    pub y: i32,
}
impl std::ops::Add for Point {
    type Output = Point;
    fn add(self, rhs: Self) -> Self::Output {
        Point {
            x: self.x + rhs.x,
            y: self.y + rhs.y,
        }
    }
}
impl std::ops::Mul<i32> for Point {
    type Output = Point;
    fn mul(self, rhs: i32) -> Self::Output {
        Point {
            x: self.x * rhs,
            y: self.y * rhs,
        }
    }
}
impl From<(i32, i32)> for Point {
    fn from(value: (i32, i32)) -> Self {
        Point {
            x: value.0,
            y: value.1,
        }
    }
}
pub struct CharGrid {
    pub grid: Vec<Vec<char>>,
}
impl CharGrid {
    pub fn new(chars: &str) -> CharGrid {
        CharGrid {
            grid: chars.lines().map(|x| x.chars().collect()).collect(),
        }
    }
    pub fn width(&self) -> i32 {
        self.grid[0].len() as i32
    }
    pub fn height(&self) -> i32 {
        self.grid.len() as i32
    }
    pub fn get(&self, point: Point) -> Option<char> {
        if point.x < 0 || point.y < 0 || point.x >= self.width() || point.y >= self.height() {
            return None;
        }
        Some(self.grid[point.y as usize][point.x as usize])
    }
}

#[derive(Copy, Clone, PartialEq, Eq, Hash, Debug)]
pub enum Dir {
    North,
    South,
    East,
    West,
}

use Dir::*;

impl Dir {
    pub fn opposite(&self) -> Dir {
        match self {
            North => South,
            South => North,
            East => West,
            West => East,
        }
    }
    pub fn deflect_slash(&self) -> Dir {
        match self {
            North => East,
            South => West,
            West => South,
            East => North,
        }
    }
    pub fn deflect_backslash(&self) -> Dir {
        match self {
            North => West,
            South => East,
            East => South,
            West => North,
        }
    }
    pub fn step(&self) -> Point {
        match self {
            North => (0, -1),
            South => (0, 1),
            East => (1, 0),
            West => (-1, 0),
        }
        .into()
    }
}
use std::collections::{HashMap, HashSet, VecDeque};

fn dir_from_char(ch: char) -> Option<Dir> {
    match ch {
        'v' => Some(South),
        '^' => Some(North),
        '>' => Some(East),
        '<' => Some(West),
        _ => None,
    }
}

fn point_in_bound(point: &Point, grid: &Vec<Vec<char>>) -> bool {
    point.x >= 0 && point.y >= 0 && point.y < grid.len() as i32 && point.x < grid[0].len() as i32
}

fn part1(input: &str) -> usize {
    let grid: Vec<Vec<char>> = input.lines().map(|line| line.chars().collect()).collect();
    let mut to_traverse: VecDeque<(usize, Point)> = vec![(0, (1, 0).into())].into();
    let mut finished_paths: Vec<usize> = vec![];
    while let Some((mut dist, mut point)) = to_traverse.pop_front() {
        let mut prev = (0, 0).into();
        let mut changed = true;
        while changed {
            changed = false;
            for dir in [North, South, East, West] {
                let new_point = point + dir.step();
                if new_point == prev || !point_in_bound(&new_point, &grid) {
                    continue;
                }
                if point == (grid[0].len() as i32 - 2, grid.len() as i32 - 1).into() {
                    finished_paths.push(dist);
                    break;
                }
                let ch = grid[new_point.y as usize][new_point.x as usize];
                if ch == '.' {
                    prev = point;
                    point = new_point;
                    dist += 1;
                    changed = true;
                }
                let slope = dir_from_char(ch);
                if slope == Some(dir) {
                    to_traverse.push_back((dist + 2, new_point + dir.step()));
                }
            }
        }
    }
    *finished_paths.iter().max().unwrap()
}

fn get_vertices(grid: &Vec<Vec<char>>) -> HashSet<Point> {
    let mut vertices: HashSet<Point> = HashSet::new();
    for y in 1..(grid.len() as i32 - 1) {
        for x in 1..(grid[0].len() as i32 - 1) {
            if grid[y as usize][x as usize] == '#' {
                continue;
            }
            let forks = [North, South, East, West]
                .iter()
                .filter(|dir| {
                    let looking_at: Point = Point::from((x, y)) + dir.step();
                    grid[looking_at.y as usize][looking_at.x as usize] != '#'
                })
                .count();
            if forks > 2 {
                vertices.insert((x, y).into());
            }
        }
    }
    vertices.insert((1, 0).into());
    vertices.insert((grid[0].len() as i32 - 2, grid.len() as i32 - 1).into());
    vertices
}

fn get_undirected_graph(
    grid: &Vec<Vec<char>>,
    vertices: &HashSet<Point>,
) -> HashMap<Point, Vec<(usize, Point)>> {
    let mut edges: HashMap<Point, Vec<(usize, Point)>> = HashMap::new();
    for vertex in vertices.iter() {
        edges.insert(*vertex, vec![]);
    }
    for vertex in vertices.iter() {
        for dir in [North, South, East, West] {
            let mut point = *vertex + dir.step();
            let mut dist = 1;
            if !point_in_bound(&point, &grid) || grid[point.y as usize][point.x as usize] != '.' {
                continue;
            }
            let mut prev = *vertex;
            while vertices.get(&point).is_none() {
                for dir in [North, South, East, West] {
                    let new_point = point + dir.step();

                    if !point_in_bound(&new_point, &grid)
                        || new_point == prev
                        || grid[new_point.y as usize][new_point.x as usize] == '#'
                    {
                        continue;
                    }
                    prev = point;
                    point = new_point;
                    dist += 1;
                    break;
                }
            }
            if *vertex == point {
                continue;
            }
            edges.get_mut(&vertex).unwrap().push((dist, point));
        }
    }
    edges
}

fn max_depth_first(
    cur: Point,
    destination: &Point,
    edges: &HashMap<Point, Vec<(usize, Point)>>,
    visited: &mut HashSet<Point>,
) -> usize {
    if *destination == cur {
        return 0;
    }
    visited.insert(cur);
    let mut max = 0;
    for (dist, point) in edges.get(&cur).unwrap().iter() {
        if visited.get(&point).is_some() {
            continue;
        }
        let total_dist = max_depth_first(*point, destination, edges, visited) + dist;
        if total_dist > max {
            max = total_dist;
        }
    }
    visited.remove(&cur);
    max
}

fn part2(input: &str) -> usize {
    let grid: Vec<Vec<char>> = input
        .lines()
        .map(|line| {
            line.chars()
                .map(|x| match x {
                    '#' => '#',
                    _ => '.',
                })
                .collect()
        })
        .collect();
    let vertices = get_vertices(&grid);
    let edges = get_undirected_graph(&grid, &vertices);
    max_depth_first(
        (1, 0).into(),
        &(grid[0].len() as i32 - 2, grid.len() as i32 - 1).into(),
        &edges,
        &mut HashSet::new(),
    )
}

pub fn main() {
    let input: String =
        std::fs::read_to_string("../../input/23.txt").expect("Input file not found");
    println!("Part 1 : {}", part1(&input));
    println!("Part 2 : {}", part2(&input));
}
