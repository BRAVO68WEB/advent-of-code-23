const input = await Bun.file(`${import.meta.dir}/../../../input/13.txt`).text();

export const loopSum = <T>(map: (n: T) => number, arr: T[]) => {
	let sum = 0
	for (const element of arr) {
	  sum += map(element)
	}
	return sum
}

const vertical = (
  input: string[],
  ignore: number | null,
  i: number | null,
): number | null => {
  if (input.length === 0) return i
  const [f, ...r] = input
  if (i === null) {
    for (let j = 0; j < f.length - 1; ++j) {
      if (j === ignore) continue
      const o = vertical(input, ignore, j)
      if (o !== null) return o
    }
    return null
  } else {
    const a = f.slice(0, i + 1)
    const b = f
      .slice(i + 1, input[0].length)
      .split('')
      .reverse()
      .join('')

    return a.endsWith(b) || b.endsWith(a) ? vertical(r, ignore, i) : null
  }
}

const rotate = (input: string[]): string[] =>
  Array.from({ length: input[0].length + 1 }, (_, i) =>
    input.map((l) => l[input[0].length - i]).join(''),
  ).filter((v) => v.length > 0)

const parse = (input: string) =>
  input
    .trim()
    .split('\n\n')
    .map((p) =>
      p
        .trim()
        .split('\n')
        .map((l) => l.trim()),
    )

export const part1 = (input: string) => {
  const patterns = parse(input)

  return loopSum((p) => {
    const v = vertical(p, null, null)
    if (v !== null) return v + 1
    const h = vertical(rotate(p), null, null)!
    return (h + 1) * 100
  }, patterns)
}

export const part2 = (input: string) => {
  const patterns = parse(input)

  return loopSum((p) => {
    const originalV = vertical(p, null, null)
    const originalH = vertical(rotate(p), null, null)
    
    for (let y = 0; y < p.length; ++y) {
      for (let x = 0; x < p[y].length; ++x) {
        const clone = [...p]
        clone[y] =
          clone[y].slice(0, x) +
          (clone[y][x] === '.' ? '#' : '.') +
          clone[y].slice(x + 1)

        const v = vertical(clone, originalV, null)
        if (v !== null && v !== originalV) return v + 1
        const h = vertical(rotate(clone), originalH, null)
        if (h !== null && h !== originalH) return (h + 1) * 100
      }
    }

    return 0
  }, patterns)
}


export const partone = part1(input);
export const parttwo = part2(input);

