import fs from 'fs';

const input = fs.readFileSync('./input.txt', 'utf8');

const lines = input.split('\n');
const partone = lines.map((line) => {
    let firstDigit: string | undefined;
    let lastDigit: string | undefined;
    for (let i = 0; i < line.length; i++) {
        const maybeFirstDigit = line[i]!;
        const maybeLastDigit = line[line.length - i - 1]!;

        if (firstDigit === undefined && /\d/.test(maybeFirstDigit)) {
            firstDigit = maybeFirstDigit;
        }

        if (lastDigit === undefined && /\d/.test(maybeLastDigit)) {
            lastDigit = maybeLastDigit;
        }

        if (firstDigit !== undefined && lastDigit !== undefined) {
            break;
        }
    }

    return ((firstDigit ?? '') + (lastDigit ?? ''));
});

const sum1 = partone.reduce((acc, curr) => acc + parseInt(curr, 10), 0);

console.log("Part 1 : ", sum1);

const numbers = {
	one: '1',
	'1': '1',
	two: '2',
	'2': '2',
	three: '3',
	'3': '3',
	four: '4',
	'4': '4',
	five: '5',
	'5': '5',
	six: '6',
	'6': '6',
	seven: '7',
	'7': '7',
	eight: '8',
	'8': '8',
	nine: '9',
	'9': '9',
} as const;

const numbersAsKeys = Object.keys(numbers) as (keyof typeof numbers)[];

const parttwo = lines.map((line) => {
    let firstDigit: string | undefined;
    let lastDigit: string | undefined;
    for (let i = 0; i < line.length; i++) {
        if (firstDigit === undefined) {
            const maybeFirstDigit = line.slice(i, i + 5);
            const firstTextNumber = numbersAsKeys.find((key) =>
                maybeFirstDigit.startsWith(key),
            );
            if (firstTextNumber) {
                firstDigit = numbers[firstTextNumber];
            }
        }

        if (lastDigit === undefined) {
            const maybeDigit = line.slice(
                Math.max(line.length - i - 5, 0),
                line.length - i,
            );

            const textNumber = numbersAsKeys.find((key) => maybeDigit.endsWith(key));
            if (textNumber) {
                lastDigit = numbers[textNumber];
            }
        }

        if (firstDigit !== undefined && lastDigit !== undefined) {
            break;
        }
    }
    return ((firstDigit ?? '') + (lastDigit ?? ''));
});

const sum2 = parttwo.reduce((acc, curr) => acc + parseInt(curr, 10), 0);

console.log("Part 2 : ", sum2);