#![allow(clippy::must_use_candidate, clippy::missing_panics_doc)]

#[allow(clippy::wildcard_imports)]
use aoc_2023::*;

fn main() {
    let mains = [
        d1::main,
        d2::main,
        d3::main,
        d4::main,
        d5::main,
        d6::main,
        d7::main,
        d8::main,
    ];

    let now = std::time::Instant::now();

    for (day, main) in mains.iter().enumerate() {
        println!(
            "------------------------------------ DAY {} ------------------------------------",
            day + 1
        );
        main();
        println!();
    }

    println!("------------------------------------  ALL   ------------------------------------");
    println!("Execution time: {:?}\n", now.elapsed());
}