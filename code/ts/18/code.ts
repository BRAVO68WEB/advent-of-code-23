const input = await Bun.file(`${import.meta.dir}/../../../input/18.txt`).text();

const parse = (input: string, mode: 'normal' | 'colour') =>
  input
    .trim()
    .split('\n')
    .map((l) => {
      const [dir, steps, colour] = RegExp(rgx).exec(l)!.slice(1)
      switch (mode) {
        case 'normal':
          return { dir, steps: Number(steps) }
        case 'colour':
          return {
            dir: ['R', 'D', 'L', 'U'][Number(colour[5])],
            steps: parseInt(colour.slice(0, 5), 16),
          }
      }
})

const rgx = /(\w) (\d+) \(#([\w\d]+)\)/
const solve = (ins: ReturnType<typeof parse>) => {
  const xs: number[] = [0]
  const ys: number[] = [0]
  for (let i = 0; i < ins.length - 1; ++i) {
    const { dir, steps } = ins[i]
    xs.push(
      xs[xs.length - 1] + (dir === 'R' ? steps : dir === 'L' ? -steps : 0),
    )
    ys.push(
      ys[ys.length - 1] + (dir === 'U' ? steps : dir === 'D' ? -steps : 0),
    )
  }

  let missedCells = 0
  for (let i = 0; i < xs.length; ++i) {
    const a = [xs[i], ys[i]]
    const b = [xs[(i + 1) % xs.length], ys[(i + 1) % xs.length]]
    const c = [xs[(i + 2) % xs.length], ys[(i + 2) % xs.length]]
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]

    if (dx < 0 && dy === 0) {
      missedCells += -dx + 1
      if (c[1] < b[1]) missedCells--
    } else if (dy > 0) {
      missedCells += dy
      if (c[0] < b[0]) missedCells--
    }
  }

  const n = xs.length
  const area: number =
    0.5 *
    Math.abs(
      xs.reduce(
        (acc, val, i) =>
          acc + (val * ys[(i + 1) % n] - xs[(i + 1) % n] * ys[i]),
        0,
      ) +
        (xs[n - 1] * ys[0] - xs[0] * ys[n - 1]),
    )

  return area + missedCells
}

const part1 = (input: string) => solve(parse(input, 'normal'))
const part2 = (input: string) => solve(parse(input, 'colour'))

export const partone = part1(input);
export const parttwo = part2(input);