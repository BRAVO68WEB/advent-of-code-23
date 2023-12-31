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
        d9::main,
        d10::main,
        d11::main,
        d12::main,
        d13::main,
        d14::main,
        d15::main,
        d16::main,
        d17::main,
        d18::main,
        d19::main,
        d20::main,
        d21::main,
        d22::main,
        d23::main,
        d24::main,
        d25::main,
    ];

    let now = std::time::Instant::now();

    for (day, main) in mains.iter().enumerate() {
        println!("-- Day {} --", day + 1);
        main();
        println!();
    }

    println!("Execution time: {:?}\n", now.elapsed());
}
