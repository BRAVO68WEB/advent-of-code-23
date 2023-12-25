const input = await Bun.file(`${import.meta.dir}/../../../input/24.txt`).text();

const parseInput = (input: string) =>
    input
        .trim()
        .split("\n")
        .map(line => {
            const [[px, py, pz], [vx, vy, vz]] = line
                .split(" @ ")
                .map(xyz => xyz.split(", ").map(v => +v));
            return [
                [px, py, pz],
                [vx, vy, vz],
            ] as [XYZ, XYZ];
        });

type XYZ = [x: number, y: number, z: number];
type XY = { x: number; y: number };
const xy = (x: number, y: number) => ({ x, y });

function getSegmentIntersection(a: XY, b: XY, c: XY, d: XY) {
    const z1 = a.x - b.x;
    const z2 = c.x - d.x;
    const z3 = a.y - b.y;
    const z4 = c.y - d.y;
    const dist = z1 * z4 - z3 * z2;
    if (dist === 0) return false;
    const tempA = a.x * b.y - a.y * b.x;
    const tempB = c.x * d.y - c.y * d.x;
    const xCoor = (tempA * z2 - z1 * tempB) / dist;
    const yCoor = (tempA * z4 - z3 * tempB) / dist;
    if (
        xCoor < Math.min(a.x, b.x) ||
        xCoor > Math.max(a.x, b.x) ||
        xCoor < Math.min(c.x, d.x) ||
        xCoor > Math.max(c.x, d.x)
    ) {
        return false;
    }
    if (
        yCoor < Math.min(a.y, b.y) ||
        yCoor > Math.max(a.y, b.y) ||
        yCoor < Math.min(c.y, d.y) ||
        yCoor > Math.max(c.y, d.y)
    ) {
        return false;
    }
    return [xCoor, yCoor] as [x: number, y: number];
}

export const part1 = (input: string): string | number => {
    const hailstones = parseInput(input);
    const zoneStart = hailstones.length > 10 ? 200000000000000 : 7;
    const zoneEnd = hailstones.length > 10 ? 400000000000000 : 27;
    function getBounds(px: number, py: number, vx: number, vy: number) {
        if (
            (px < zoneStart && vx < 0) ||
            (px > zoneEnd && vx > 0) ||
            (py < zoneStart && vy < 0) ||
            (py > zoneEnd && vy > 0)
        ) {
            return false;
        }
        const xStartTime =
            px < zoneStart ? (zoneStart - px) / vx : px > zoneEnd ? (zoneEnd - px) / vx : 0;
        const xEndTime = vx > 0 ? (zoneEnd - px) / vx : (zoneStart - px) / vx;
        const yStartTime =
            py < zoneStart ? (zoneStart - py) / vy : py > zoneEnd ? (zoneEnd - py) / vy : 0;
        const yEndTime = vy > 0 ? (zoneEnd - py) / vy : (zoneStart - py) / vy;
        const startTime = Math.max(xStartTime, yStartTime);
        const endTime = Math.min(xEndTime, yEndTime);
        const startX = px + vx * startTime;
        const endX = px + vx * endTime;
        const startY = py + vy * startTime;
        const endY = py + vy * endTime;
        if (startTime > endTime) {
            return false;
        }
        return {
            start: xy(startX, startY),
            end: xy(endX, endY),
        };
    }
    const hailstoneBounds: ReturnType<typeof getBounds>[] = [];
    const compared: Set<string> = new Set();
    let intersections = 0;
    for (let i = 0; i < hailstones.length; i++) {
        const [[aPX, aPY], [aVX, aVY]] = hailstones[i];
        const aBounds = hailstoneBounds[i] || getBounds(aPX, aPY, aVX, aVY);
        hailstoneBounds[i] = aBounds;
        if (!aBounds) continue;
        for (let j = 1; j < hailstones.length; j++) {
            if (i === j) continue;
            const pairKey = (i < j ? [i, j] : [j, i]).join(":");
            if (compared.has(pairKey)) continue;
            compared.add(pairKey);
            const [[bPX, bPY], [bVX, bVY]] = hailstones[j];
            const bBounds = hailstoneBounds[j] || getBounds(bPX, bPY, bVX, bVY);
            hailstoneBounds[j] = bBounds;
            if (!bBounds) continue;
            if (getSegmentIntersection(aBounds.start, aBounds.end, bBounds.start, bBounds.end)) {
                intersections++;
            }
        }
    }
    return intersections;
};

export const part2 = (input: string): string | number => {
    const hailstones = parseInput(input);
    type VMap = Map<number, number[]>;
    const vMaps: [VMap, VMap, VMap] = [new Map(), new Map(), new Map()];
    const minV = hailstones.reduce((m, c) => Math.min(...c[1], m), Infinity);
    const maxV = hailstones.reduce((m, c) => Math.max(...c[1], m), -Infinity);
    const possibleRockVs: Set<number>[] = [new Set(), new Set(), new Set()];
    possibleRockVs.forEach(p => {
        for (let v = -1000; v <= 1000; v++) {
            p.add(v);
        }
    });
    for (let hv = minV; hv <= maxV; hv++) {
        for (let a = 0; a < 3; a++) {
            const matches = hailstones
                .filter(hs => hs[1][a] === hv)
                .map(hs => hailstones.indexOf(hs));
            if (matches.length > 1) {
                vMaps[a].set(hv, matches);
                const [hsA, hsB] = matches.map(m => hailstones[m]);
                const delta = Math.abs(hsA[0][a] - hsB[0][a]);
                for (let prv = -1000; prv <= 1000; prv++) {
                    if (delta % Math.abs(prv - hv) !== 0) {
                        possibleRockVs[a].delete(prv);
                    }
                }
            }
        }
    }
    const maxTime = hailstones.length < 10 ? 1e3 : 1e15;
    const possibleVXs = [...possibleRockVs[0]].sort((a, b) => a - b);
    for (const element of possibleVXs) {
        const vx = element;
        for (const vy of possibleRockVs[1]) {
            for (const vz of possibleRockVs[2]) {
                const solutionV = [vx, vy, vz];
                let axisIntersectCount = 0;
                const intersectTimes: number[] = [];
                for (let a = 0; a < 3; a++) {
                    const a1 = (a + 1) % 3;
                    const a2 = (a + 2) % 3;
                    const axisHail = [...vMaps[a].values()][0].map(i => hailstones[i]);
                    const refHail = axisHail[0];
                    const refHailV = refHail[1].map((rv, ra) => rv - solutionV[ra]);
                    const refHailStart = xy(refHail[0][a1], refHail[0][a2]);
                    const refHailEnd = xy(
                        refHailStart.x + refHailV[a1] * maxTime,
                        refHailStart.y + refHailV[a2] * maxTime,
                    );
                    let invalidVZ = false;
                    for (let c = 1; c < axisHail.length; c++) {
                        const compareHail = axisHail[c];
                        const compareHailStart = xy(compareHail[0][a1], compareHail[0][a2]);
                        const compareHailV = compareHail[1].map((cv, ca) => cv - solutionV[ca]);
                        const compareHailEnd = xy(
                            compareHailStart.x + compareHailV[a1] * maxTime,
                            compareHailStart.y + compareHailV[a2] * maxTime,
                        );
                        const intersection = getSegmentIntersection(
                            refHailStart,
                            refHailEnd,
                            compareHailStart,
                            compareHailEnd,
                        );
                        if (!intersection) {
                            invalidVZ = true;
                            break;
                        }
                        const refIntersectTime = (intersection[0] - refHail[0][a1]) / refHailV[a1];
                        if (!isNaN(refIntersectTime)) {
                            const refIndex = hailstones.indexOf(refHail);
                            const existingRefTime = intersectTimes[refIndex];
                            if (existingRefTime !== undefined) {
                                if (existingRefTime !== refIntersectTime) break;
                            } else {
                                intersectTimes[refIndex] = refIntersectTime;
                            }
                        }
                        const compareIntersectTime =
                            (intersection[0] - compareHail[0][a1]) / compareHailV[a1];
                        if (!isNaN(compareIntersectTime)) {
                            const compareIndex = hailstones.indexOf(compareHail);
                            const existingCompareTime = intersectTimes[compareIndex];
                            if (existingCompareTime !== undefined) {
                                if (existingCompareTime !== compareIntersectTime) {
                                    console.log(existingCompareTime, compareIntersectTime);
                                    break;
                                }
                            } else {
                                intersectTimes[compareIndex] = compareIntersectTime;
                            }
                        }
                        axisIntersectCount++;
                    }
                    if (invalidVZ) break;
                }
                if (axisIntersectCount === 3) {
                    const hailIntersectionTimes: [number, number][] = [];
                    for (let i = 0; i < intersectTimes.length; i++) {
                        const iTime = intersectTimes[i];
                        if (iTime === undefined) continue;
                        hailIntersectionTimes.push([i, iTime]);
                    }
                    if (hailIntersectionTimes.length < 3) continue;
                    let foundRockStart: (number | undefined)[] | undefined = undefined;
                    let allRockStartsMatch = true;
                    for (const element of hailIntersectionTimes) {
                        const [hailIndex, time] = element;
                        const hail = hailstones[hailIndex];
                        const intersectPosition = hail[0].map((p, a) => p + hail[1][a] * time);
                        const rockStart = intersectPosition.map((p, a) =>
                            Math.round(p - solutionV[a] * time),
                        );
                        if (!foundRockStart) {
                            foundRockStart = rockStart;
                        } else if (
                            foundRockStart[0] !== rockStart[0] ||
                            foundRockStart[1] !== rockStart[1] ||
                            foundRockStart[2] !== rockStart[2]
                        ) {
                            allRockStartsMatch = false;
                            break;
                        }
                    }
                    if (allRockStartsMatch) {
                        return foundRockStart![0]! + foundRockStart![1]! + foundRockStart![2]!;
                    }
                }
            }
        }
    }

    return "No solution found";
};

export const partone = part1(input);
export const parttwo = part2(input);
