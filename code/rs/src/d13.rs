#![allow(clippy::must_use_candidate, clippy::missing_panics_doc, clippy::identity_op)]

fn find_reflection<T: Eq, F: Fn(&[T], &[T]) -> bool>(data: &[T], eq: F) -> usize {
    (1..data.len())
        .find(|&i| eq(&data[..i], &data[i..]))
        .unwrap_or_default()
}

fn solve<F: Fn(&[&str], &[&str]) -> bool>(lines: &[&str], eq: F) -> usize {
    let width = lines
        .iter()
        .map(|line| line.len())
        .max()
        .unwrap_or_default();
    let transpose = (0..width)
        .map(|i| {
            lines
                .iter()
                .flat_map(|line| line[i..i + 1].chars())
                .collect::<String>()
        })
        .collect::<Vec<_>>();
    let transpose = transpose.iter().map(|line| &line[..]).collect::<Vec<_>>();

    100 * find_reflection(lines, &eq) + find_reflection(&transpose, &eq)
}

pub fn part1(data: &str) -> usize {
    data.split("\n\n")
        .map(|group| {
            solve(&group.lines().collect::<Vec<_>>(), |x, y| {
                x.iter().rev().zip(y.iter()).all(|(a, b)| a == b)
            })
        })
        .sum()
}

pub fn part2(data: &str) -> usize {
    data.split("\n\n")
        .map(|group| {
            solve(&group.lines().collect::<Vec<_>>(), |x, y| {
                let mut iter = x
                    .iter()
                    .rev()
                    .zip(y.iter())
                    .flat_map(|(a, b)| a.chars().zip(b.chars()).filter(|(c, d)| c != d));
                iter.next().is_some() && iter.next().is_none()
            })
        })
        .sum()
}

pub fn main() {
    let input = std::fs::read_to_string("../../input/13.txt").expect("Input file not found");
    println!("Part 1 : {}", part1(&input));
    println!("Part 2 : {}", part2(&input));
}