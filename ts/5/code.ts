const pkg = await Bun.file(`${import.meta.dir}/package.json`).json();
const input = await Bun.file(`${import.meta.dir}/../../input/5.txt`).text();

import { Worker } from "worker_threads";

import { parseInput, getSeedToLocationMapping } from "./helper.ts";

const lines = input.split("\n");
const { seeds, mappings } = parseInput(lines);

let minLocation = Infinity;

for (const seed of seeds) {
	const location = getSeedToLocationMapping(seed, mappings);
	minLocation = Math.min(minLocation, location);
}

console.log("Day", pkg.name, "|", "Part 1 : ", minLocation);

const chunks: number[][] = [];
for (let i = 0; i < seeds.length - 1; i += 2) {
  chunks.push([seeds[i], seeds[i + 1]]);
}

const tasks = chunks.map(
  ([seedStart, seedRangeLength]): Promise<number> => {
	return new Promise((resolve, reject) => {
	  const worker = new Worker("./worker.js", {
		workerData: { seedStart, seedRangeLength, mappings },
	  });
	  worker.on("message", resolve);
	  worker.on("error", reject);
	  worker.on("exit", (code) => {
		if (code !== 0)
		  reject(new Error(`Worker stopped with exit code ${code}`));
	  });
	});
  }
);

const minLocations = await Promise.all<number>(tasks);

console.log("Day", pkg.name, "|", "Part 2 : ", Math.min(...minLocations));