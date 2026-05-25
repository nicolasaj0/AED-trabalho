class App {
  constructor() {
    this.graph          = new Graph();
    this.renderer       = new Renderer(document.getElementById('graph-canvas'));
    this.renderer.setGraph(this.graph);

    this.mode           = MODES.PAN;
    this.sourceId       = null;
    this.targetId       = null;
    this.dijkstraResult = null;

    this.isPanning  = false;
    this.panStart   = { x: 0, y: 0 };
    this.edgeStart  = null;
    this.rubberBand = null;

    this._pendingEdgeFrom = null;
    this._pendingEdgeTo   = null;
    this._pendingVertexWX = 0;
    this._pendingVertexWY = 0;
  }

  init() {
    this.renderer.resize();
    this._bindToolbar();
    this._bindCanvas();
    this._bindKeyboard();
    this._bindFileInput();
    this._bindModals();
    this._bindZoom();
    this.setMode(MODES.PAN);
    this.updateStats();
    this.renderer.render(null);
    this._updateHintText();
  }

  // ─── Mode ────────────────────────────────────────────────────────────────────

  setMode(mode) {
    this.mode       = mode;
    this.edgeStart  = null;
    this.rubberBand = null;
    this.renderer.selectedVertexId = null;

    const modeNames = {
      [MODES.PAN]:           'Arrastar',
      [MODES.ADD_VERTEX]:    'Adicionar Vértice',
      [MODES.ADD_EDGE]:      'Adicionar Aresta',
      [MODES.SELECT_SOURCE]: 'Selecionar Origem',
      [MODES.SELECT_TARGET]: 'Selecionar Destino',
      [MODES.DELETE]:        'Deletar',
    };
    this._setStatus(modeNames[mode] || mode);

    const btnMap = {
      [MODES.PAN]:           'btn-pan',
      [MODES.ADD_VERTEX]:    'btn-add-vertex',
      [MODES.ADD_EDGE]:      'btn-add-edge',
      [MODES.SELECT_SOURCE]: 'btn-select-source',
      [MODES.SELECT_TARGET]: 'btn-select-target',
      [MODES.DELETE]:        'btn-delete',
    };
    document.querySelectorAll('#mode-buttons .tool-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.getElementById(btnMap[mode]);
    if (activeBtn) activeBtn.classList.add('active');

    const canvas = this.renderer.canvas;
    const cursors = {
      [MODES.PAN]:           'grab',
      [MODES.ADD_VERTEX]:    'crosshair',
      [MODES.ADD_EDGE]:      'crosshair',
      [MODES.SELECT_SOURCE]: 'pointer',
      [MODES.SELECT_TARGET]: 'pointer',
      [MODES.DELETE]:        'not-allowed',
    };
    canvas.style.cursor = cursors[mode] || 'default';
  }

  // ─── Toolbar ─────────────────────────────────────────────────────────────────

  _bindToolbar() {
    const on = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', fn);
    };

    on('btn-pan',           () => this.setMode(MODES.PAN));
    on('btn-add-vertex',    () => this.setMode(MODES.ADD_VERTEX));
    on('btn-add-edge',      () => this.setMode(MODES.ADD_EDGE));
    on('btn-select-source', () => this.setMode(MODES.SELECT_SOURCE));
    on('btn-select-target', () => this.setMode(MODES.SELECT_TARGET));
    on('btn-delete',        () => this.setMode(MODES.DELETE));

    on('btn-run',           () => this.runDijkstra());
    on('btn-clear-path',    () => this._clearPath());
    on('btn-import',        () => document.getElementById('file-input').click());
    on('btn-export',        () => this._exportTXT());
    on('btn-copy-img',      () => this._copyImage());
    on('btn-clear-all',     () => this._clearAll());
    on('btn-dot-mode',      () => this._toggleDotMode());

    window.addEventListener('resize', () => {
      this.renderer.resize();
      this.renderer.render(this.rubberBand);
    });
  }

  // ─── Canvas Events ───────────────────────────────────────────────────────────

  _bindCanvas() {
    const canvas = this.renderer.canvas;
    canvas.addEventListener('mousedown',  e => this._onMouseDown(e));
    canvas.addEventListener('mousemove',  e => this._onMouseMove(e));
    canvas.addEventListener('mouseup',    e => this._onMouseUp(e));
    canvas.addEventListener('mouseleave', e => this._onMouseUp(e));
    canvas.addEventListener('wheel',      e => this._onWheel(e), { passive: false });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
  }

  _getCanvasPos(e) {
    const rect = this.renderer.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  _onMouseDown(e) {
    if (e.button !== 0) return;
    const pos    = this._getCanvasPos(e);
    const world  = this.renderer.canvasToWorld(pos.x, pos.y);
    const hitVtx = this.renderer.getVertexAt(pos.x, pos.y);

    switch (this.mode) {
      case MODES.PAN:
        this.isPanning = true;
        this.panStart  = pos;
        this.renderer.canvas.style.cursor = 'grabbing';
        break;

      case MODES.ADD_VERTEX:
        if (hitVtx !== null) break;
        this._pendingVertexWX = world.x;
        this._pendingVertexWY = world.y;
        this._showVertexModal();
        break;

      case MODES.ADD_EDGE:
        if (hitVtx === null) break;
        if (this.edgeStart === null) {
          this.edgeStart = hitVtx;
          this.renderer.selectedVertexId = hitVtx;
          this._setStatus('Clique no vértice destino');
        } else if (hitVtx !== this.edgeStart) {
          this._pendingEdgeFrom = this.edgeStart;
          this._pendingEdgeTo   = hitVtx;
          this._showEdgeModal();
        } else {
          this.edgeStart = null;
          this.renderer.selectedVertexId = null;
          this._setStatus('Adicionar Aresta');
        }
        this.renderer.render(this.rubberBand);
        break;

      case MODES.SELECT_SOURCE: {
        const prevSource = this.sourceId;
        if (hitVtx !== null) {
          this.sourceId = hitVtx === this.sourceId ? null : hitVtx;
          if (this.sourceId === this.targetId) this.targetId = null;
          this._clearPath();
          this.renderer.sourceId = this.sourceId;
          this.renderer.targetId = this.targetId;
          this.updateStats();
          this._setMessage(this.sourceId ? `Origem: ${this._vertexLabel(this.sourceId)}` : 'Origem removida');
        }
        this.renderer.render(this.rubberBand);
        break;
      }

      case MODES.SELECT_TARGET: {
        if (hitVtx !== null) {
          this.targetId = hitVtx === this.targetId ? null : hitVtx;
          if (this.targetId === this.sourceId) this.sourceId = null;
          this._clearPath();
          this.renderer.sourceId = this.sourceId;
          this.renderer.targetId = this.targetId;
          this.updateStats();
          this._setMessage(this.targetId ? `Destino: ${this._vertexLabel(this.targetId)}` : 'Destino removido');
        }
        this.renderer.render(this.rubberBand);
        break;
      }

      case MODES.DELETE: {
        if (hitVtx !== null) {
          if (hitVtx === this.sourceId) { this.sourceId = null; this.renderer.sourceId = null; }
          if (hitVtx === this.targetId) { this.targetId = null; this.renderer.targetId = null; }
          this.graph.removeVertex(hitVtx);
          this._clearPath();
          this.updateStats();
          this._setMessage('Vértice removido');
        } else {
          const hitEdge = this.renderer.getEdgeAt(pos.x, pos.y);
          if (hitEdge !== null) {
            this.graph.removeEdge(hitEdge);
            this._clearPath();
            this.updateStats();
            this._setMessage('Aresta removida');
          }
        }
        this._updateHintText();
        this.renderer.render(this.rubberBand);
        break;
      }
    }
  }

  _onMouseMove(e) {
    const pos   = this._getCanvasPos(e);
    const world = this.renderer.canvasToWorld(pos.x, pos.y);

    const coordEl = document.getElementById('status-coords');
    if (coordEl) coordEl.textContent = `x: ${Math.round(world.x)}  y: ${Math.round(world.y)}`;

    if (this.isPanning) {
      const dx = pos.x - this.panStart.x;
      const dy = pos.y - this.panStart.y;
      this.renderer.pan(dx, dy);
      this.panStart = pos;
      this.renderer.render(this.rubberBand);
      return;
    }

    const prevHoverV = this.renderer.hoverVertexId;
    const prevHoverE = this.renderer.hoverEdgeId;
    this.renderer.hoverVertexId = this.renderer.getVertexAt(pos.x, pos.y);
    this.renderer.hoverEdgeId   = this.renderer.hoverVertexId !== null
      ? null
      : this.renderer.getEdgeAt(pos.x, pos.y);

    if (this.mode === MODES.ADD_EDGE && this.edgeStart !== null) {
      this.rubberBand = pos;
      this.renderer.render(this.rubberBand);
      return;
    }

    if (prevHoverV !== this.renderer.hoverVertexId || prevHoverE !== this.renderer.hoverEdgeId) {
      this.renderer.render(this.rubberBand);
    }
  }

  _onMouseUp(e) {
    if (this.isPanning) {
      this.isPanning = false;
      this.renderer.canvas.style.cursor = 'grab';
    }
  }

  _onWheel(e) {
    e.preventDefault();
    const pos    = this._getCanvasPos(e);
    const factor = e.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
    this.renderer.zoom(factor, pos.x, pos.y);
    this.renderer.render(this.rubberBand);
    this.updateStats();
  }

  // ─── Keyboard ────────────────────────────────────────────────────────────────

  _bindKeyboard() {
    document.addEventListener('keydown', e => {
      const tag = (e.target.tagName || '').toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const modeKeys = {
        'p': MODES.PAN,
        'v': MODES.ADD_VERTEX,
        'e': MODES.ADD_EDGE,
        's': MODES.SELECT_SOURCE,
        't': MODES.SELECT_TARGET,
      };

      const key = e.key.toLowerCase();

      if (modeKeys[key] && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        this.setMode(modeKeys[key]);
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && !e.ctrlKey) {
        e.preventDefault();
        this.setMode(MODES.DELETE);
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        this.runDijkstra();
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        if (this.edgeStart !== null) {
          this.edgeStart = null;
          this.rubberBand = null;
          this.renderer.selectedVertexId = null;
          this.renderer.render(null);
          this._setStatus('Adicionar Aresta');
        } else {
          this._clearPath();
          this.sourceId = null;
          this.targetId = null;
          this.renderer.sourceId = null;
          this.renderer.targetId = null;
          this.updateStats();
          this.renderer.render(null);
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        this._copyImage();
        return;
      }

      if (key === 'd' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        this._toggleDotMode();
        return;
      }
    });
  }

  // ─── Dijkstra ────────────────────────────────────────────────────────────────

  runDijkstra() {
    if (this.sourceId === null || !this.graph.vertices.has(this.sourceId)) {
      this._setMessage('Selecione um vértice de origem primeiro (modo Origem)');
      return;
    }
    if (this.targetId === null || !this.graph.vertices.has(this.targetId)) {
      this._setMessage('Selecione um vértice de destino primeiro (modo Destino)');
      return;
    }

    this.dijkstraResult = runDijkstra(this.graph, this.sourceId);
    const path          = this.dijkstraResult.getPath(this.targetId);

    if (!path) {
      this._setMessage('Sem caminho entre origem e destino');
      this.renderer.clearPath();
      this.renderer.render(null);
      this.updateStats();
      return;
    }

    this.renderer.setPath(path, this.dijkstraResult);
    this.updateStats();
    this.renderer.render(null);
    const dist = this.dijkstraResult.getDistance(this.targetId);
    this._setMessage(`Caminho encontrado! Custo total: ${this._fmtNum(dist)}`);
  }

  // ─── Stats ───────────────────────────────────────────────────────────────────

  updateStats() {
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    set('stat-vertices', this.graph.vertices.size);
    set('stat-edges',    this.graph.edges.size);

    set('stat-source', this.sourceId !== null && this.graph.vertices.has(this.sourceId)
      ? this._vertexLabel(this.sourceId) : '—');
    set('stat-target', this.targetId !== null && this.graph.vertices.has(this.targetId)
      ? this._vertexLabel(this.targetId) : '—');

    const result = this.dijkstraResult;
    if (result && this.targetId !== null) {
      const dist = result.getDistance(this.targetId);
      const path = result.getPath(this.targetId);
      set('stat-distance', dist !== null ? this._fmtNum(dist) : '∞');
      set('stat-cost',     dist !== null ? this._fmtNum(dist) : '∞');
      set('stat-path',     path ? path.map(id => this._vertexLabel(id)).join(' → ') : '—');
      set('stat-time',     result.timeMs.toFixed(3) + ' ms');
      set('stat-explored', result.explored);
    } else {
      set('stat-distance', '—');
      set('stat-cost',     '—');
      set('stat-path',     '—');
      set('stat-time',     '—');
      set('stat-explored', '—');
    }

    set('zoom-level', Math.round(this.renderer.scale * 100) + '%');
  }

  // ─── Edge Modal ──────────────────────────────────────────────────────────────

  _showEdgeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
      overlay.classList.remove('hidden');
      const wInput = document.getElementById('modal-weight');
      if (wInput) { wInput.value = '1'; wInput.focus(); wInput.select(); }
      const dir = document.getElementById('modal-dir-undirected');
      if (dir) dir.checked = true;
    }
  }

  _bindModals() {
    const confirmEdgeBtn = document.getElementById('modal-confirm');
    const cancelEdgeBtn  = document.getElementById('modal-cancel');
    if (confirmEdgeBtn) confirmEdgeBtn.addEventListener('click', () => this._confirmEdge());
    if (cancelEdgeBtn)  cancelEdgeBtn.addEventListener('click',  () => this._cancelEdge());

    const edgeOverlay = document.getElementById('modal-overlay');
    if (edgeOverlay) {
      edgeOverlay.addEventListener('keydown', e => {
        if (e.key === 'Enter')  { e.preventDefault(); this._confirmEdge(); }
        if (e.key === 'Escape') { e.preventDefault(); this._cancelEdge();  }
      });
    }

    const confirmVertexBtn = document.getElementById('vertex-modal-confirm');
    const cancelVertexBtn  = document.getElementById('vertex-modal-cancel');
    if (confirmVertexBtn) confirmVertexBtn.addEventListener('click', () => this._confirmVertex());
    if (cancelVertexBtn)  cancelVertexBtn.addEventListener('click',  () => this._cancelVertex());

    const vertexOverlay = document.getElementById('vertex-modal-overlay');
    if (vertexOverlay) {
      vertexOverlay.addEventListener('keydown', e => {
        if (e.key === 'Enter')  { e.preventDefault(); this._confirmVertex(); }
        if (e.key === 'Escape') { e.preventDefault(); this._cancelVertex();  }
      });
    }
  }

  _confirmEdge() {
    const weightEl = document.getElementById('modal-weight');
    const dirEl    = document.querySelector('input[name="modal-direction"]:checked');
    const overlay  = document.getElementById('modal-overlay');

    const weight   = parseFloat(weightEl ? weightEl.value : '1') || 1;
    const directed = dirEl ? dirEl.value === 'directed' : false;

    if (this._pendingEdgeFrom !== null && this._pendingEdgeTo !== null) {
      this.graph.addEdge(this._pendingEdgeFrom, this._pendingEdgeTo, weight, directed);
      this._setMessage('Aresta criada');
      this.updateStats();
      this._updateHintText();
    }

    if (overlay) overlay.classList.add('hidden');
    this.edgeStart  = null;
    this.rubberBand = null;
    this.renderer.selectedVertexId = null;
    this._pendingEdgeFrom = null;
    this._pendingEdgeTo   = null;
    this.renderer.render(null);
  }

  _cancelEdge() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.add('hidden');
    this.edgeStart  = null;
    this.rubberBand = null;
    this.renderer.selectedVertexId = null;
    this._pendingEdgeFrom = null;
    this._pendingEdgeTo   = null;
    this.renderer.render(null);
  }

  // ─── Vertex Modal ────────────────────────────────────────────────────────────

  _showVertexModal() {
    const overlay = document.getElementById('vertex-modal-overlay');
    if (overlay) {
      overlay.classList.remove('hidden');
      const lInput = document.getElementById('vertex-modal-label');
      if (lInput) {
        lInput.value = '';
        lInput.focus();
      }
    }
  }

  _confirmVertex() {
    const labelEl = document.getElementById('vertex-modal-label');
    const overlay = document.getElementById('vertex-modal-overlay');
    const label   = labelEl ? labelEl.value.trim() : '';

    this.graph.addVertex(this._pendingVertexWX, this._pendingVertexWY, label || null);
    if (overlay) overlay.classList.add('hidden');
    this._setMessage('Vértice adicionado');
    this.updateStats();
    this._updateHintText();
    this.renderer.render(null);
  }

  _cancelVertex() {
    const overlay = document.getElementById('vertex-modal-overlay');
    if (overlay) overlay.classList.add('hidden');
  }

  // ─── File I/O ────────────────────────────────────────────────────────────────

  _bindFileInput() {
    const input = document.getElementById('file-input');
    if (!input) return;
    input.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const content = ev.target.result;
        const ext     = file.name.split('.').pop().toLowerCase();
        try {
          let newGraph;
          if (ext === 'txt')        newGraph = FileIO.parseTXT(content);
          else if (ext === 'xml')   newGraph = FileIO.parseXML(content);
          else if (ext === 'json')  newGraph = FileIO.parseJSON(content);
          else if (ext === 'poly')  newGraph = FileIO.parsePOLY(content);
          else { this._setMessage('Formato não suportado: use .txt, .xml, .json ou .poly'); return; }

          this.graph          = newGraph;
          this.sourceId       = null;
          this.targetId       = null;
          this.dijkstraResult = null;
          this.edgeStart      = null;
          this.rubberBand     = null;

          this.renderer.setGraph(this.graph);
          this.renderer.sourceId = null;
          this.renderer.targetId = null;
          this.renderer.clearPath();
          this.renderer.resize();
          this.renderer.fitToScreen();
          this.updateStats();
          this._updateHintText();
          this.renderer.render(null);
          this._setMessage(`Arquivo importado: ${file.name} (${this.graph.vertices.size} vértices, ${this.graph.edges.size} arestas)`);
        } catch (err) {
          this._setMessage(`Erro ao importar: ${err.message}`);
          console.error(err);
        }
        input.value = '';
      };
      reader.readAsText(file);
    });
  }

  _exportTXT() {
    const content = FileIO.exportTXT(this.graph);
    FileIO.downloadFile(content, 'grafo.txt', 'text/plain');
    this._setMessage('Grafo exportado como grafo.txt');
  }

  // ─── Zoom Controls ───────────────────────────────────────────────────────────

  _bindZoom() {
    const on = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', fn);
    };
    on('btn-zoom-in',  () => {
      const cx = this.renderer.canvas.width  / 2;
      const cy = this.renderer.canvas.height / 2;
      this.renderer.zoom(ZOOM_FACTOR, cx, cy);
      this.renderer.render(null);
      this.updateStats();
    });
    on('btn-zoom-out', () => {
      const cx = this.renderer.canvas.width  / 2;
      const cy = this.renderer.canvas.height / 2;
      this.renderer.zoom(1 / ZOOM_FACTOR, cx, cy);
      this.renderer.render(null);
      this.updateStats();
    });
    on('btn-zoom-fit', () => {
      this.renderer.fitToScreen();
      this.renderer.render(null);
      this.updateStats();
    });
    on('btn-zoom-reset', () => {
      this.renderer.scale = 1;
      this.renderer.camX  = 0;
      this.renderer.camY  = 0;
      this.renderer.render(null);
      this.updateStats();
    });
  }

  // ─── Actions ─────────────────────────────────────────────────────────────────

  _toggleDotMode() {
    this.renderer.dotMode = !this.renderer.dotMode;
    const btn = document.getElementById('btn-dot-mode');
    if (btn) btn.classList.toggle('active', this.renderer.dotMode);
    this._setMessage(this.renderer.dotMode ? 'Modo ponto ativado' : 'Modo ponto desativado');
    this.renderer.render(null);
  }

  _clearPath() {
    this.dijkstraResult = null;
    this.renderer.clearPath();
    this.updateStats();
    this.renderer.render(null);
  }

  _clearAll() {
    if (!confirm('Limpar todo o grafo? Esta ação não pode ser desfeita.')) return;
    this.graph.clear();
    this.sourceId       = null;
    this.targetId       = null;
    this.dijkstraResult = null;
    this.edgeStart      = null;
    this.rubberBand     = null;
    this.renderer.sourceId = null;
    this.renderer.targetId = null;
    this.renderer.clearPath();
    this.renderer.selectedVertexId = null;
    this.updateStats();
    this._updateHintText();
    this.renderer.render(null);
    this._setMessage('Grafo limpo');
  }

  async _copyImage() {
    try {
      await this.renderer.copyToClipboard();
      this._setMessage('Imagem copiada para a área de transferência!');
    } catch (err) {
      this._setMessage('Não foi possível copiar a imagem: ' + err.message);
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  _setStatus(text) {
    const el = document.getElementById('status-mode');
    if (el) el.textContent = text;
  }

  _setMessage(text) {
    const el = document.getElementById('status-message');
    if (el) {
      el.textContent = text;
      clearTimeout(this._msgTimeout);
      this._msgTimeout = setTimeout(() => { el.textContent = ''; }, 4000);
    }
  }

  _vertexLabel(id) {
    const v = this.graph.vertices.get(id);
    return v ? v.label : String(id);
  }

  _fmtNum(n) {
    if (n === null || n === undefined) return '—';
    if (Number.isInteger(n)) return String(n);
    return n.toFixed(2).replace(/\.?0+$/, '');
  }

  _updateHintText() {
    const hint = document.getElementById('hint-text');
    if (!hint) return;
    hint.style.display = this.graph.vertices.size === 0 ? 'block' : 'none';
  }
}
