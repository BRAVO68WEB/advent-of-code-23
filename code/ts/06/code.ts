const pkg = await Bun.file(`${import.meta.dir}/package.json`).json();
const input = await Bun.file(`${import.meta.dir}/../../../input/6.txt`).text();

const calc = (times: number[], dists: number[]) => {
	let product = 1;
	for (let i = 0; i < times.length; i++) {
		const time = times[i];
		const dist = dists[i];

		const minTime = Math.floor((time - Math.sqrt(time ** 2 - 4 * dist)) / 2);
		const noWays = time - 2 * minTime - 1;
		product *= noWays;
	}
	return product;
}

let [times, dists] = input.split('\n').map((line) => line.match(/\d+/g)!.map(Number));

console.log("Day", pkg.name, "|", "Part 1 : ", calc(times, dists));

[times, dists] = input.split('\n').map((line) => [+line.match(/\d+/g)!.join('')])

console.log("Day", pkg.name, "|", "Part 2 : ", calc(times, dists));