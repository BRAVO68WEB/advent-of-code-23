const input = await Bun.file(`${import.meta.dir}/../../../input/16.txt`).text();

type Direction = "up" | "down" | "left" | "right";

interface Beam {
  row: number;
  col: number;
  dir: Direction;
}

type Tile = {
  type: string;
  energized: boolean;
  passedDirs: Direction[];
};

export function parser(input: string[]) {
  return input.map((line) =>
    line.split("").map((c) => ({ type: c, energized: false, passedDirs: [] })),
  );
}

const solve = (tiles: Tile[][], beam: Beam) => {
  const tile = tiles[beam.row]?.[beam.col];
  if (tile === undefined) return;
  if (tile.passedDirs.includes(beam.dir)) return;

  tile.energized = true;
  tile.passedDirs.push(beam.dir);

  if (tile.type === ".") {
    switch (beam.dir) {
      case "up":
        beam.row--;
        break;
      case "down":
        beam.row++;
        break;
      case "left":
        beam.col--;
        break;
      case "right":
        beam.col++;
        break;
    }
  } else if (tile.type === "/") {
    switch (beam.dir) {
      case "up":
        beam.dir = "right";
        beam.col++;
        break;
      case "down":
        beam.dir = "left";
        beam.col--;
        break;
      case "left":
        beam.dir = "down";
        beam.row++;
        break;
      case "right":
        beam.dir = "up";
        beam.row--;
        break;
    }
  } else if (tile.type === "\\") {
    switch (beam.dir) {
      case "up":
        beam.dir = "left";
        beam.col--;
        break;
      case "down":
        beam.dir = "right";
        beam.col++;
        break;
      case "left":
        beam.dir = "up";
        beam.row--;
        break;
      case "right":
        beam.dir = "down";
        beam.row++;
        break;
    }
  } else if (tile.type === "-") {
    switch (beam.dir) {
      case "up":
      case "down":
        const beam2 = { ...beam };

        beam.dir = "left";
        beam.col = beam2.col - 1;
        solve(tiles, beam);

        beam2.dir = "right";
        beam2.col = beam2.col + 1;
        solve(tiles, beam2);

        return;
      case "left":
        beam.col--;
        break;
      case "right":
        beam.col++;
        break;
    }
  } else if (tile.type === "|") {
    switch (beam.dir) {
      case "left":
      case "right":
        const beam2 = { ...beam };

        beam.dir = "up";
        beam.row = beam2.row - 1;
        solve(tiles, beam);

        beam2.dir = "down";
        beam2.row = beam2.row + 1;
        solve(tiles, beam2);

        return;
      case "up":
        beam.row--;
        break;
      case "down":
        beam.row++;
        break;
    }
  }

  solve(tiles, beam);
};

export function part1(tiles: Tile[][]) {
  const beam: Beam = { row: 0, col: 0, dir: "right" };
  solve(tiles, beam);

  return tiles.flat(1).filter((t) => t.energized).length;
}

const getCombinations = (rows: number, cols: number) => {
  const beams: Beam[] = [];

  for (let row = 0; row < rows; row++) {
    beams.push({ row, col: 0, dir: "right" });
    beams.push({ row, col: cols - 1, dir: "left" });
  }

  for (let col = 0; col < cols; col++) {
    beams.push({ row: 0, col, dir: "down" });
    beams.push({ row: rows - 1, col, dir: "up" });
  }

  return beams;
};

export function part2(tiles: Tile[][]) {
  const beams = getCombinations(tiles.length, tiles[0].length);
  let max = 0;

  for (const beam of beams) {
    solve(tiles, beam);

    const energized = tiles.flat(1).filter((t) => t.energized).length;
    if (energized > max) max = energized;

    tiles.flat(1).forEach((t) => {
      t.energized = false;
      t.passedDirs = [];
    });
  }

  return max;
}

const parsedInput = parser(input.split("\n"));

export const partone = part1(parsedInput);
export const parttwo = part2(parsedInput);
