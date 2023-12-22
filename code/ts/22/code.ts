const input = await Bun.file(`${import.meta.dir}/../../../input/22.txt`).text();

const data = input.split("\n");

type Brick = [number, number, number, number, number, number];

export class BrickPile {
    public bricks: Brick[];
    private aboveAdj = new Map<number, number[]>();
    private belowAdj = new Map<number, number[]>();

    constructor(rawInput: string[]) {
        this.bricks = this.parseInput(rawInput).sort((a, b) => a[2] - b[2]);

        this.initAdjacencyLists();
        this.stackBricks();
        this.updateAdjacencyLists();
    }

    private initAdjacencyLists(): void {
        for (let i = 0; i < this.bricks.length; i++) {
            this.aboveAdj.set(i, []);
            this.belowAdj.set(i, []);
        }
    }

    private parseInput(input: string[]): Brick[] {
        return input.map(line =>
            line.split("~").flatMap(edge => edge.split(",").map(e => parseInt(e))),
        ) as Brick[];
    }

    private doesBricksOverlap([x1, y1, , x2, y2]: Brick, [x3, y3, , x4, y4]: Brick): boolean {
        return Math.max(x1, x3) <= Math.min(x2, x4) && Math.max(y1, y3) <= Math.min(y2, y4);
    }

    private hasBrickRedundancy(i: number): boolean {
        return this.belowAdj.get(i)!.length >= 2;
    }

    private isBrickRedundant(i: number): boolean {
        return this.aboveAdj.get(i)!.every(this.hasBrickRedundancy.bind(this));
    }

    private stackBricks() {
        for (const [i, upper] of this.bricks.entries()) {
            const height = upper[5] - upper[2];
            let zMax = 1;

            for (let j = 0; j < i; j++) {
                const lower = this.bricks[j];

                if (this.doesBricksOverlap(upper, lower)) {
                    zMax = Math.max(zMax, lower[5] + 1);
                }
            }

            upper[2] = zMax;
            upper[5] = upper[2] + height;
        }
    }

    private updateAdjacencyLists(): void {
        for (let i = 1; i < this.bricks.length; i++) {
            const upper = this.bricks[i];

            for (let j = 0; j < i; j++) {
                const lower = this.bricks[j];

                if (this.doesBricksOverlap(upper, lower) && lower[5] === upper[2] - 1) {
                    this.belowAdj.get(i)!.push(j);
                    this.aboveAdj.get(j)!.push(i);
                }
            }
        }
    }

    private countBricksToFall(i: number): number {
        const queue = [i];
        const visited = new Set<number>();

        while (queue.length) {
            const brick = queue.shift()!;
            visited.add(brick);

            for (const b2 of this.aboveAdj.get(brick)!) {
                const base = this.belowAdj.get(b2);
                if (base!.every(b => visited.has(b))) {
                    queue.push(b2);
                }
            }
        }

        return visited.size - 1;
    }

    public countRemovableBricks(): number {
        let count = 0;

        for (let i = 0; i < this.bricks.length; i++) {
            if (this.isBrickRedundant(i)) {
                count++;
            }
        }

        return count;
    }

    public countFallingBricks(): number {
        let count = 0;

        for (let i = 0; i < this.bricks.length; i++) {
            count += this.countBricksToFall(i);
        }

        return count;
    }
}

function part1(inputs: string[]) {
    const bp = new BrickPile(inputs);
    return bp.countRemovableBricks();
}

function part2(inputs: string[]) {
    const bp = new BrickPile(inputs);
    return bp.countFallingBricks();
}

export const partone = part1(data);
export const parttwo = part2(data);
