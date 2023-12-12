const pkg = await Bun.file(`${import.meta.dir}/package.json`).json();
const input = await Bun.file(`${import.meta.dir}/../../../input/8.txt`).text();

const [instructions, network] = input.split('\n\n');
const nodes = network.split('\n').map(line => line.replaceAll(/[\(\)]/g,'').split(' = '));
const nodeMap = nodes.reduce((acc: any, cur) => {
  acc[cur[0]] = cur[1].split(', ');
  return acc;
}, {}) as Record<string, string[]>;

const solver = (endCondition: any) => (position: any): number => {
  let step;
  for (step = 0; !endCondition(position); step++) {
    const instruction = instructions.charAt(step % instructions.length);
    const options = nodeMap[position];
    position = options[instruction === 'R' ? 1 : 0];
  }
  return step;
}

const p1s = solver((position: any) => position === 'ZZZ');
const p1 = p1s('AAA');

console.log("Day", pkg.name, "|", "Part 1 : ", p1);

const gcd = (a: number, b: number): number => {
  return b ? gcd(b, a % b) : a;
}
const lcm = (a: number, b: number): number => {
  return a * b / gcd(a, b);
}

let startPositions = Object.keys(nodeMap).filter(key => key.endsWith('A'));

const p2s = solver((position: any) => position.endsWith('Z'));
const stepsForEacStart = startPositions.map(position => p2s(position));

const p2 = stepsForEacStart.reduce((a, b) => lcm(a, b));

console.log("Day", pkg.name, "|", "Part 2 : ", p2);