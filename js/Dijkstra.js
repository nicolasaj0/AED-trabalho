class DijkstraResult {
  constructor(dist, prev, explored, timeMs, source) {
    this.dist     = dist;
    this.prev     = prev;
    this.explored = explored;
    this.timeMs   = timeMs;
    this.source   = source;
  }

  getPath(targetId) {
    if (!this.dist.has(targetId) || this.dist.get(targetId) === Infinity) return null;
    const path = [];
    let current = targetId;
    while (current !== null && current !== undefined) {
      path.unshift(current);
      current = this.prev.get(current);
    }
    if (path[0] !== this.source) return null;
    return path;
  }

  getDistance(targetId) {
    const d = this.dist.get(targetId);
    return (d === undefined || d === Infinity) ? null : d;
  }
}

function runDijkstra(graph, sourceId) {
  const t0      = performance.now();
  const dist    = new Map();
  const prev    = new Map();
  const visited = new Set();

  for (const [id] of graph.vertices) {
    dist.set(id, Infinity);
    prev.set(id, null);
  }
  dist.set(sourceId, 0);

  const heap = new MinHeap();
  heap.push(0, sourceId);

  let explored = 0;

  while (!heap.isEmpty) {
    const { priority: d, data: u } = heap.pop();
    if (visited.has(u)) continue;
    visited.add(u);
    explored++;

    if (d > dist.get(u)) continue;

    for (const { to, weight } of graph.getNeighbors(u)) {
      const alt = dist.get(u) + weight;
      if (alt < dist.get(to)) {
        dist.set(to, alt);
        prev.set(to, u);
        heap.push(alt, to);
      }
    }
  }

  const timeMs = performance.now() - t0;
  return new DijkstraResult(dist, prev, explored, timeMs, sourceId);
}
