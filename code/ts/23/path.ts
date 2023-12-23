export class PriorityQueue<T> {
    private items: { element: T; priority: number }[];

    constructor(items: T[] = []) {
        this.items = items.map(element => ({ element, priority: 0 }));
    }

    enqueue(element: T, priority: number): void {
        const queueElement = { element, priority };
        const index = this.items.findIndex(item => item.priority > queueElement.priority);
        this.items.splice(index === -1 ? this.items.length : index, 0, queueElement);
    }

    dequeue(): T {
        if (this.isEmpty()) {
            throw new Error("Queue is empty");
        }
        return this.items.shift()!.element;
    }

    dequeueWithCost(): [T, number] {
        if (this.isEmpty()) {
            throw new Error("Queue is empty");
        }
        const qe = this.items.shift()!;
        return [qe.element, qe.priority];
    }

    dequeueLastWithCost(): [T, number] {
        if (this.isEmpty()) {
            throw new Error("Queue is empty");
        }
        const qe = this.items.pop()!;
        return [qe.element, qe.priority];
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }

    contains(element: T): boolean {
        return this.items.some(item => item.element === element);
    }

    length(): number {
        return this.items.length;
    }
}

export function* findPathsFlexi<T>(opts: {
    startNodes: T[];
    prioritizeHighCost?: boolean;
    endCondition?: (el: T, cost: number) => boolean;
    nextMovesFn: (el: T) => T[];
    cacheKeyFn?: (el: T, cost: number) => string | undefined;
    isValidMoveFn?: (to: T, from: T) => boolean;
    costFn?: (node: T, prevCost: number, prevNode: T) => number;
    beforeMoveFn?: (el: T, cost: number) => void;
}): Generator<{ finalElement: T; finalCost: number; history: Map<T, T> }> {
    if (!opts.cacheKeyFn) {
        opts.cacheKeyFn = () => undefined;
    }
    if (!opts.isValidMoveFn) {
        opts.isValidMoveFn = () => true;
    }
    if (!opts.costFn) {
        opts.costFn = (_, prevCost) => prevCost + 1;
    }

    const highCostFirst = opts.prioritizeHighCost ?? false;

    const { startNodes, nextMovesFn, cacheKeyFn, isValidMoveFn, costFn } = opts;

    const q = new PriorityQueue<T>(startNodes);
    const visited: Set<string | undefined> = new Set(startNodes.map(cacheKeyFn));

    while (!q.isEmpty()) {
        const [current, cost] = highCostFirst ? q.dequeueLastWithCost() : q.dequeueWithCost();

        if (opts.beforeMoveFn) {
            opts.beforeMoveFn(current, cost);
        }

        if (opts.endCondition && opts.endCondition(current, cost)) {
            yield {
                finalElement: current,
                finalCost: cost,
                history: new Map(),
            };
            continue;
        }

        const nextMoves = nextMovesFn(current).filter(move => isValidMoveFn(move, current));
        for (const move of nextMoves) {
            const key = cacheKeyFn(move, cost);

            if (key === undefined || !visited.has(key)) {
                visited.add(key);

                q.enqueue(move, costFn(move, cost, current));
            }
        }
    }

    return [];
}
