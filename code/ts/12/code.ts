const pkg = await Bun.file(`${import.meta.dir}/package.json`).json();
const input = await Bun.file(`${import.meta.dir}/../../../input/12.txt`).text();

export const loopSum = <T>(map: (n: T) => number, arr: T[]) => {
	let sum = 0
	for (const element of arr) {
	  sum += map(element)
	}
	return sum
}

export const memoize = <Args extends unknown[], Return>(
	fn: (...args: Args) => Return,
  ): ((...args: Args) => Return) => {
	const cache = new Map<string, Return>()
	return (...args) => {
	  const key = JSON.stringify(args)
	  if (!cache.has(key)) cache.set(key, fn(...args))
	  return cache.get(key)!
	}
}

export const solver = (input: string, n: number) => {
  const calculateVariants = memoize((row: string, groups: number[]): number => {
    if (row.startsWith('.')) return calculateVariants(row.slice(1), groups)

    if (groups.length === 0) {
      return row.indexOf('#') === -1 ? 1 : 0
    }

	let sum = 0
	for (const element of groups) {
			  sum += element
	}
	if (row.length < sum + groups.length - 1) {
		return 0
	}

    if (row.startsWith('#')) {
      const [groupSize, ...remainingGroups] = groups
      if (row.slice(0, groupSize).indexOf('.') !== -1) return 0
      if (row[groupSize] === '#') {
        return 0
      }
      return calculateVariants(row.slice(groupSize + 1), remainingGroups)
    }

    const nextSlice = row.slice(1)
    return (
      calculateVariants('#' + nextSlice, groups) +
      calculateVariants('.' + nextSlice, groups)
    )
  })

  return loopSum((line) => {
    const [str, nums] = line.trim().split(' ')
    const record = Array.from({ length: n }).fill(str).join('?')
    const groups = Array.from({ length: n })
      .fill(nums)
      .join(',')
      .split(',')
      .map(Number)
    return calculateVariants(record, groups)
  }, input.trim().split('\n'))
}

const part1 = (input: string) => solver(input, 1)
const part2 = (input: string) => solver(input, 5)

export const partone = part1(input);
export const parttwo = part2(input);

