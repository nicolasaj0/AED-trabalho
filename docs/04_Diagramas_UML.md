# Diagramas UML do Sistema

**Projeto:** Sistema de Navegação Primitivo (Dijkstra)  
**Disciplina:** AED2 — INF/UFG 2026-1  
**Versão:** 1.0 | **Data:** 20/05/2026

> Todos os diagramas utilizam sintaxe Mermaid e renderizam em GitHub, GitLab e VSCode (extensão Mermaid Preview).

---

## 4.1 Diagrama de Classes

```mermaid
classDiagram
    direction TB

    class Vertex {
        +int id
        +float x
        +float y
        +string label
    }

    class Edge {
        +int id
        +int from
        +int to
        +float weight
        +boolean directed
    }

    class Graph {
        +Map vertices
        +Map edges
        -Map _adjacency
        -int _nextVertexId
        -int _nextEdgeId
        +addVertex(x, y, label) Vertex
        +removeVertex(id) void
        +addEdge(fromId, toId, weight, directed) Edge
        +removeEdge(id) void
        +getNeighbors(vertexId) Array
        +hasEdgeBetween(fromId, toId) boolean
        +clear() void
        +serialize() Object
        +deserialize(data) void
    }

    class MinHeap {
        -Array _data
        +int size
        +boolean isEmpty
        +push(priority, data) void
        +pop() Object
        +peek() Object
        -_bubbleUp(i) void
        -_sinkDown(i) void
        -_swap(a, b) void
    }

    class DijkstraResult {
        +Map dist
        +Map prev
        +int explored
        +float timeMs
        +int source
        +getPath(targetId) Array
        +getDistance(targetId) float
    }

    class Renderer {
        +HTMLCanvasElement canvas
        +CanvasRenderingContext2D ctx
        +float camX
        +float camY
        +float scale
        +int sourceId
        +int targetId
        +Set pathVertices
        +Set pathEdges
        +Set exploredVertices
        -Graph _graph
        -Set _directedSet
        +setGraph(graph) void
        +render(rubberBand) void
        +worldToCanvas(wx, wy) Object
        +canvasToWorld(cx, cy) Object
        +zoom(factor, cx, cy) void
        +pan(dx, dy) void
        +fitToScreen() void
        +resize() void
        +getVertexAt(cx, cy) int
        +getEdgeAt(cx, cy) int
        +setPath(pathVertexIds, result) void
        +clearPath() void
        +copyToClipboard() Promise
        -_rebuildDirectedIndex() void
        -_hasBothDirections(edge) boolean
        -_drawVertex(vertex, id) void
        -_drawEdge(edge, id) void
        -_drawGrid() void
        -_drawArrow(x, y, ux, uy, color, lw) void
        -_drawWeightLabel(cx, cy, nx, ny, weight, isPath) void
        -_inViewport(cx, cy, margin) boolean
    }

    class FileIO {
        +parseTXT(content) Graph$
        +parseXML(content) Graph$
        +parseJSON(content) Graph$
        +parsePOLY(content) Graph$
        +exportTXT(graph) string$
        +exportXML(graph) string$
        +exportJSON(graph) string$
        +downloadFile(content, filename, mimeType) void$
        -_escXML(str) string$
    }

    class App {
        +Graph graph
        +Renderer renderer
        +string mode
        +int sourceId
        +int targetId
        +DijkstraResult dijkstraResult
        -boolean isPanning
        -Object panStart
        -int edgeStart
        -Object rubberBand
        +init() void
        +setMode(mode) void
        +runDijkstra() void
        +updateStats() void
        -_bindToolbar() void
        -_bindCanvas() void
        -_bindKeyboard() void
        -_bindFileInput() void
        -_bindModals() void
        -_bindZoom() void
        -_onMouseDown(e) void
        -_onMouseMove(e) void
        -_onMouseUp(e) void
        -_onWheel(e) void
        -_clearPath() void
        -_clearAll() void
        -_copyImage() Promise
        -_exportTXT() void
        -_setStatus(text) void
        -_setMessage(text) void
        -_vertexLabel(id) string
        -_fmtNum(n) string
    }

    Graph "1" *-- "0..*" Vertex : contém
    Graph "1" *-- "0..*" Edge : contém
    App "1" --> "1" Graph : usa
    App "1" --> "1" Renderer : usa
    App "1" --> "1" FileIO : usa
    App "1" --> "0..1" DijkstraResult : tem
    Renderer "1" --> "1" Graph : referencia
    MinHeap ..> DijkstraResult : usado por runDijkstra()
```

---

## 4.2 Diagrama de Sequência — Calcular Caminho Mínimo

```mermaid
sequenceDiagram
    actor U as Usuário
    participant A as App
    participant G as Graph
    participant D as runDijkstra()
    participant H as MinHeap
    participant DR as DijkstraResult
    participant R as Renderer

    U->>A: clica "Calcular" (ou Enter)
    A->>A: verifica sourceId != null
    A->>A: verifica targetId != null
    A->>D: runDijkstra(graph, sourceId)
    D->>G: graph.vertices (iteração)
    D->>D: inicializa dist[v] = Infinity para todo v
    D->>D: dist[sourceId] = 0
    D->>H: new MinHeap()
    D->>H: push(0, sourceId)

    loop enquanto !heap.isEmpty
        D->>H: pop() → {priority: d, data: u}
        D->>D: se visited.has(u): continue
        D->>D: visited.add(u); explored++
        D->>G: getNeighbors(u) → [{to, weight, edgeId}]
        loop para cada vizinho v
            D->>D: alt = dist[u] + weight
            D->>D: se alt < dist[v]
            D->>D: dist[v] = alt; prev[v] = u
            D->>H: push(alt, v)
        end
    end

    D->>DR: new DijkstraResult(dist, prev, explored, timeMs, sourceId)
    D-->>A: retorna DijkstraResult
    A->>DR: getPath(targetId)
    DR->>DR: reconstrói caminho via prev[]
    DR-->>A: retorna Array de vertexIds (ou null)

    alt caminho encontrado
        A->>R: setPath(path, dijkstraResult)
        R->>R: popula pathVertices, pathEdges, exploredVertices
        A->>R: render(null)
        R->>R: rebuildDirectedIndex()
        R->>R: desenha edges (com culling)
        R->>R: desenha vertices (com culling)
        A->>A: updateStats()
        A->>A: _setMessage("Caminho encontrado! Custo: X")
    else sem caminho
        A->>R: clearPath()
        A->>R: render(null)
        A->>A: _setMessage("Sem caminho entre origem e destino")
    end

    A-->>U: canvas atualizado + painel com estatísticas
```

---

## 4.3 Diagrama de Sequência — Importar Mapa

```mermaid
sequenceDiagram
    actor U as Usuário
    participant A as App
    participant FI as FileIO
    participant FR as FileReader
    participant G as Graph
    participant R as Renderer

    U->>A: clica "Importar"
    A->>A: document.getElementById('file-input').click()
    A-->>U: diálogo nativo de arquivo (browser)
    U->>A: seleciona arquivo (ex: Campus2UFG.poly)

    A->>FR: new FileReader(); readAsText(file)
    FR-->>A: onload: ev.target.result = conteúdo

    A->>A: detecta extensão do arquivo

    alt extensão == "poly"
        A->>FI: FileIO.parsePOLY(content)
        FI->>FI: lê cabeçalho (nVerts)
        loop para cada vértice
            FI->>G: graph.addVertex(x, y, label)
        end
        FI->>FI: lê cabeçalho de arestas (nEdges)
        loop para cada aresta
            FI->>FI: calcula peso = distância euclidiana
            FI->>G: graph.addEdge(from, to, weight, directed)
        end
    else extensão == "txt"
        A->>FI: FileIO.parseTXT(content)
    else extensão == "xml"
        A->>FI: FileIO.parseXML(content)
    else extensão == "json"
        A->>FI: FileIO.parseJSON(content)
    end

    FI-->>A: retorna Graph populado

    A->>A: this.graph = newGraph
    A->>A: sourceId = null; targetId = null; dijkstraResult = null
    A->>R: renderer.setGraph(newGraph)
    A->>R: renderer.clearPath()
    A->>R: renderer.resize()
    A->>R: renderer.fitToScreen()
    A->>A: updateStats()
    A->>R: renderer.render(null)
    A->>A: _setMessage("Arquivo importado: nome (V vértices, E arestas)")
    A-->>U: canvas exibe o mapa importado
```

---

## 4.4 Diagrama de Atividades — Algoritmo de Dijkstra

```mermaid
flowchart TD
    Start([Início: runDijkstra\ngraph, sourceId]) --> Init

    Init["Inicializar:
    dist[v] = Infinity para todo v ∈ V
    prev[v] = null para todo v ∈ V
    visited = {} (conjunto vazio)
    explored = 0"]

    Init --> SetSource["dist[sourceId] = 0"]
    SetSource --> PushHeap["heap.push(0, sourceId)"]
    PushHeap --> CheckHeap{heap.isEmpty?}

    CheckHeap -->|Sim| BuildResult["Criar DijkstraResult
    (dist, prev, explored, timeMs, source)"]
    BuildResult --> Return([Retorna DijkstraResult])

    CheckHeap -->|Não| Pop["u, d = heap.pop()
    (extrai vértice de menor distância)"]
    Pop --> Visited{visited\ncontém u?}
    Visited -->|Sim| CheckHeap
    Visited -->|Não| MarkVisited["visited.add(u)
    explored++"]

    MarkVisited --> GetNeighbors["neighbors = graph.getNeighbors(u)"]
    GetNeighbors --> ForEach["Para cada {to: v, weight: w} em neighbors"]

    ForEach --> Relax["alt = dist[u] + w"]
    Relax --> BetterPath{alt < dist[v]?}

    BetterPath -->|Não| NextNeighbor{Mais\nvizinhos?}
    BetterPath -->|Sim| Update["dist[v] = alt
    prev[v] = u"]
    Update --> PushV["heap.push(alt, v)"]
    PushV --> NextNeighbor

    NextNeighbor -->|Sim| ForEach
    NextNeighbor -->|Não| CheckHeap

    style Start fill:#059669,color:#fff
    style Return fill:#059669,color:#fff
    style Init fill:#3B82F6,color:#fff
    style MarkVisited fill:#F59E0B,color:#fff
    style Update fill:#D97706,color:#fff
```

---

## 4.5 Diagrama de Atividades — Fluxo de Uso Principal

```mermaid
flowchart TD
    Start([Usuário abre o sistema\nno navegador]) --> GrafoVazio{Grafo\nvazio?}

    GrafoVazio -->|Sim| Escolha{Criar grafo\nou importar?}
    GrafoVazio -->|Não| SelOrigem

    Escolha -->|Importar arquivo| BtnImportar["Clica em 'Importar'\nSeleciona arquivo .txt/.xml/.json/.poly"]
    BtnImportar --> ParseArquivo["Sistema faz parsing\ndo arquivo"]
    ParseArquivo --> Valido{Arquivo\nválido?}
    Valido -->|Não| ErroMsg["Exibe mensagem de erro\nna barra de status"]
    ErroMsg --> Escolha
    Valido -->|Sim| MostraGrafo["Canvas exibe o grafo\nfit-to-screen automático"]

    Escolha -->|Criar manualmente| ModoVertice["Ativa modo '+Vértice'\n(tecla V)"]
    ModoVertice --> AddVertices["Adiciona vértices\nclicando no canvas"]
    AddVertices --> ModoAresta["Ativa modo '+Aresta'\n(tecla E)"]
    ModoAresta --> AddArestas["Conecta vértices\ndefine pesos e direção"]
    AddArestas --> MostraGrafo

    MostraGrafo --> SelOrigem["Ativa modo 'Origem' (S)\nClica no vértice de origem"]
    SelOrigem --> OrigemOk{Origem\nselecionada?}
    OrigemOk -->|Não, clique inválido| SelOrigem
    OrigemOk -->|Sim, verde| SelDestino

    SelDestino["Ativa modo 'Destino' (T)\nClica no vértice de destino"] --> DestinoOk{Destino ≠\nOrigem?}
    DestinoOk -->|Não| SelDestino
    DestinoOk -->|Sim, vermelho| Calcular

    Calcular["Clica 'Calcular' (Enter)\nExecuta Dijkstra"] --> CaminhoExiste{Caminho\nencontrado?}

    CaminhoExiste -->|Sim| MostraCaminho["Canvas destaca caminho (âmbar)\nnós explorados (azul)"]
    MostraCaminho --> MostraStats["Painel exibe:\nTempo | Nós explorados | Custo"]
    MostraStats --> ContinuarEditar

    CaminhoExiste -->|Não| MsgSemCaminho["Exibe: 'Sem caminho\nentre origem e destino'"]
    MsgSemCaminho --> ContinuarEditar

    ContinuarEditar{Continuar\nusando?}
    ContinuarEditar -->|Editar grafo| ModoVertice
    ContinuarEditar -->|Nova consulta| SelOrigem
    ContinuarEditar -->|Exportar| Export["Clica 'Exportar'\nBaixa grafo.txt"]
    ContinuarEditar -->|Copiar imagem| CopyImg["Ctrl+C\nImagem no clipboard"]
    ContinuarEditar -->|Sair| End([Fecha o navegador])

    Export --> ContinuarEditar
    CopyImg --> ContinuarEditar

    style Start fill:#059669,color:#fff
    style End fill:#DC2626,color:#fff
    style MostraCaminho fill:#D97706,color:#fff
    style MsgSemCaminho fill:#DC2626,color:#fff
```

---

## 4.6 Diagrama de Componentes

```mermaid
graph TB
    subgraph Browser["🌐 Navegador Web (Chrome / Firefox / Edge)"]
        subgraph UI["Camada de Interface (UI Layer)"]
            HTML["index.html\n(estrutura DOM)"]
            CSS["css/styles.css\n(estilização)"]
            MAIN["js/main.js\n(bootstrap)"]
        end

        subgraph CTRL["Camada de Controle (Controller Layer)"]
            APP["js/App.js\nApp (Controller)\n────────────────\neventos de mouse\nbotões da toolbar\nmodais\ntelclado"]
            CONST["js/constants.js\nCOLORS, MODES,\nsizes, zoom"]
        end

        subgraph LOGIC["Camada de Lógica (Logic Layer)"]
            GRAPH["js/Graph.js\nGraph, Vertex, Edge\n────────────────\nlista de adjacência\nadicionar/remover\nserializar"]
            DIJ["js/Dijkstra.js\nrunDijkstra()\nDijkstraResult\n────────────────\nGetPath()\nGetDistance()"]
            HEAP["js/MinHeap.js\nMinHeap\n────────────────\npush O(log n)\npop O(log n)"]
        end

        subgraph RENDER["Camada de Renderização (Rendering Layer)"]
            REND["js/Renderer.js\nRenderer\n────────────────\nCanvas 2D API\nviewport culling\nzoom/pan\ndirected index"]
        end

        subgraph DATA["Camada de Dados (Data Layer)"]
            FILEIO["js/FileIO.js\nFileIO (objeto)\n────────────────\nparseTXT / parseXML\nparseJSON / parsePOLY\nexportTXT / exportXML\nexportJSON"]
        end
    end

    subgraph FS["💾 Sistema de Arquivos Local"]
        TXT[".txt (grafo texto)"]
        XML[".xml (GraphML)"]
        JSON[".json (serialização)"]
        POLY[".poly (Campus UFG/OSM)"]
    end

    MAIN --> APP
    MAIN --> CONST
    APP --> GRAPH
    APP --> REND
    APP --> FILEIO
    APP --> DIJ
    DIJ --> HEAP
    DIJ --> GRAPH
    REND --> GRAPH
    REND --> HTML
    HTML --> CSS

    FILEIO -->|"FileReader (importar)"| FS
    FILEIO -->|"Blob download (exportar)"| FS

    style UI fill:#DBEAFE,stroke:#2563EB
    style CTRL fill:#FEF3C7,stroke:#D97706
    style LOGIC fill:#D1FAE5,stroke:#059669
    style RENDER fill:#FCE7F3,stroke:#DB2777
    style DATA fill:#F3E8FF,stroke:#7C3AED
    style FS fill:#F3F4F6,stroke:#6B7280
```
