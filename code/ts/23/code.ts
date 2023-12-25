const input = await Bun.file(`${import.meta.dir}/../../../input/23.txt`).text();

const data = input.split("\n");

import {
    XY,
    inMatrix,
    matrixFromFile,
    matrixGet,
    matrixFindElements,
    matrixSet,
    matrixClone,
    matrixMaxX,
    matrixMaxY,
    xydirections,
    xykey,
    matrixRight,
    matrixLeft,
    matrixUp,
    matrixDown,
    xyequal,
} from "./matrix.ts";
import { findPathsFlexi } from "./path.ts";

const matrix = matrixFromFile(data);

const start = [1, 0] as XY;
const target = [matrixMaxX(matrix) - 1, matrixMaxY(matrix)] as XY;

const itFinder = findPathsFlexi<[XY, string[]]>({
    startNodes: [[start, []]],
    endCondition: ([pos]) => xyequal(pos, target),
    nextMovesFn: ([pos, path]) => {
        path.push(xykey(pos));
        switch (matrixGet(matrix, pos)) {
            case ">":
                return [[matrixRight(pos), [...path]]];
            case "v":
                return [[matrixDown(pos), [...path]]];
            case "<":
                return [[matrixLeft(pos), [...path]]];
            case "^":
                return [[matrixUp(pos), [...path]]];
        }
        return xydirections(pos).map(dir => [dir, [...path]]);
    },
    isValidMoveFn: ([[x, y], path]) =>
        inMatrix(matrix, [x, y]) &&
        matrixGet(matrix, [x, y]) !== "#" &&
        !path.includes(xykey([x, y])),
});

let max1 = 0;
for (const v of itFinder) {
    if (v.finalCost > max1) max1 = v.finalCost;
}

const part1 = (): number => {
    return max1;
};

matrixFindElements(matrix, { predicate: v => v !== "#" && v !== "." }).forEach(([pos]) =>
    matrixSet(matrix, pos, "."),
);

const crossings = {} as Record<
    string,
    {
        pos: XY;
        paths: Record<string, number>;
    }
>;

const dots = matrixFindElements(matrix, { value: "." });
for (const [pos] of dots) {
    const neigs = xydirections(pos)
        .map(np => matrixGet(matrix, np))
        .filter(v => v === ".");
    if (neigs.length > 2) crossings[xykey(pos)] = { pos, paths: {} };
}
crossings[xykey(start)] = { pos: start, paths: {} };
crossings[xykey(target)] = { pos: target, paths: {} };

const m2 = matrixClone(matrix);
Object.values(crossings).forEach(({ pos }) => matrixSet(m2, pos, "X"));

for (const crossing of Object.values(crossings)) {
    const xpos = crossing.pos;
    const neigs = xydirections(xpos);
    for (const strt of neigs) {
        if (matrixGet(m2, strt) !== ".") continue;

        const itFinder = findPathsFlexi<XY>({
            startNodes: [strt],
            endCondition: pos => matrixGet(m2, pos) === "X",
            nextMovesFn: pos => xydirections(pos),
            isValidMoveFn: pos =>
                !xyequal(xpos, pos) && inMatrix(m2, pos) && matrixGet(m2, pos) !== "#",
            cacheKeyFn: (pos: XY) => xykey(pos),
        });
        const r = itFinder.next();
        crossing.paths[xykey(r.value.finalElement)] = r.value.finalCost + 1;
    }
}

const itFinder2 = findPathsFlexi<[string, string[]]>({
    startNodes: [[xykey(start), [xykey(start)]]],
    endCondition: ([key]) => key == xykey(target),
    nextMovesFn: ([from, path]) =>
        Object.keys(crossings[from].paths)
            .filter(key => !path.includes(key))
            .map(v => [v, [...path, v]]),
    costFn: ([to], cost, [from]) => cost + crossings[from].paths[to],
    prioritizeHighCost: true,
});

let max2 = 0;
for (const v of itFinder2) {
    if (v.finalCost > max2) max2 = v.finalCost;
}

const part2 = (): number => {
    return max2;
};

export const partone = part1();
export const parttwo = part2();
