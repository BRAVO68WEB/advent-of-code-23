use std::collections::HashMap;
use std::collections::HashSet;

fn parse_graph(input: &str) -> HashMap<&str, Vec<&str>> {
    let mut conns: HashMap<&str, Vec<&str>> = HashMap::new();
    for line in input.lines() {
        let start = line.split(": ").nth(0).unwrap();
        if conns.get(start).is_none() {
            conns.insert(start, vec![]);
        }
        for other in line.split(": ").nth(1).unwrap().split(" ") {
            match conns.get_mut(other) {
                Some(vec) => {
                    vec.push(start);
                }
                None => {
                    conns.insert(other, vec![start]);
                }
            }
            conns.get_mut(start).unwrap().push(other);
        }
    }
    conns
}

fn depth_first_search<'a>(
    graph: &HashMap<&'a str, Vec<&'a str>>,
    excluded: &mut HashSet<(&'a str, &'a str)>,
    source: &'a str,
    dest: &'a str,
) -> bool {
    let mut visited: HashSet<&str> = HashSet::new();
    let mut stack: Vec<&str> = vec![];
    let mut back: HashMap<&str, &str> = HashMap::new();
    stack.push(source);
    while let Some(cur) = stack.pop() {
        if !visited.insert(cur) {
            continue;
        }
        for neighbor in graph.get(cur).unwrap().iter() {
            if visited.get(neighbor).is_some() {
                continue;
            }
            if excluded.get(&(cur, *neighbor)).is_some()
                || excluded.get(&(*neighbor, cur)).is_some()
            {
                continue;
            }
            back.insert(neighbor, cur);
            stack.push(neighbor);
            if *neighbor == dest {
                let mut out: Vec<&str> = vec![];
                out.push(neighbor);
                let mut cur = *neighbor;
                while let Some(node) = back.get(cur) {
                    excluded.insert((node, cur));
                    cur = node;
                }
                return true;
            }
        }
    }
    return false;
}

fn is_same_set(graph: &HashMap<&str, Vec<&str>>, source: &str, dest: &str) -> bool {
    let mut removed_edges: HashSet<(&str, &str)> = HashSet::new();
    let mut count = 0;
    while depth_first_search(graph, &mut removed_edges, source, dest) {
        count += 1;
        if count == 4 {
            return true;
        }
    }
    return false;
}

fn part1(input: &str) -> usize {
    let graph = parse_graph(input);
    let vertices: Vec<&str> = graph.keys().map(|x| *x).collect();
    let mut set1: Vec<&str> = Vec::new();
    set1.push(vertices[0]);
    let mut j = 0;
    while j < set1.len() {
        if j == 5 {
            break;
        }

        for i in 1..vertices.len() {
            if set1.iter().find(|x| **x == vertices[i]).is_some() {
                continue;
            }
            let same = is_same_set(&graph, set1[j], vertices[i]);
            if same {
                set1.push(vertices[i]);
            }
        }
        j += 1;
    }
    set1.len() * (graph.len() - set1.len())
}

pub fn main() {
    let input: &str = include_str!("../../../input/25.txt");
    println!("Part 1 : {}", part1(input,));
    println!("Part 2 : {}", "Merry Christmas!");
}
