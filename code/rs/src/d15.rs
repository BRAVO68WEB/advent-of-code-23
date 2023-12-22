#![allow(
    clippy::must_use_candidate,
    clippy::missing_panics_doc,
    clippy::identity_op
)]
use itertools::Itertools;

pub fn part1(data: &str) -> u32 {
    data.lines()
        .flat_map(|line| line.split(','))
        .map(|step| u32::from(hash(step)))
        .sum()
}

fn parse(input: &str) -> Vec<(&str, Option<u32>)> {
    let mut out = Vec::new();

    for i in input.trim().split(',') {
        let (label, focal_len) = i.split(['=', '-'].as_ref()).collect_tuple().unwrap();
        out.push((label, focal_len.parse::<u32>().ok()));
    }

    out
}

fn hash(input: &str) -> u8 {
    let mut out = 0u8;
    for c in input.chars() {
        out = out.wrapping_add(c as u8).wrapping_mul(17);
    }

    out
}

fn part2(input: &str) -> usize {
    let input = parse(input);
    let mut boxes = vec![Vec::new(); 256];

    for (label, focal_len) in input {
        let key = hash(label) as usize;
        if let Some(focal_len) = focal_len {
            if let Some((_, e)) = boxes[key]
                .iter_mut()
                .find(|x: &&mut (&str, u32)| x.0 == label)
            {
                *e = focal_len;
            } else {
                boxes[key].push((label, focal_len));
            }
        } else {
            boxes[key].retain(|x| x.0 != label);
        }
    }

    let mut acc: usize = 0;
    for (i, e) in boxes.iter().enumerate() {
        for (j, f) in e.iter().enumerate() {
            acc += (i + 1) * (j + 1) * f.1 as usize;
        }
    }
    // return as integer
    acc
}

pub fn main() {
    let input = std::fs::read_to_string("../../input/15.txt").expect("Input file not found");
    println!("Part 1 : {}", part1(&input));
    println!("Part 2 : {}", part2(&input).to_string());
}
