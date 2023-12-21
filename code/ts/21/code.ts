const input = await Bun.file(`${import.meta.dir}/../../../input/21.txt`).text();

function mod(a: number, b: number) {
	return a < 0 ? (b - (-a % b)) % b : a % b;
}
  
const dirs = [
	[-1, 0],
	[1, 0],
	[0, -1],
	[0, 1],
];

const part1 = (input: string) => {
	let positions : any = new Set();
	const map = input.split('\n').map((line, r) =>
	  line.split('').map((char, c) => {
		if (char === 'S') {
		  positions.add([r, c].join());
		}
		return +(char !== '#');
	  })
	);
  
	for (let i = 0; i < 64; i++) {
	  const nextPositions = new Set();
	  for (const p of positions) {
		const [r, c] = p.split(',').map(Number);
		for (const [dr, dc] of dirs) {
		  if (map[r + dr]?.[c + dc]) {
			nextPositions.add([r + dr, c + dc].join());
		  }
		}
	  }
	  positions = nextPositions;
	}

	return positions.size;
}

const part2 = (input: string) => {
	let positions : any = new Set();
	const map = input.split('\n').map((line, r) =>
		line.split('').map((char, c) => {
		if (char === 'S') {
			positions.add([r, c].join());
		}
		return +(char !== '#');
		})
	);
	const size = map.length;

	const target = 26501365;
	const counts = [];
	for (let i = 0; i < target; i++) {
		const nextPositions = new Set();
		for (const p of positions) {
		  const [r, c] = p.split(',').map(Number);
		  for (const [dr, dc] of dirs) {
			const r2 = r + dr;
			const c2 = c + dc;
			if (map[mod(r2, size)][mod(c2, size)]) {
			  nextPositions.add([r2, c2].join());
			}
		  }
		}	

		positions = nextPositions;
		if ((i + 1) % size === target % size) {
			if (
				counts.length >= 3 &&
				positions.size - 2 * counts.at(-1) + counts.at(-2) ===
				counts.at(-1) - 2 * counts.at(-2) + counts.at(-3)
			) {
				break;
			}
			counts.push(positions.size);
		}
	}

	const d2 = counts.at(-1) - 2 * counts.at(-2) + counts.at(-3);
	for (let i = counts.length * size + (target % size); i <= target; i += size) {
		counts.push(d2 + 2 * counts.at(-1) - counts.at(-2));
	}
	return counts.at(-1);
}

export const partone = part1(input);
export const parttwo = part2(input);