class MinHeap {
  constructor() {
    this._data = [];
  }

  get size() {
    return this._data.length;
  }

  get isEmpty() {
    return this._data.length === 0;
  }

  push(priority, data) {
    this._data.push({ priority, data });
    this._bubbleUp(this._data.length - 1);
  }

  pop() {
    if (this.isEmpty) return null;
    const top = this._data[0];
    const last = this._data.pop();
    if (this._data.length > 0) {
      this._data[0] = last;
      this._sinkDown(0);
    }
    return top;
  }

  peek() {
    return this._data[0] || null;
  }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this._data[parent].priority <= this._data[i].priority) break;
      this._swap(i, parent);
      i = parent;
    }
  }

  _sinkDown(i) {
    const n = this._data.length;
    while (true) {
      let smallest = i;
      const left  = 2 * i + 1;
      const right = 2 * i + 2;
      if (left  < n && this._data[left].priority  < this._data[smallest].priority) smallest = left;
      if (right < n && this._data[right].priority < this._data[smallest].priority) smallest = right;
      if (smallest === i) break;
      this._swap(i, smallest);
      i = smallest;
    }
  }

  _swap(a, b) {
    const tmp = this._data[a];
    this._data[a] = this._data[b];
    this._data[b] = tmp;
  }
}
