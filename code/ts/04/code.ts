const input = await Bun.file(`${import.meta.dir}/../../../input/4.txt`).text();

const lines = input.split("\n");

interface Card {
    id: string;
    winningNumbers: number[];
    heldNumbers: number[];
    winscore: number;
    noOfMatchs: number;
}

const cards: Card[] = [];

for (const line of lines) {
    let id = line.split(":")[0].trim();
    id = id.split(" ")[1];

    let numbers = line.split(":")[1].trim();
    let winningNumbers = numbers.split("|")[0].trim();
    let heldNumbers = numbers.split("|")[1].trim();

    let card: Card = {
        id,
        winningNumbers: winningNumbers.split(" ").map(n => parseInt(n)),
        heldNumbers: heldNumbers.split(" ").map(n => parseInt(n)),
        noOfMatchs: 0,
        winscore: 0,
    };

    card.heldNumbers = card.heldNumbers.filter(n => !isNaN(n));
    card.winningNumbers = card.winningNumbers.filter(n => !isNaN(n));

    for (const heldNumber of card.heldNumbers) {
        if (card.winningNumbers.includes(heldNumber)) {
            card.noOfMatchs++;
        }
    }

    if (card.noOfMatchs > 0) {
        card.winscore = Math.pow(2, card.noOfMatchs - 1);
    }

    cards.push(card);
}

export let partone = 0;

for (const card of cards) {
    partone += card.winscore;
}

export let parttwo = 0;

const queue = [...cards];

while (queue.length > 0) {
    const currentCard = queue.shift()!;
    parttwo += 1;

    const matches = currentCard.noOfMatchs;
    for (let i = 1; i <= matches; i++) {
        const nextCardIndex = cards.indexOf(currentCard) + i;
        if (nextCardIndex < cards.length) {
            queue.push(cards[nextCardIndex]);
        }
    }
}
