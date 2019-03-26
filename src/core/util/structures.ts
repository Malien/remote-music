const top = 0;
const parent = i => ((i + 1) >>> 1) - 1;
const left = i => (i << 1) + 1;
const right = i => (i + 1) << 1;

export let DefaultComparator = new class Default implements Comparator<any>{
  compare = (o1, o2) => o1 > o2
}

export interface Comparator<T>{
    compare: (o1:T, o2:T) => boolean
}

export class PriorityQueue<T> {
  _heap: T[]
  _comparator: Comparator<T>
  constructor(comparator:Comparator<T> = DefaultComparator) {
    this._heap = [];
    this._comparator = comparator;
  }
  size(): number {
    return this._heap.length;
  }
  isEmpty(): boolean {
    return this.size() == 0;
  }
  peek() : T{
    return this._heap[top];
  }
  push(...values: T[]): number {
    values.forEach(value => {
      this._heap.push(value);
      this._siftUp();
    });
    return this.size();
  }
  pop(): T {
    const poppedValue = this.peek();
    const bottom = this.size() - 1;
    if (bottom > top) {
      this._swap(top, bottom);
    }
    this._heap.pop();
    this._siftDown();
    return poppedValue;
  }
  replace(value: T): T {
    const replacedValue = this.peek();
    this._heap[top] = value;
    this._siftDown();
    return replacedValue;
  }
  _greater(i: number, j: number): boolean {
    return this._comparator.compare(this._heap[i], this._heap[j]);
  }
  _swap(i: number, j: number) {
    [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
  }
  _siftUp() {
    let node = this.size() - 1;
    while (node > top && this._greater(node, parent(node))) {
      this._swap(node, parent(node));
      node = parent(node);
    }
  }
  _siftDown() {
    let node = top;
    while (
      (left(node) < this.size() && this._greater(left(node), node)) ||
      (right(node) < this.size() && this._greater(right(node), node))
    ) {
      let maxChild = (right(node) < this.size() && this._greater(right(node), left(node))) ? right(node) : left(node);
      this._swap(node, maxChild);
      node = maxChild;
    }
  }
}