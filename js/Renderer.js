// Polyfill roundRect for browsers that don't support it yet
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.arcTo(x + w, y, x + w, y + r, r);
    this.lineTo(x + w, y + h - r);
    this.arcTo(x + w, y + h, x + w - r, y + h, r);
    this.lineTo(x + r, y + h);
    this.arcTo(x, y + h, x, y + h - r, r);
    this.lineTo(x, y + r);
    this.arcTo(x, y, x + r, y, r);
    this.closePath();
  };
}

class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');

    this.camX  = 0;
    this.camY  = 0;
    this.scale = 1;

    this.sourceId       = null;
    this.targetId       = null;
    this.pathVertices   = new Set();
    this.pathEdges      = new Set();
    this.exploredVertices = new Set();
    this.selectedVertexId = null;
    this.hoverVertexId  = null;
    this.hoverEdgeId    = null;

    // Vertices render as small dots by default (no labels, no large circles)
    this.dotMode = true;
    // Edge weight labels hidden by default
    this.showWeights = false;

    this._graph = null;
  }

  setGraph(graph) {
    this._graph = graph;
  }

  worldToCanvas(wx, wy) {
    return {
      x: wx * this.scale + this.camX,
      y: wy * this.scale + this.camY,
    };
  }

  canvasToWorld(cx, cy) {
    return {
      x: (cx - this.camX) / this.scale,
      y: (cy - this.camY) / this.scale,
    };
  }

  zoom(factor, cx, cy) {
    const newScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, this.scale * factor));
    const ratio    = newScale / this.scale;
    this.camX  = cx - ratio * (cx - this.camX);
    this.camY  = cy - ratio * (cy - this.camY);
    this.scale = newScale;
  }

  pan(dx, dy) {
    this.camX += dx;
    this.camY += dy;
  }

  fitToScreen() {
    if (!this._graph || this._graph.vertices.size === 0) return;
    const vertices = Array.from(this._graph.vertices.values());
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const v of vertices) {
      if (v.x < minX) minX = v.x;
      if (v.y < minY) minY = v.y;
      if (v.x > maxX) maxX = v.x;
      if (v.y > maxY) maxY = v.y;
    }

    const padding = 60;
    const w = this.canvas.width  - padding * 2;
    const h = this.canvas.height - padding * 2;
    const gw = maxX - minX || 1;
    const gh = maxY - minY || 1;

    const sx = w / gw;
    const sy = h / gh;
    this.scale = Math.min(sx, sy, MAX_ZOOM);
    this.scale = Math.max(this.scale, MIN_ZOOM);

    const centerWX = (minX + maxX) / 2;
    const centerWY = (minY + maxY) / 2;
    this.camX = this.canvas.width  / 2 - centerWX * this.scale;
    this.camY = this.canvas.height / 2 - centerWY * this.scale;
  }

  resize() {
    const container = this.canvas.parentElement;
    this.canvas.width  = container.clientWidth;
    this.canvas.height = container.clientHeight;
  }

  getVertexAt(cx, cy) {
    if (!this._graph) return null;
    const world = this.canvasToWorld(cx, cy);
    // Correcao na zona clicavel de forma a ficar mais precisa
    const minCanvasPx = this.dotMode ? 10 : 40;
    const hitRadiusWorld = minCanvasPx / this.scale;
    for (const [id, v] of this._graph.vertices) {
      const dx = v.x - world.x;
      const dy = v.y - world.y;
      if (dx * dx + dy * dy <= hitRadius * hitRadius) return id;
    }
    return null;
  }

  getEdgeAt(cx, cy) {
    if (!this._graph) return null;
    const world = this.canvasToWorld(cx, cy);
    const threshold = Math.max(8, 8 / this.scale);

    for (const [id, edge] of this._graph.edges) {
      const vFrom = this._graph.vertices.get(edge.from);
      const vTo   = this._graph.vertices.get(edge.to);
      if (!vFrom || !vTo) continue;

      const hasBoth = this._hasBothDirections(edge);
      if (hasBoth && edge.directed) {
        const dist = this._distToQuadratic(world, vFrom, vTo);
        if (dist < threshold) return id;
      } else {
        const dist = this._distToSegment(world, vFrom, vTo);
        if (dist < threshold) return id;
      }
    }
    return null;
  }

  // Build a Set of "from,to" keys for directed edges so _hasBothDirections is O(1) per call.
  // Must be called before each render pass when the graph changes.
  _rebuildDirectedIndex() {
    this._directedSet = new Set();
    if (!this._graph) return;
    for (const [, e] of this._graph.edges) {
      if (e.directed) this._directedSet.add(`${e.from},${e.to}`);
    }
  }

  _hasBothDirections(edge) {
    if (!edge.directed || !this._directedSet) return false;
    return this._directedSet.has(`${edge.to},${edge.from}`);
  }

  _distToSegment(p, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) {
      const ddx = p.x - a.x, ddy = p.y - a.y;
      return Math.sqrt(ddx * ddx + ddy * ddy);
    }
    let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const nx = a.x + t * dx;
    const ny = a.y + t * dy;
    const ex = p.x - nx, ey = p.y - ny;
    return Math.sqrt(ex * ex + ey * ey);
  }

  _distToQuadratic(p, vFrom, vTo) {
    const cp = this._curveControlPoint(vFrom, vTo);
    let minDist = Infinity;
    for (let t = 0; t <= 1; t += 0.05) {
      const bx = (1 - t) * (1 - t) * vFrom.x + 2 * (1 - t) * t * cp.x + t * t * vTo.x;
      const by = (1 - t) * (1 - t) * vFrom.y + 2 * (1 - t) * t * cp.y + t * t * vTo.y;
      const dx = p.x - bx, dy = p.y - by;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < minDist) minDist = d;
    }
    return minDist;
  }

  _curveControlPoint(vFrom, vTo) {
    const mx = (vFrom.x + vTo.x) / 2;
    const my = (vFrom.y + vTo.y) / 2;
    const dx = vTo.x - vFrom.x;
    const dy = vTo.y - vFrom.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const offset = 35;
    return {
      x: mx - (dy / len) * offset,
      y: my + (dx / len) * offset,
    };
  }

  clearPath() {
    this.pathVertices.clear();
    this.pathEdges.clear();
    this.exploredVertices.clear();
  }

  setPath(pathVertexIds, result) {
    this.clearPath();
    if (!pathVertexIds || pathVertexIds.length === 0) return;

    for (const id of pathVertexIds) this.pathVertices.add(id);

    if (!this._graph) return;

    // Use adjacency list edgeId — O(degree) per step instead of O(E)
    for (let i = 0; i < pathVertexIds.length - 1; i++) {
      const from = pathVertexIds[i];
      const to   = pathVertexIds[i + 1];
      const neighbors = this._graph.getNeighbors(from);
      const entry = neighbors.find(n => n.to === to);
      if (entry) this.pathEdges.add(entry.edgeId);
    }
  }

  // Checks if a canvas-space point is within the visible viewport (with margin)
  _inViewport(cx, cy, margin = 40) {
    return cx >= -margin && cx <= this.canvas.width  + margin &&
           cy >= -margin && cy <= this.canvas.height + margin;
  }

  render(rubberBand) {
    if (!this._graph) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this._rebuildDirectedIndex();
    this._drawGrid();

    // Viewport bounds in world space for culling
    const wTL    = this.canvasToWorld(0, 0);
    const wBR    = this.canvasToWorld(this.canvas.width, this.canvas.height);
    const wMargin = 40 / this.scale;
    const vMinX = wTL.x - wMargin, vMaxX = wBR.x + wMargin;
    const vMinY = wTL.y - wMargin, vMaxY = wBR.y + wMargin;

    const _visible = (vf, vt) => {
      if (vf.x < vMinX && vt.x < vMinX) return false;
      if (vf.x > vMaxX && vt.x > vMaxX) return false;
      if (vf.y < vMinY && vt.y < vMinY) return false;
      if (vf.y > vMaxY && vt.y > vMaxY) return false;
      return true;
    };

    // Draw non-path edges first, path edges last (so path is always on top)
    for (const [id, edge] of this._graph.edges) {
      if (this.pathEdges.has(id)) continue;
      const vf = this._graph.vertices.get(edge.from);
      const vt = this._graph.vertices.get(edge.to);
      if (!vf || !vt || !_visible(vf, vt)) continue;
      this._drawEdge(edge, id);
    }
    for (const id of this.pathEdges) {
      const edge = this._graph.edges.get(id);
      if (!edge) continue;
      const vf = this._graph.vertices.get(edge.from);
      const vt = this._graph.vertices.get(edge.to);
      if (!vf || !vt || !_visible(vf, vt)) continue;
      this._drawEdge(edge, id);
    }

    if (rubberBand && this.selectedVertexId !== null) {
      const v = this._graph.vertices.get(this.selectedVertexId);
      if (v) {
        const from = this.worldToCanvas(v.x, v.y);
        ctx.save();
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = '#6B7280';
        ctx.lineWidth   = 1.5;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(rubberBand.x, rubberBand.y);
        ctx.stroke();
        ctx.restore();
      }
    }

    for (const [id, vertex] of this._graph.vertices) {
      const cp = this.worldToCanvas(vertex.x, vertex.y);
      if (!this._inViewport(cp.x, cp.y)) continue;
      this._drawVertex(vertex, id);
    }
  }

  _drawGrid() {
    const ctx    = this.ctx;
    const w      = this.canvas.width;
    const h      = this.canvas.height;
    const step   = this._niceGridStep();
    if (step * this.scale < 10) return;

    const startX = Math.floor(-this.camX / this.scale / step) * step;
    const startY = Math.floor(-this.camY / this.scale / step) * step;

    ctx.save();
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth   = 0.5;
    ctx.beginPath();

    for (let wx = startX; wx * this.scale + this.camX < w; wx += step) {
      const cx = wx * this.scale + this.camX;
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, h);
    }
    for (let wy = startY; wy * this.scale + this.camY < h; wy += step) {
      const cy = wy * this.scale + this.camY;
      ctx.moveTo(0, cy);
      ctx.lineTo(w, cy);
    }
    ctx.stroke();
    ctx.restore();
  }

  _niceGridStep() {
    const targetPixels = 60;
    const worldStep    = targetPixels / this.scale;
    const magnitude    = Math.pow(10, Math.floor(Math.log10(worldStep)));
    const residual     = worldStep / magnitude;
    if (residual < 2)  return magnitude;
    if (residual < 5)  return 2 * magnitude;
    return 5 * magnitude;
  }

  _getVertexColor(id) {
    if (id === this.sourceId)      return COLORS.vertex.source;
    if (id === this.targetId)      return COLORS.vertex.target;
    if (this.pathVertices.has(id)) return COLORS.vertex.path;
    return COLORS.vertex.normal;
  }

  _drawVertex(vertex, id) {
    const ctx   = this.ctx;
    const pos   = this.worldToCanvas(vertex.x, vertex.y);
    const color = this._getVertexColor(id);
    const isSelected = id === this.selectedVertexId;
    const isHover    = id === this.hoverVertexId;

    if (this.dotMode) {
      // ── Dot mode: just a colored point, no labels ───────────────────────────
      const isSpecial = id === this.sourceId || id === this.targetId ||
                        this.pathVertices.has(id);
      const r = isSpecial ? 5 : (isSelected || isHover ? 5 : 3);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    } else {
      // ── Full mode: circle + label ───────────────────────────────────────────
      const r = VERTEX_RADIUS;
      ctx.save();
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
      ctx.fillStyle   = color;
      ctx.fill();
      ctx.lineWidth   = (isHover || isSelected) ? 3 : 2;
      ctx.strokeStyle = isSelected ? '#F59E0B' : 'rgba(255,255,255,0.5)';
      ctx.stroke();

      if (this.scale > 0.25) {
        ctx.fillStyle    = '#FFFFFF';
        ctx.font         = `bold ${FONT_SIZE}px sans-serif`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(vertex.label, pos.x, pos.y);
      }
      if (this.scale > 0.5) {
        ctx.fillStyle    = '#374151';
        ctx.font         = `10px sans-serif`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`#${id}`, pos.x, pos.y + r + 2);
      }
      ctx.restore();
    }
  }

  _drawEdge(edge, id) {
    const vFrom = this._graph.vertices.get(edge.from);
    const vTo   = this._graph.vertices.get(edge.to);
    if (!vFrom || !vTo) return;

    const hasBoth = this._hasBothDirections(edge);
    const isPath  = this.pathEdges.has(id);
    const isHover = id === this.hoverEdgeId;
    const color   = isPath ? COLORS.edge.path : (isHover ? '#6B7280' : COLORS.edge.normal);
    const lw      = isPath ? PATH_EDGE_WIDTH : EDGE_WIDTH;

    if (hasBoth) {
      this._drawCurvedEdge(vFrom, vTo, edge, color, lw);
    } else {
      this._drawStraightEdge(vFrom, vTo, edge, color, lw);
    }
  }

  _drawStraightEdge(vFrom, vTo, edge, color, lineWidth) {
    const ctx = this.ctx;
    const pFrom = this.worldToCanvas(vFrom.x, vFrom.y);
    const pTo   = this.worldToCanvas(vTo.x,   vTo.y);

    const dx  = pTo.x - pFrom.x;
    const dy  = pTo.y - pFrom.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux  = dx / len;
    const uy  = dy / len;
    const r   = VERTEX_RADIUS;

    const startX = pFrom.x + ux * r;
    const startY = pFrom.y + uy * r;
    const endX   = pTo.x   - ux * r;
    const endY   = pTo.y   - uy * r;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth   = lineWidth;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    if (edge.directed) {
      this._drawArrow(endX, endY, ux, uy, color, lineWidth);
    }

    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const isPath = this.pathEdges.has(edge.id);
    this._drawWeightLabel(midX, midY, -uy, ux, edge.weight, isPath);

    ctx.restore();
  }

  _drawCurvedEdge(vFrom, vTo, edge, color, lineWidth) {
    const ctx   = this.ctx;
    const pFrom = this.worldToCanvas(vFrom.x, vFrom.y);
    const pTo   = this.worldToCanvas(vTo.x,   vTo.y);

    const dx  = pTo.x - pFrom.x;
    const dy  = pTo.y - pFrom.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux  = dx / len;
    const uy  = dy / len;
    const r   = VERTEX_RADIUS;

    const mx   = (pFrom.x + pTo.x) / 2;
    const my   = (pFrom.y + pTo.y) / 2;
    const cpx  = mx - uy * 35;
    const cpy  = my + ux * 35;

    const startX = pFrom.x + ux * r;
    const startY = pFrom.y + uy * r;

    const tx  = pTo.x - cpx;
    const ty  = pTo.y - cpy;
    const tl  = Math.sqrt(tx * tx + ty * ty) || 1;
    const endX = pTo.x - (tx / tl) * r;
    const endY = pTo.y - (ty / tl) * r;
    const arrUx = tx / tl;
    const arrUy = ty / tl;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth   = lineWidth;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(cpx, cpy, endX, endY);
    ctx.stroke();

    if (edge.directed) {
      this._drawArrow(endX, endY, arrUx, arrUy, color, lineWidth);
    }

    const isPath = this.pathEdges.has(edge.id);
    this._drawWeightLabel(cpx, cpy, 0, 0, edge.weight, isPath);
    ctx.restore();
  }

  _drawArrow(x, y, ux, uy, color, lineWidth) {
    const ctx  = this.ctx;
    const size = ARROW_SIZE;
    const spread = 0.4;

    const lx = -ux * size + uy * size * spread;
    const ly = -uy * size - ux * size * spread;
    const rx = -ux * size - uy * size * spread;
    const ry = -uy * size + ux * size * spread;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth   = lineWidth;
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(x + lx, y + ly);
    ctx.lineTo(x, y);
    ctx.lineTo(x + rx, y + ry);
    ctx.stroke();
    ctx.restore();
  }

  _drawWeightLabel(cx, cy, nx, ny, weight, isPath) {
    if (!this.showWeights) return;
    if (this.scale < 0.2) return;
    const ctx  = this.ctx;
    const text = String(weight);
    const offX = nx * 14;
    const offY = ny * 14;
    const lx   = cx + offX;
    const ly   = cy + offY;

    ctx.save();
    ctx.font         = `${WEIGHT_FONT_SIZE}px sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    const metrics = ctx.measureText(text);
    const tw = metrics.width + 6;
    const th = WEIGHT_FONT_SIZE + 4;

    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.roundRect(lx - tw / 2, ly - th / 2, tw, th, 3);
    ctx.fill();

    ctx.fillStyle = isPath ? '#92400E' : '#374151';
    ctx.fillText(text, lx, ly);
    ctx.restore();
  }

  async copyToClipboard() {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob(async (blob) => {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          resolve();
        } catch (err) {
          reject(err);
        }
      }, 'image/png');
    });
  }
}
