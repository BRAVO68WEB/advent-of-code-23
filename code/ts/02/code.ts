const input = await Bun.file(`${import.meta.dir}/../../../input/2.txt`).text();

const lines = input.split('\n');

export interface Cube {
	red: number;
	green: number;
	blue: number;
}

export interface Game {
	id: number;
	cubes: Cube[];
}

const parseBag = (bag: string): Cube => {
	const [c1, c2, c3] = bag.split(', ');
	const [c1v, c1n] = (c1?.trim()?.split(' ') ?? []) as [string, keyof Cube | undefined];
	const [c2v, c2n] = (c2?.trim()?.split(' ') ?? []) as [string, keyof Cube | undefined];
	const [c3v, c3n] = (c3?.trim()?.split(' ') ?? []) as [string, keyof Cube | undefined];

	const cubeParsed: Cube = {
		red: 0,
		green: 0,
		blue: 0,
	};

	if (c1n !== undefined) {
		cubeParsed[c1n] = parseInt(c1v);
	}

	if (c2n !== undefined) {
		cubeParsed[c2n] = parseInt(c2v);
	}

	if (c3n !== undefined) {
		cubeParsed[c3n] = parseInt(c3v);
	}

	return cubeParsed;
};

export const parse = (line: string): Game => {
	const [rawGameId, data] = line.split(': ');
	const [, gameId] = rawGameId.split(' ');

	return {
		id: parseInt(gameId),
		cubes: data.split('; ').map(parseBag),
	} as Game;
};

const bagIsValid = (bag: Cube): boolean => {
    const { red, green, blue } = bag;

    return red <= 12 && green <= 13 && blue <= 14;
};

const gameIsValid = (game: Game): boolean => {
    return game.cubes.every(bagIsValid);
};

const sum = (acc: number, curr: number) => acc + curr;

export const partone = lines.map(parse).filter(gameIsValid).map((game) => game.id).reduce(sum, 0);

const minCubesToPlayGame = lines.map(parse).map((game) => {
    const red = Math.max(...game.cubes.map((cube) => cube.red));
    const green = Math.max(...game.cubes.map((cube) => cube.green));
    const blue = Math.max(...game.cubes.map((cube) => cube.blue));

    return {
        id: game.id,
        cubes: {
            red,
            green,
            blue,
        },
    };
});

const calProd = minCubesToPlayGame.map((game) => {
    const { red, green, blue } = game.cubes;

    return red * green * blue;
})

export const parttwo = calProd.reduce(sum, 0);