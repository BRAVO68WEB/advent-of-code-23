const input = await Bun.file(`${import.meta.dir}/../../../input/11.txt`).text();

const parseInput = (input: string, part2 = false) => {
  const expansion = part2 ? 1000000 - 1 : 1;
  const galaxies: Galaxy[] = [];
  const rows = input.trim().split("\n");
  let expandX = 0;
  const xExpands: number[] = [];
  for (let x = 0; x < rows[0].length; x++) {
    if (!rows.some((row) => row[x] === "#")) {
      expandX += expansion;
    }
    xExpands[x] = expandX;
  }
  let expandY = 0;
  rows.forEach((row, y) => {
    if (!row.includes("#")) {
      expandY += expansion;
    } else {
      for (let x = 0; x < row.length; x++) {
        const char = row[x];
        if (char === "#") {
          galaxies.push({ x: x + xExpands[x], y: y + expandY });
        }
      }
    }
  });
  return galaxies;
};

type Galaxy = { x: number; y: number };

const galaxyPathName = (g1: number, g2: number) => {
  const galaxies = g1 > g2 ? [g2, g1] : [g1, g2];
  return galaxies.join(">");
};

function getTotalGalaxyDistance(galaxies: Galaxy[]) {
  const paths: Set<string> = new Set();
  let totalDistance = 0;
  for (let g1 = 0; g1 < galaxies.length; g1++) {
    const galaxy1 = galaxies[g1];
    for (let g2 = 0; g2 < galaxies.length; g2++) {
      if (g2 === g1) continue;
      const pathName = galaxyPathName(g1, g2);
      if (paths.has(pathName)) continue;
      paths.add(pathName);
      const galaxy2 = galaxies[g2];
      const distance =
        Math.abs(galaxy2.x - galaxy1.x) + Math.abs(galaxy2.y - galaxy1.y);
      totalDistance += distance;
    }
  }
  return totalDistance;
}

const part1 = (input: string): string | number => {
  return getTotalGalaxyDistance(parseInput(input));
};

const part2 = (input: string): string | number => {
  return getTotalGalaxyDistance(parseInput(input, true));
};

export const partone = part1(input);
export const parttwo = part2(input);
