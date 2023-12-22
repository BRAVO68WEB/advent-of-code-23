const input = await Bun.file(`${import.meta.dir}/../../../input/19.txt`).text();

const cloneDeep = (value: any) => JSON.parse(JSON.stringify(value));
const sum = (nums: number[]) => nums.reduce((a, b) => a + b, 0);

const product = (nums: number[]) => nums.reduce((a, b) => a * b, 1);

type Ins =
  | {
      type: "compare";
      property: 0 | 1 | 2 | 3;
      op: "<" | ">";
      v: number;
      to: string;
    }
  | { type: "goto"; to: string };

type Metal = [number, number, number, number];

const parse = (input: string) => {
  const [rawRules, rawMetal] = input.trim().split("\n\n");

  const rgx = /(\w+){(.*)}/;
  const insRgx = /(\w+)([<>])(\d+)/;
  const rules = rawRules.split("\n").reduce((map, rule) => {
    const [label, rawIns] = RegExp(rgx).exec(rule)!.slice(1);

    const ins = rawIns.split(",").map<Ins>((rawIns) => {
      if (rawIns.indexOf(":") === -1)
        return { type: "goto", to: rawIns.trim() };
      const [fn, to] = rawIns.trim().split(":");
      const [property, operand, value] = RegExp(insRgx).exec(fn)!.slice(1);

      return {
        type: "compare",
        to,
        property: ["x", "m", "a", "s"].indexOf(property) as 0 | 1 | 2 | 3,
        op: operand as "<" | ">",
        v: Number(value),
      };
    });

    map.set(label, ins);

    return map;
  }, new Map<string, Ins[]>());

  const metals = rawMetal.split("\n").map((raw) => {
    const vars = raw.matchAll(/(\w)=(\d+)/g);
    const o: Metal = [0, 0, 0, 0];
    for (const [, k, v] of vars) o[["x", "m", "a", "s"].indexOf(k)] = Number(v);
    return o;
  });

  return { rules, metals };
};

type Range = [number, number];
type Branch = {
  label: string;
  ranges: [x: Range, m: Range, a: Range, s: Range];
};
const getRangesForA = (rules: ReturnType<typeof parse>["rules"]) => {
  const openBranches: Branch[] = [
    {
      label: "in",
      ranges: [
        [1, 4000],
        [1, 4000],
        [1, 4000],
        [1, 4000],
      ],
    },
  ];
  const closedBranches: Branch[] = [];

  while (openBranches.length) {
    const branch = openBranches.pop()!;
    closedBranches.push(branch);
    if (branch.label === "A" || branch.label === "R") {
      continue;
    }
    const instructions = rules.get(branch.label)!;
    const ranges = cloneDeep(branch.ranges);

    for (const element of instructions) {
      const ins = element;
      if (ins.type === "compare") {
        const nextRanges = cloneDeep(ranges);
        const n = ins.op === "<" ? 1 : 0;
        nextRanges[ins.property][n] = ins.v + (n === 1 ? -1 : 1);
        ranges[ins.property][1 - n] = ins.v;
        openBranches.push({
          label: ins.to,
          ranges: nextRanges,
        });
      } else {
        openBranches.push({
          label: ins.to,
          ranges,
        });
      }
    }
  }

  return closedBranches.filter((cb) => cb.label === "A").map((cb) => cb.ranges);
};

export const part1 = (input: string) => {
  const { rules, metals } = parse(input);
  const ranges = getRangesForA(rules);

  const isIn = (x: number, r: Range) => x >= r[0] && x <= r[1];
  return sum(
    metals
      .filter((m) => ranges.some((r) => r.every((r, i) => isIn(m[i], r))))
      .map((o) => sum(o)),
  );
};

export const part2 = (input: string) => {
  const { rules } = parse(input);
  const ranges = getRangesForA(rules);

  return sum(
    ranges.map((b) => {
      const diffs = b.map((r) => r[1] - r[0] + 1);
      return product(diffs);
    }),
  );
};

export const partone = part1(input);
export const parttwo = part2(input);
