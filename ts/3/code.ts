const pkg = await Bun.file(`${import.meta.dir}/package.json`).json();
const input = await Bun.file(`${import.meta.dir}/../../input/3.txt`).text();

const rows = input.trim().split("\n");
const height = rows.length;
const width = rows[0].length;

const isSymbol = (char: string) => !/[.\d]/.test(char);

const isAdjacent = (x: number, y: number) => {
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (
        nx >= 0 &&
        nx < width &&
        ny >= 0 &&
        ny < height &&
        isSymbol(rows[ny][nx])
      ) {
        return true;
      }
    }
  }
  return false;
};

const sumOfAllAdj = rows.reduce(
  (acc, row, y) =>
    [...row.matchAll(/\d+/g)].reduce((rowSum, match) => {
      const x = match.index || 0;
      for (let i = 0; i < match[0].length; i++)
        if (isAdjacent(x + i, y)) {
          return rowSum + parseInt(match[0]);
        }
      return rowSum;
    }, acc),
  0,
);

console.log("Day", pkg.name, "|", "Part 1 : ", sumOfAllAdj);


const isDigit = (char: string) => /\d/.test(char);

const getAdjacent = (x: number, y: number, pos: Set<string>) => {
	const partNumbers: number[] = [];
	for (let dx = -1; dx <= 1; dx++) {
		for (let dy = -1; dy <= 1; dy++) {
			if (dx === 0 && dy === 0) continue;
			const nx = x + dx;
			const ny = y + dy;
			if (
				nx >= 0 &&
				nx < width &&
				ny >= 0 &&
				ny < height &&
				isDigit(rows[ny][nx])
			) {
				let numStart = nx;
				while (numStart > 0 && isDigit(rows[ny][numStart - 1])) {
				numStart--;
				}

				const positionKey = `${ny},${numStart}`;
				if (pos.has(positionKey)) continue;

				const match = rows[ny].substring(numStart).match(/^\d+/);
				if (match) {
				partNumbers.push(parseInt(match[0]));
				pos.add(positionKey);
				}
			}
		}
	}

	return partNumbers;
};

const sumOfAdjOnly = rows.reduce((total, row, y) => {
	const pos = new Set<string>();
	return (
		total +
		row.split("").reduce((acc, char, x) => {
		if (char === "*") {
			const adjacentNums = getAdjacent(x, y, pos);
			if (adjacentNums.length === 2) {
			return acc + adjacentNums[0] * adjacentNums[1];
			}
		}
		return acc;
		}, 0)
	);
}, 0);
  
console.log("Day", pkg.name, "|", "Part 2 : ", sumOfAdjOnly);