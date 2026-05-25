class Vertex {
  constructor(id, x, y, label) {
    this.id    = id;
    this.x     = x;
    this.y     = y;
    this.label = label || String(id);
  }
}

class Edge {
  constructor(id, from, to, weight, directed) {
    this.id       = id;
    this.from     = from;
    this.to       = to;
    this.weight   = weight;
    this.directed = directed;
  }
}

class Graph {
  constructor() {
    this._nextVertexId = 1;
    this._nextEdgeId   = 1;
    this.vertices      = new Map();
    this.edges         = new Map();
    this._adjacency    = new Map();
  }

  addVertex(x, y, label) {
    const id = this._nextVertexId++;
    const v  = new Vertex(id, x, y, label || String(id));
    this.vertices.set(id, v);
    this._adjacency.set(id, []);
    return v;
  }

  removeVertex(id) {
    if (!this.vertices.has(id)) return;
    const toRemove = [];
    for (const [eid, edge] of this.edges) {
      if (edge.from === id || edge.to === id) toRemove.push(eid);
    }
    toRemove.forEach(eid => this.removeEdge(eid));
    this.vertices.delete(id);
    this._adjacency.delete(id);
  }

  addEdge(fromId, toId, weight, directed) {
    if (!this.vertices.has(fromId) || !this.vertices.has(toId)) return null;
    const id   = this._nextEdgeId++;
    const edge = new Edge(id, fromId, toId, weight, directed);
    this.edges.set(id, edge);

    this._adjacency.get(fromId).push({ to: toId, weight, edgeId: id });
    if (!directed) {
      this._adjacency.get(toId).push({ to: fromId, weight, edgeId: id });
    }
    return edge;
  }

  removeEdge(id) {
    const edge = this.edges.get(id);
    if (!edge) return;

    const removeLink = (fromId, toId) => {
      const list = this._adjacency.get(fromId);
      if (!list) return;
      const idx = list.findIndex(l => l.edgeId === id);
      if (idx !== -1) list.splice(idx, 1);
    };

    removeLink(edge.from, edge.to);
    if (!edge.directed) removeLink(edge.to, edge.from);
    this.edges.delete(id);
  }

  getNeighbors(vertexId) {
    return this._adjacency.get(vertexId) || [];
  }

  hasEdgeBetween(fromId, toId) {
    const list = this._adjacency.get(fromId);
    if (!list) return false;
    return list.some(l => l.to === toId);
  }

  clear() {
    this._nextVertexId = 1;
    this._nextEdgeId   = 1;
    this.vertices.clear();
    this.edges.clear();
    this._adjacency.clear();
  }

  serialize() {
    const vertices = [];
    for (const [id, v] of this.vertices) {
      vertices.push({ id: v.id, x: v.x, y: v.y, label: v.label });
    }
    const edges = [];
    for (const [id, e] of this.edges) {
      edges.push({ id: e.id, from: e.from, to: e.to, weight: e.weight, directed: e.directed });
    }
    return {
      nextVertexId: this._nextVertexId,
      nextEdgeId:   this._nextEdgeId,
      vertices,
      edges,
    };
  }

  deserialize(data) {
    this.clear();
    this._nextVertexId = data.nextVertexId || 1;
    this._nextEdgeId   = data.nextEdgeId   || 1;

    for (const v of data.vertices || []) {
      const vertex = new Vertex(v.id, v.x, v.y, v.label);
      this.vertices.set(v.id, vertex);
      this._adjacency.set(v.id, []);
    }

    for (const e of data.edges || []) {
      const edge = new Edge(e.id, e.from, e.to, e.weight, e.directed);
      this.edges.set(e.id, edge);
      const fromList = this._adjacency.get(e.from);
      if (fromList) fromList.push({ to: e.to, weight: e.weight, edgeId: e.id });
      if (!e.directed) {
        const toList = this._adjacency.get(e.to);
        if (toList) toList.push({ to: e.from, weight: e.weight, edgeId: e.id });
      }
    }
  }
}
