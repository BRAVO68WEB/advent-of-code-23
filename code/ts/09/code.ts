const pkg = await Bun.file(`${import.meta.dir}/package.json`).json();
const input = await Bun.file(`${import.meta.dir}/../../../input/9.txt`).text();

const solve = (ns: number[]): number =>
    ns.every((n) => n === 0)
        ? 0
        : ns[ns.length - 1] + solve(ns.slice(1).map((n, i) => n - ns[i]))

const parse = (input: string, reverse = false) =>
    input
        .trim()
        .split('\n')
        .map(
            (line) =>
                reverse
                    ? line
                        .trim()
                        .split(' ')
                        .map(Number)
                        .reverse()
                    : line
                        .trim()
                        .split(' ')
                        .map(Number),
        )

export const part1 = (input: string) => parse(input).map(solve).reduce((a, b) => a + b, 0)
export const part2 = (input: string) => parse(input, true).map(solve).reduce((a, b) => a + b, 0)

console.log("Day", pkg.name, "|", "Part 1 : ", part1(input));
console.log("Day", pkg.name, "|", "Part 2 : ", part2(input));
