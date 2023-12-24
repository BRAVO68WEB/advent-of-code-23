use eqsolver::multivariable::MultiVarNewton;
use nalgebra::{SMatrix, SVector};

fn num_list(string: &str) -> Vec<f64> {
    string
        .split(", ")
        .map(|num| num.trim().parse().unwrap())
        .collect()
}

fn part1(input: &str, min_dist: f64, max_dist: f64) -> usize {
    let mut rocks: Vec<((f64, f64), (f64, f64))> = vec![];
    for line in input.lines() {
        let pos: Vec<f64> = num_list(line.split(" @ ").nth(0).unwrap());
        let vel: Vec<f64> = num_list(line.split(" @ ").nth(1).unwrap());
        rocks.push(((pos[0], pos[1]), (vel[0], vel[1])));
    }
    let mut intersecting = 0;
    for i in 0..rocks.len() {
        for j in i..rocks.len() {
            let (x0i, y0i) = rocks[i].0;
            let (vxi, vyi) = rocks[i].1;
            let (x0j, y0j) = rocks[j].0;
            let (vxj, vyj) = rocks[j].1;
            let denom = vxi * vyj - vyi * vxj;
            if denom == 0. {
                continue;
            }
            let t1 = (vxi * (y0i - y0j) + vyi * (x0j - x0i)) / denom;
            let x_inter = x0j + vxj * t1;
            let y_inter = y0j + vyj * t1;
            let t0 = if vxi == 0. {
                (x0j - x0i + vxj * t1) / vxi
            } else {
                (y0j - y0i + vyj * t1) / vyi
            };
            if t1 < 0. {
                continue;
            }
            if t0 < 0. {
                continue;
            }
            if x_inter < min_dist || x_inter > max_dist {
                continue;
            }
            if y_inter < min_dist || y_inter > max_dist {
                continue;
            }
            intersecting += 1;
        }
    }
    intersecting
}
fn part2(input: &str, center: f64, scale: f64) -> usize {
    let mut rocks: Vec<((f64, f64, f64), (f64, f64, f64))> = vec![];
    for line in input.lines() {
        let pos: Vec<f64> = num_list(line.split(" @ ").nth(0).unwrap());
        let vel: Vec<f64> = num_list(line.split(" @ ").nth(1).unwrap());
        rocks.push((
            (
                (pos[0] - center) / scale,
                (pos[1] - center) / scale,
                (pos[2] - center) / scale,
            ),
            (vel[0], vel[1], vel[2]),
        ));
    }

    let guesses: std::cell::RefCell<Vec<f64>> = std::cell::RefCell::new(vec![]);
    let func = |v: SVector<f64, 9>| {
        guesses
            .borrow_mut()
            .push(v[0] * scale + v[1] * scale + v[2] * scale + center * 3.);
        SVector::<f64, 9>::from([
            v[0] + v[3] * v[6] - rocks[0].0 .0 - rocks[0].1 .0 * v[6],
            v[1] + v[4] * v[6] - rocks[0].0 .1 - rocks[0].1 .1 * v[6],
            v[2] + v[5] * v[6] - rocks[0].0 .2 - rocks[0].1 .2 * v[6],
            v[0] + v[3] * v[7] - rocks[1].0 .0 - rocks[1].1 .0 * v[7],
            v[1] + v[4] * v[7] - rocks[1].0 .1 - rocks[1].1 .1 * v[7],
            v[2] + v[5] * v[7] - rocks[1].0 .2 - rocks[1].1 .2 * v[7],
            v[0] + v[3] * v[8] - rocks[2].0 .0 - rocks[2].1 .0 * v[8],
            v[1] + v[4] * v[8] - rocks[2].0 .1 - rocks[2].1 .1 * v[8],
            v[2] + v[5] * v[8] - rocks[2].0 .2 - rocks[2].1 .2 * v[8],
        ])
    };
    let jac = |v: SVector<f64, 9>| {
        let mut mat = SMatrix::<f64, 9, 9>::from([
            [1., 0., 0., v[6], 0., 0., v[3] - rocks[0].1 .0, 0., 0.],
            [0., 1., 0., 0., v[6], 0., v[4] - rocks[0].1 .1, 0., 0.],
            [0., 0., 1., 0., 0., v[6], v[5] - rocks[0].1 .2, 0., 0.],
            [1., 0., 0., v[7], 0., 0., 0., v[3] - rocks[1].1 .0, 0.],
            [0., 1., 0., 0., v[7], 0., 0., v[4] - rocks[1].1 .1, 0.],
            [0., 0., 1., 0., 0., v[7], 0., v[5] - rocks[1].1 .2, 0.],
            [1., 0., 0., v[8], 0., 0., 0., 0., v[3] - rocks[2].1 .0],
            [0., 1., 0., 0., v[8], 0., 0., 0., v[4] - rocks[2].1 .1],
            [0., 0., 1., 0., 0., v[8], 0., 0., v[5] - rocks[2].1 .2],
        ]);
        mat.transpose_mut();
        mat
    };
    let _solution = MultiVarNewton::new(func, jac)
        .with_itermax(100)
        .with_tol(0.)
        .solve(SVector::<f64, 9>::from([
            1., 9., 3., 100., 101., 102., 1., 4., 3.,
        ]));

    let count = guesses.borrow().len();
    let sum = guesses.borrow().iter().skip(count / 2).sum::<f64>();
    (sum / (count - count / 2) as f64) as usize
}

pub fn main() {
    let input: &str = include_str!("../../../input/24.txt");
    println!(
        "Part 1 : {}",
        part1(input, 200000000000000., 400000000000000.)
    );
    println!(
        "Part 2 : {}",
        part2(input, 200000000000000., 10000000000000.)
    );
}
