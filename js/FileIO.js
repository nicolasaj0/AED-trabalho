const FileIO = {
  parseTXT(content) {
    const graph   = new Graph();
    const idMap   = new Map();
    const lines   = content.split('\n');
    const edgeBuf = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      const parts = line.split(/\s+/);
      if (parts[0] === 'V') {
        const fileId = parseInt(parts[1], 10);
        const x      = parseFloat(parts[2]);
        const y      = parseFloat(parts[3]);
        const label  = parts[4] || String(fileId);
        const vertex = graph.addVertex(x, y, label);
        idMap.set(fileId, vertex.id);
      } else if (parts[0] === 'E') {
        edgeBuf.push({
          fromFile: parseInt(parts[1], 10),
          toFile:   parseInt(parts[2], 10),
          weight:   parseFloat(parts[3]),
          directed: parseInt(parts[4], 10) === 1,
        });
      }
    }

    for (const e of edgeBuf) {
      const fromId = idMap.get(e.fromFile);
      const toId   = idMap.get(e.toFile);
      if (fromId !== undefined && toId !== undefined) {
        graph.addEdge(fromId, toId, e.weight, e.directed);
      }
    }

    return graph;
  },

  parseXML(content) {
    const parser = new DOMParser();
    const doc    = parser.parseFromString(content, 'application/xml');
    const graph  = new Graph();
    const idMap  = new Map();

    const nodes = doc.querySelectorAll('node');
    for (const node of nodes) {
      const fileId = node.getAttribute('id');
      const x      = parseFloat(node.getAttribute('x') || 0);
      const y      = parseFloat(node.getAttribute('y') || 0);
      const label  = node.getAttribute('label') || fileId;
      const vertex = graph.addVertex(x, y, label);
      idMap.set(fileId, vertex.id);
    }

    const edges = doc.querySelectorAll('edge');
    for (const edge of edges) {
      const srcAttr  = edge.getAttribute('source');
      const tgtAttr  = edge.getAttribute('target');
      const weight   = parseFloat(edge.getAttribute('weight') || 1);
      const dirAttr  = edge.getAttribute('directed');
      const directed = dirAttr === 'true' || dirAttr === '1';
      const fromId   = idMap.get(srcAttr);
      const toId     = idMap.get(tgtAttr);
      if (fromId !== undefined && toId !== undefined) {
        graph.addEdge(fromId, toId, weight, directed);
      }
    }

    return graph;
  },

  parseJSON(content) {
    const graph = new Graph();
    graph.deserialize(JSON.parse(content));
    return graph;
  },

  // Formato .poly gerado pelo ConverteMapaParaGrafo.c do prof. André Moura (UFG)
  // Linha 1: <nVerts> <2> <0> <1>
  // Próximas nVerts linhas: <id> <x> <y>
  // Linha seguinte: <nEdges> <1>
  // Próximas nEdges linhas: <edgeId> <from> <to> <directed(0|1)>
  // Última linha: 0
  parsePOLY(content) {
    const graph = new Graph();
    const lines = content.split('\n');
    let i = 0;

    // skip blank/comment lines helper
    const nextLine = () => {
      while (i < lines.length) {
        const l = lines[i++].trim();
        if (l && !l.startsWith('#')) return l.split(/\s+/);
      }
      return null;
    };

    // Header: numVertices ...
    const header = nextLine();
    if (!header) return graph;
    const numVerts = parseInt(header[0], 10);

    // Read vertices
    const idMap = new Map(); // file id -> graph id
    for (let v = 0; v < numVerts; v++) {
      const parts = nextLine();
      if (!parts) break;
      const fileId = parseInt(parts[0], 10);
      const x      = parseFloat(parts[1]);
      const y      = parseFloat(parts[2]);
      const vertex = graph.addVertex(x, y, String(fileId));
      idMap.set(fileId, vertex.id);
    }

    // Edge header: numEdges ...
    const edgeHeader = nextLine();
    if (!edgeHeader) return graph;
    const numEdges = parseInt(edgeHeader[0], 10);

    // Read edges — weight = Euclidean distance between endpoints
    for (let e = 0; e < numEdges; e++) {
      const parts = nextLine();
      // terminator is a single "0" token; first edge also has id 0 but has 4 tokens
      if (!parts || (parts.length === 1 && parts[0] === '0')) break;
      const from     = idMap.get(parseInt(parts[1], 10));
      const to       = idMap.get(parseInt(parts[2], 10));
      const directed = parseInt(parts[3], 10) === 1;
      if (from !== undefined && to !== undefined) {
        const vf = graph.vertices.get(from);
        const vt = graph.vertices.get(to);
        const dx = vt.x - vf.x, dy = vt.y - vf.y;
        const weight = Math.round(Math.sqrt(dx * dx + dy * dy) * 10) / 10;
        graph.addEdge(from, to, weight, directed);
      }
    }

    return graph;
  },

  exportTXT(graph) {
    const lines = [
      '# Grafo exportado pelo Sistema de Navegação Dijkstra',
      '# Formato: V <id> <x> <y> <label>',
      '#          E <fromId> <toId> <peso> <0=nao-direcionado|1=direcionado>',
      '',
    ];

    for (const [id, v] of graph.vertices) {
      lines.push(`V ${id} ${v.x} ${v.y} ${v.label}`);
    }
    lines.push('');
    for (const [id, e] of graph.edges) {
      lines.push(`E ${e.from} ${e.to} ${e.weight} ${e.directed ? 1 : 0}`);
    }
    return lines.join('\n');
  },

  exportXML(graph) {
    const lines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<graphml xmlns="http://graphml.graphdrawing.org/graphml">',
      '  <graph id="G" edgedefault="undirected">',
    ];

    for (const [id, v] of graph.vertices) {
      lines.push(
        `    <node id="${id}" x="${v.x}" y="${v.y}" label="${this._escXML(v.label)}"/>`
      );
    }
    for (const [id, e] of graph.edges) {
      lines.push(
        `    <edge id="${id}" source="${e.from}" target="${e.to}" weight="${e.weight}" directed="${e.directed}"/>`
      );
    }

    lines.push('  </graph>');
    lines.push('</graphml>');
    return lines.join('\n');
  },

  exportJSON(graph) {
    return JSON.stringify(graph.serialize(), null, 2);
  },

  _escXML(str) {
    return String(str)
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;');
  },

  downloadFile(content, filename, mimeType) {
    const blob   = new Blob([content], { type: mimeType });
    const url    = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href     = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  },
};
