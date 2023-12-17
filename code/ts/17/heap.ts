export class Heap {
    private elements: number[];
    
    constructor() {
        this.elements = [];
    }
    
    public insert(element: number): void {
        this.elements.push(element);
        this.bubbleUp(this.elements.length - 1);
    }
    
    public removeMin(): number {
        const min = this.elements[0];
        const last = this.elements.pop();
        if (this.elements.length > 0) {
            if (last !== undefined) {
                this.elements[0] = last;
                this.bubbleDown(0);
            }
        }
        return min;
    }
    
    private bubbleUp(index: number): void {
        const element = this.elements[index];
        while (index > 0) {
            const parentIndex = Math.floor((index + 1) / 2) - 1;
            const parent = this.elements[parentIndex];
            if (element >= parent) {
                break;
            }
            this.elements[parentIndex] = element;
            this.elements[index] = parent;
            index = parentIndex;
        }
    }
    
    private bubbleDown(index: number): void {
        const element = this.elements[index];
        while (true) {
            const child1Index = (index + 1) * 2 - 1;
            const child2Index = (index + 1) * 2;
            let swapIndex = null;

            if (child1Index < this.elements.length) { 
                const child1 = this.elements[child1Index]; 
                if (child1 < element) { 
                    swapIndex = child1Index; 
                } 
            }
            if (child2Index < this.elements.length) {
                const child2 = this.elements[child2Index];
                if ((swapIndex === null && child2 < element) || (swapIndex !== null && child2 < this.elements[swapIndex])) {
                    swapIndex = child2Index; 
                }
            }
            if (swapIndex === null) { 
                break; 
            } 
            
            this.elements[index] = this.elements[swapIndex];
            this.elements[swapIndex] = element; 
            index = swapIndex; 
        }
    }
} 