const pkg = await Bun.file(`${import.meta.dir}/package.json`).json();
const input = await Bun.file(`${import.meta.dir}/../../../input/10.txt`).text();

type Point = [number, number]

const distancePointToLine = (
  point: Point,
  start: Point,
  end: Point,
): number => {
  const [x, y] = point
  const [x1, y1] = start
  const [x2, y2] = end
  const numerator = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1)
  const denominator = Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2)
  return numerator / denominator
}

export const douglasPeucker = (points: Point[], epsilon: number): Point[] => {
    if (points.length <= 2) return points

    let dmax = 0
    let index = 0
    const start = points[0]
    const end = points[points.length - 1]

    for (let i = 1; i < points.length - 1; i++) {
        const d = distancePointToLine(points[i], start, end)
        if (d > dmax) {
            index = i
            dmax = d
        }
    }

    if (dmax > epsilon) {
        const recursiveResult1 = douglasPeucker(points.slice(0, index + 1), epsilon)
        const recursiveResult2 = douglasPeucker(points.slice(index), epsilon)

        const result = recursiveResult1.slice(0, -1).concat(recursiveResult2)
        return result
    } else {
        return [start, end]
    }
}

export const isInside = (vertices: Point[], x: number, y: number) => {
    let inside = false
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
        const [xi, yi] = vertices[i]
        const [xj, yj] = vertices[j]

        const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi

        if (intersect) inside = !inside
    }
    return inside
}

const parse = (input: string) => {
  const list = input.trim().split('\n')
  return list.map((row) => row.trim().split(''))
}

const toGrid = (list: string[][]) => {
  const map = new Map<string, string>()
  list.forEach((row, y) => {
    row.forEach((col, x) => {
      map.set(`${x},${y}`, col)
    })
  })
  return map
}

const findStart = (grid: Map<string, string>): XY => {
  for (const [xy, value] of grid.entries()) {
    if (value === 'S') return xy.split(',').map(Number) as [number, number]
  }
  throw new Error('No start found')
}

const UP: XY = [0, -1]
const DOWN: XY = [0, 1]
const LEFT: XY = [-1, 0]
const RIGHT: XY = [1, 0]

const cardinals: XY[] = [UP, DOWN, LEFT, RIGHT]

const dirs: Record<string, XY[] | undefined> = {
  '|': [UP, DOWN],
  '-': [LEFT, RIGHT],
  J: [UP, LEFT],
  L: [UP, RIGHT],
  '7': [DOWN, LEFT],
  F: [DOWN, RIGHT],
}

type XY = [number, number]

export const getPath = (input: string) => {
    const list = parse(input)
    const grid = toGrid(list)
    const start = findStart(grid)

    const startingPoints = cardinals
        .map<XY>(([dx, dy]) => [start[0] + dx, start[1] + dy])
        .filter(([x, y]) => (grid.get(`${x},${y}`) || '.') !== '.')

    for (const element of startingPoints) {
            const sp = element
            const visited = new Set<string>([start.join(',')])
            const path = [start, sp]

            while (true) {
                const [x, y] = path[path.length - 1]!
                const key = `${x},${y}`
                const next = grid.get(key)
                if (next === 'S') return path.slice(0, -1)
                if (!next) break
                const nextDirs = dirs[next]
                if (!nextDirs) break
                visited.add(key)
                const nextDir = nextDirs.find(([dx, dy]) => {
                    const [nx, ny] = [x + dx, y + dy]
                    const nextKey = `${nx},${ny}`
                    return (
                    (path.length > 3 && grid.get(nextKey) === 'S') ||
                    !visited.has(nextKey)
                    )
                })
                if (!nextDir) break
                const nx = x + nextDir[0]
                const ny = y + nextDir[1]
                path.push([nx, ny])
            }
    }

    return null
}

export const part1 = (input: string) => getPath(input)!.length / 2

export const part2 = (input: string) => {
  const path = getPath(input)!
  const optimalPolygon = douglasPeucker(path, 0)

  let [minX, minY, maxX, maxY] = [Infinity, Infinity, -Infinity, -Infinity]
  path.forEach(([x, y]) => {
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
  })

  const walls = new Set<string>()
  path.forEach(([x, y]) => walls.add(`${x},${y}`))

  let sum = 0
  for (let y = minY + 1; y < maxY; ++y) {
    for (let x = minX + 1; x < maxX; ++x) {
      if (walls.has(`${x},${y}`)) continue
      if (isInside(optimalPolygon, x, y)) sum++
    }
  }

  return sum
}

console.log("Day", pkg.name, "|", "Part 1 : ", part1(input));
console.log("Day", pkg.name, "|", "Part 2 : ", part2(input));
