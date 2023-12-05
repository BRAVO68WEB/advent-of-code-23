const pkg = await Bun.file(`${import.meta.dir}/package.json`).json();
const input = await Bun.file(`${import.meta.dir}/../../input/5.txt`).text();

export interface IAlmanac {
	seeds: number[];
	mappings: {
	  seedToSoil: IMapping[];
	  soilToFertilizer: IMapping[];
	  fertilizerToWater: IMapping[];
	  waterToLight: IMapping[];
	  lightToTemperature: IMapping[];
	  temperatureToHumidity: IMapping[];
	  humidityToLocation: IMapping[];
	};
}

export interface IMapping {
	dstRangeStart: number;
	srcRangeStart: number;
	rangeLength: number;
}

function seedMappings(str: string): IMapping[] {
	const mappings = str
		.split(":\n")[1]
		.split("\n")
		.map((s) => s.split(" ").map((s) => parseInt(s)));

	return mappings.map(([dstRangeStart, srcRangeStart, rangeLength]) => ({
		dstRangeStart,
		srcRangeStart,
		rangeLength,
	}));	
}

export function parseInput(input: string[]): IAlmanac {
	const chunks = input.join("\n").split("\n\n");

	const seeds = chunks[0]
		.split(": ")[1]
		.split(" ")
		.map((s) => parseInt(s));

	const seedToSoil = seedMappings(chunks[1]);
	const soilToFertilizer = seedMappings(chunks[2]);
	const fertilizerToWater = seedMappings(chunks[3]);
	const waterToLight = seedMappings(chunks[4]);
	const lightToTemperature = seedMappings(chunks[5]);
	const temperatureToHumidity = seedMappings(chunks[6]);
	const humidityToLocation = seedMappings(chunks[7]);

	return {
		seeds,
		mappings: {
			seedToSoil,
			soilToFertilizer,
			fertilizerToWater,
			waterToLight,
			lightToTemperature,
			temperatureToHumidity,
			humidityToLocation,
		},
	};
}

export function mapValue(value: number, mappings: IMapping[]): number {
	const mapping = mappings.find(
		(mapping) =>
		mapping.srcRangeStart <= value &&
		mapping.srcRangeStart + mapping.rangeLength > value
	);

	if (!mapping) return value;

	const offset = value - mapping.srcRangeStart;

	return mapping.dstRangeStart + offset;
}
  
export function getSeedToLocationMapping(
	seed: number,
	mappings: IAlmanac["mappings"]
): number {
	const soil = mapValue(seed, mappings.seedToSoil);
	const fertilizer = mapValue(soil, mappings.soilToFertilizer);
	const water = mapValue(fertilizer, mappings.fertilizerToWater);
	const light = mapValue(water, mappings.waterToLight);
	const temperature = mapValue(light, mappings.lightToTemperature);
	const humidity = mapValue(temperature, mappings.temperatureToHumidity);
	const location = mapValue(humidity, mappings.humidityToLocation);

	return location;
}

const lines = input.split("\n");
const { seeds, mappings } = parseInput(lines);

let minLocation = Infinity;

for (const seed of seeds) {
	const location = getSeedToLocationMapping(seed, mappings);
	minLocation = Math.min(minLocation, location);
}

console.log("Day", pkg.name, "|", "Part 1 : ", minLocation);

console.log("Day", pkg.name, "|", "Part 2 : ", "TODO");