const input = await Bun.file(`${import.meta.dir}/../../../input/21.txt`).text();

const parseInput = (input: string) => {
    let startXY: [number, number];
    const map = input
        .trim()
        .split("\n")
        .map((line, y) => {
            const cols = line.split("");
            for (let x = 0; x < cols.length; x++) {
                if (!startXY && cols[x] === "S") {
                    startXY = [x, y];
                    cols[x] = ".";
                }
            }
            return cols;
        });
    return { map, size: map.length, startXY: startXY! };
};

const neighborXYs = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
];
const toGrid = (x: number, y: number) => `${x}:${y}`;

function walk(
    map: string[][],
    xy: [number, number],
    endPlots: Map<string, number>,
    stepsLeft: number,
) {
    for (let n = 0; n < 4; n++) {
        const [nx, ny] = neighborXYs[n];
        const toX = xy[0] + nx;
        const toY = xy[1] + ny;
        if (toX < 0 || toY < 0 || toX === map.length || toY === map.length) continue;
        if (map[toY][toX] !== ".") continue;
        const nGrid = toGrid(toX, toY);
        const nextStepsLeft = stepsLeft - 1;
        if (nextStepsLeft % 2 === 0) {
            const endPlot = endPlots.get(nGrid);
            if (endPlot !== undefined && endPlot >= nextStepsLeft) continue;
            endPlots.set(nGrid, nextStepsLeft);
            if (nextStepsLeft === 0) continue;
        }
        walk(map, [toX, toY], endPlots, nextStepsLeft);
    }
}

function getPlots(map: string[][], xy: [number, number], steps: number) {
    const endPlots: Map<string, number> = new Map();
    walk(map, xy, endPlots, steps);
    return endPlots.size;
}

const part1 = (input: string): string | number => {
    const { map, size, startXY } = parseInput(input);
    const steps = size === 11 ? 6 : 64;
    return getPlots(map, startXY, steps);
};

const part2 = (input: string): string | number => {
    const { map, size, startXY } = parseInput(input);
    const steps = size === 5 ? 17 : 26501365;
    const stepsForEvenPlots = size === 5 ? 4 : 130; // yeah whatever
    const stepsForOddPlots = size === 5 ? 3 : 129;
    const mapReach = Math.floor(steps / size);
    const stepsToMiddleEdge = Math.floor(size / 2) + 1;
    const stepsToCorner = size + 1;
    const straightReach = Math.floor((steps - stepsToMiddleEdge) / size);
    const diagonalReach = Math.floor((steps - stepsToCorner) / size);
    const straightStepsLeft = steps - stepsToMiddleEdge - straightReach * size;
    const innerCornerStepsLeft = steps - stepsToCorner - (diagonalReach - 1) * size;
    const outerCornerStepsLeft = steps - stepsToCorner - diagonalReach * size;
    const westPlots = getPlots(map, [size - 1, startXY[1]], straightStepsLeft);
    const eastPlots = getPlots(map, [0, startXY[1]], straightStepsLeft);
    const southPlots = getPlots(map, [startXY[0], 0], straightStepsLeft);
    const northPlots = getPlots(map, [startXY[0], size - 1], straightStepsLeft);
    const straightPlots = westPlots + eastPlots + southPlots + northPlots;
    const innerNEplots = getPlots(map, [0, size - 1], innerCornerStepsLeft);
    const innerSEplots = getPlots(map, [0, 0], innerCornerStepsLeft);
    const innerNWplots = getPlots(map, [size - 1, size - 1], innerCornerStepsLeft);
    const innerSWplots = getPlots(map, [size - 1, 0], innerCornerStepsLeft);
    const innerCornerPlots = innerNEplots + innerSEplots + innerNWplots + innerSWplots;
    const outerNEplots = getPlots(map, [0, size - 1], outerCornerStepsLeft);
    const outerSEplots = getPlots(map, [0, 0], outerCornerStepsLeft);
    const outerNWplots = getPlots(map, [size - 1, size - 1], outerCornerStepsLeft);
    const outerSWplots = getPlots(map, [size - 1, 0], outerCornerStepsLeft);
    const outerCornerPlots = outerNEplots + outerSEplots + outerNWplots + outerSWplots;
    const evenMapPlots = getPlots(map, startXY, stepsForEvenPlots);
    const oddMapPlots = getPlots(map, startXY, stepsForOddPlots);
    let fullyMappedPlots = oddMapPlots;
    for (let i = 1; i <= mapReach - 1; i++) {
        const mapsInRing = i * 4;
        fullyMappedPlots += mapsInRing * (i % 2 === 0 ? oddMapPlots : evenMapPlots);
    }
    const outerDiagonalMaps = diagonalReach + 1;
    const innerDiagonalMaps = diagonalReach;
    return (
        fullyMappedPlots +
        straightPlots +
        outerCornerPlots * outerDiagonalMaps +
        innerCornerPlots * innerDiagonalMaps
    );
};

export const partone = part1(input);
export const parttwo = part2(input);
