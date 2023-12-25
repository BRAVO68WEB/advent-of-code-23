const input = await Bun.file(`${import.meta.dir}/../../../input/23.txt`).text();

const edges = [];
const nodes = new Set<string>();

for (const [fromorig, ...too] of input) {
    const from = fromorig.substring(0, fromorig.length - 1);
    nodes.add(from);
    for (const to of too) {
        nodes.add(to);
        edges.push([from, to].sort((a, b) => a.localeCompare(b)));
    }
}

const seqid = Object.fromEntries([...nodes].map((name, i) => [name, i]));
const length = nodes.size;

const adjmap: number[][] = Array.from({ length }, () => Array.from({ length }, () => 0));
for (const [from, to] of edges) {
    adjmap[seqid[from]][seqid[to]] = 1;
    adjmap[seqid[to]][seqid[from]] = 1;
}

const groupings = Array.from({ length: length }, (_, i) => [i]);
let t = 0;
let max = length;
while (max > 0) {
    const weights = [...adjmap[0]];
    let s = 0;
    let t = 0;
    let loops = max;
    while (loops > 0) {
        loops--;
        weights[t] = -Infinity;
        s = t;
        t = weights.indexOf(Math.max(...weights));
        weights.forEach((w, i) => {
            weights[i] = w + adjmap[t][i];
        });
    }

    if (weights[t] - adjmap[t][t] === 3) {
        break;
    }

    groupings[s].push(...groupings[t]);
    for (let i = 0; i < length; i++) {
        adjmap[i][s] = adjmap[s][i] += adjmap[t][i];
    }

    adjmap[0][t] = -Infinity;
    max--;
}

const groupA = groupings[t].length;
const groupB = nodes.size - groupA;

export const output = groupA * groupB;
