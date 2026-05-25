# Documento de Arquitetura do Sistema

**Projeto:** Sistema de Navegação Primitivo (Dijkstra)  
**Disciplina:** AED2 — INF/UFG 2026-1  
**Professor:** André L. Moura  
**Versão:** 1.0 | **Data:** 20/05/2026

---

## 1. Visão Geral da Arquitetura

O sistema é uma **aplicação web cliente (client-side only)**: toda a lógica de processamento, incluindo a leitura de arquivos, a construção do grafo, a execução do algoritmo de Dijkstra e a renderização visual, é realizada exclusivamente no navegador do usuário. Não existe componente servidor, banco de dados externo ou chamada de rede durante a operação normal.

A arquitetura segue um padrão de **camadas horizontais**, onde cada camada tem responsabilidades bem definidas e se comunica apenas com a camada imediatamente adjacente (ou via o controlador central). O fluxo de dados é fundamentalmente unidirecional: dados entram pelo sistema de arquivos ou pela interface do usuário, transitam pelo modelo de domínio (grafo), são processados pelo algoritmo e saem pela camada de renderização para o canvas.

```
[Usuário / Sistema de Arquivos]
         ↓ ↑
  ┌─────────────────────────────────┐
  │    App.js (Controller)          │  ← Orquestra todas as camadas
  └───────┬───────┬────────┬────────┘
          ↓       ↓        ↓
  ┌───────────┐ ┌──────┐ ┌────────┐
  │ Graph.js  │ │Dijk- │ │FileIO  │  ← Modelo e Dados
  │ Vertex    │ │stra  │ │.js     │
  │ Edge      │ │.js   │ └────────┘
  └───────────┘ │Heap  │
                │.js   │
                └──────┘
                    ↓
          ┌─────────────────┐
          │  Renderer.js    │  ← Visualização
          └────────┬────────┘
                   ↓
          ┌─────────────────┐
          │  Canvas HTML5   │  ← Saída visual
          └─────────────────┘
```

---

## 2. Padrão Arquitetural

O sistema adota um padrão **MVC-like (Model-View-Controller)**, adaptado ao contexto de aplicação de página única em JavaScript vanilla:

### Model (Modelo)
- **`Graph.js`** — representa o domínio do problema: grafos, vértices e arestas. Mantém o estado do grafo (estruturas de dados, adjacência) e expõe operações para manipulá-lo. É completamente independente da interface visual.
- **`Dijkstra.js` + `MinHeap.js`** — lógica de negócio do algoritmo. A função `runDijkstra()` recebe um `Graph` e um `sourceId`, executa o algoritmo e retorna um `DijkstraResult` imutável. Nenhuma dependência de DOM ou canvas.
- **`constants.js`** — configuração global do domínio (cores, tamanhos, modos, limites de zoom).

### View (Visão)
- **`Renderer.js`** — responsável exclusivamente por transformar o estado do `Graph` em pixels no `HTMLCanvasElement`. Não altera o estado do grafo; apenas lê seus vértices e arestas. Mantém o estado da câmera (camX, camY, scale) e as seleções visuais (sourceId, targetId, pathVertices, etc.).
- **`index.html` + `css/styles.css`** — estrutura e estilização da interface: toolbar, painel lateral, canvas, barra de status e modais.

### Controller (Controlador)
- **`App.js`** — orquestra a interação entre Model e View. Captura eventos do DOM (cliques, teclado, roda do mouse), atualiza o `Graph` (via suas APIs), invoca o algoritmo e notifica o `Renderer` para redesenhar. Mantém o estado de interação (modo atual, seleções de origem/destino, estado de pan/zoom, dados pendentes para modais).
- **`main.js`** — ponto de entrada: instancia `App` e chama `app.init()` após o carregamento do DOM.
- **`FileIO.js`** — utilitário de I/O (pode ser considerado parte do Controller ou uma camada de serviço): parseia arquivos externos e os converte em objetos `Graph`, e serializa `Graph` para formatos de arquivo.

---

## 3. Módulos e Responsabilidades

| Módulo | Arquivo | Responsabilidade | Dependências |
|---|---|---|---|
| **Constantes** | `js/constants.js` | Define todas as constantes globais: `COLORS`, `MODES`, `VERTEX_RADIUS`, `ARROW_SIZE`, `MIN_ZOOM`, `MAX_ZOOM`, `ZOOM_FACTOR` etc. | Nenhuma |
| **Min-Heap** | `js/MinHeap.js` | Implementa uma fila de prioridade mínima como heap binária. Operações: `push(priority, data)`, `pop()`, `peek()`. Complexidade O(log n) por operação. | Nenhuma |
| **Grafo** | `js/Graph.js` | Define as classes `Vertex`, `Edge` e `Graph`. Mantém lista de adjacência (`Map<id, Array>`). Operações CRUD de vértices e arestas. Serialização/desserialização. | Nenhuma |
| **Dijkstra** | `js/Dijkstra.js` | Implementa `runDijkstra(graph, sourceId)` e a classe `DijkstraResult`. Usa `MinHeap` como fila de prioridade. Retorna distâncias, predecessores, contagem de nós explorados e tempo de execução. | `MinHeap.js`, `Graph.js` |
| **Renderizador** | `js/Renderer.js` | Desenha o grafo no canvas HTML5: vértices, arestas (com setas), rótulos, pesos, grade de fundo, efeito hover. Implementa viewport culling, pan, zoom, fit-to-screen e cópia para clipboard. | `constants.js`, `Graph.js` |
| **E/S de Arquivo** | `js/FileIO.js` | Parseia arquivos `.txt`, `.xml`, `.json` e `.poly` e constrói objetos `Graph`. Serializa `Graph` para os formatos `.txt`, `.xml` e `.json`. Dispara download de arquivos via Blob. | `Graph.js` |
| **Controlador** | `js/App.js` | Gerencia eventos de UI (mouse, teclado, botões), coordena Model e View, exibe modais de criação de vértices/arestas, executa o Dijkstra e atualiza o painel de estatísticas. | Todos os demais módulos |
| **Bootstrap** | `js/main.js` | Aguarda o carregamento do DOM e instancia/inicializa o `App`. | `App.js` |

---

## 4. Fluxo de Dados

### 4.1 Importação de Arquivo

```
Arquivo local (.poly/.txt/.xml/.json)
        ↓
    FileReader API (leitura assíncrona)
        ↓
    FileIO.parsePOLY() / parseTXT() / parseXML() / parseJSON()
        ↓
    Novo objeto Graph (vértices e arestas populados)
        ↓
    App: graph = newGraph; sourceId = null; targetId = null
        ↓
    Renderer.setGraph(graph) → Renderer.fitToScreen() → Renderer.render()
        ↓
    Canvas HTML5 (desenho do mapa completo)
```

### 4.2 Execução do Dijkstra

```
Evento: clique em "Calcular" ou tecla Enter
        ↓
    App.runDijkstra()
        ↓
    runDijkstra(graph, sourceId)          ← Dijkstra.js
        ↓
    MinHeap (fila de prioridade)           ← MinHeap.js
    Graph.getNeighbors(u)                  ← Graph.js
        ↓
    DijkstraResult {dist, prev, explored, timeMs}
        ↓
    DijkstraResult.getPath(targetId)      ← reconstrução do caminho
        ↓
    Renderer.setPath(path, result)         ← Renderer.js
        ↓
    Renderer.render()                      ← canvas atualizado
        ↓
    App.updateStats()                      ← painel lateral atualizado
```

### 4.3 Edição Interativa do Grafo

```
Evento: clique do mouse no canvas
        ↓
    App._onMouseDown(e)
        ↓
    Renderer.canvasToWorld(cx, cy)         ← converte coordenadas
    Renderer.getVertexAt(cx, cy)           ← hit testing
        ↓
    Conforme o modo:
        ADD_VERTEX → modal → Graph.addVertex()
        ADD_EDGE   → modal → Graph.addEdge()
        DELETE     → Graph.removeVertex() / removeEdge()
        SELECT_*   → App.sourceId/targetId = vertexId
        PAN        → Renderer.pan(dx, dy)
        WHEEL      → Renderer.zoom(factor, cx, cy)
        ↓
    Renderer.render()                      ← redesenha
    App.updateStats()                      ← painel atualizado
```

---

## 5. Estruturas de Dados Principais

### 5.1 Lista de Adjacência

**Implementação:** `Map<vertexId: int, Array<{to: int, weight: float, edgeId: int}>>`

A lista de adjacência foi escolhida sobre a matriz de adjacência pelas seguintes razões:

- **Esparsidade:** O grafo do Campus UFG tem ~10.000 vértices. Uma matriz de adjacência exigiria 10.000² = 100.000.000 células, consumindo ~800 MB apenas para a estrutura. A lista de adjacência usa O(V + E) de memória — aproximadamente 10.000 + 11.526 ≈ 21.526 entradas.
- **Iteração de vizinhos:** O Dijkstra itera sobre os vizinhos de cada vértice. Com lista de adjacência, isso é O(grau(u)), enquanto a matriz exigiria varrer todas as V colunas.
- **Inserção/remoção:** Adicionar uma aresta é O(1) (append na lista). Remover é O(grau(u)) na lista, versus O(1) na matriz — mas como o grafo é esparso, O(grau) é pequeno na prática.

A estrutura é mantida em `Graph._adjacency` (Map privado). A lista de cada vértice inclui o `edgeId` para permitir que o `Renderer` identifique qual aresta está no caminho mínimo.

### 5.2 Heap Mínima Binária

**Implementação:** `MinHeap` — array `_data: Array<{priority: float, data: any}>` onde o invariante de heap é mantido.

Operações:
- `push(priority, data)`: append + `_bubbleUp()` → O(log n)
- `pop()`: swap root com último + `_sinkDown()` → O(log n)
- `peek()`: acesso ao índice 0 → O(1)

O índice do pai do nó i é `(i-1) >> 1`. Os filhos de i são `2i+1` (esquerdo) e `2i+2` (direito).

**Por que não uma busca linear?** Em cada iteração do Dijkstra, precisamos extrair o vértice de menor distância. Uma busca linear em um vetor teria custo O(V) por extração, resultando em O(V²) no total — inviável para 10.000 vértices. Com a heap mínima, cada extração custa O(log V), resultando em O((V+E) log V) no total.

**Lazy deletion:** A heap aceita inserções duplicadas de um mesmo vértice com prioridades diferentes (quando uma distância é atualizada). A detecção de duplicatas usa a verificação `if (d > dist.get(u)) continue` após extrair da heap — apenas o primeiro pop de cada vértice (com a menor distância) é processado.

### 5.3 Vetor de Distâncias

**Implementação:** `Map<vertexId: int, distance: float>`

Inicializado com `Infinity` para todos os vértices (exceto a origem, que recebe 0). A escolha de `Map` sobre array plano é necessária porque os IDs dos vértices podem não ser contíguos (especialmente após remoções de vértices durante a edição do grafo). O acesso é O(1) amortizado.

### 5.4 Vetor de Predecessores

**Implementação:** `Map<vertexId: int, prevVertexId: int | null>`

Inicializado com `null` para todos os vértices. Durante o relaxamento, quando `dist[v]` é atualizado via `u`, registra-se `prev[v] = u`. Após o término do Dijkstra, a reconstrução do caminho percorre `prev` de trás para frente: `targetId → prev[target] → prev[prev[target]] → ... → sourceId`. O caminho é construído com `unshift` num array e verificado pela condição `path[0] === sourceId`.

### 5.5 Conjunto de Visitados

**Implementação:** `Set<vertexId: int>`

Permite a verificação `visited.has(u)` em O(1). Um vértice é adicionado ao conjunto quando é extraído da heap pela primeira vez (garante que não será processado novamente). É o que permite que a heap aceite entradas duplicadas sem comprometer a correção do algoritmo.

### 5.6 Índice de Direcionamento

**Implementação:** `Renderer._directedSet: Set<string>` — conjunto de chaves `"fromId,toId"` para todas as arestas dirigidas.

Reconstruído no início de cada ciclo de renderização em `_rebuildDirectedIndex()`. Permite que `_hasBothDirections(edge)` determine em O(1) se existe uma aresta dirigida no sentido oposto (para decidir se a aresta deve ser desenhada como curva ou reta). Sem esse índice, cada aresta precisaria varrer todas as outras arestas para detectar o par oposto — O(E) por aresta, resultando em O(E²) por frame.

---

## 6. Complexidade Algorítmica

### 6.1 Algoritmo de Dijkstra

| Operação | Complexidade |
|---|---|
| Inicialização (dist, prev, visited) | O(V) |
| Inserção inicial na heap | O(1) |
| Iteração principal (cada vértice processado uma vez) | O(V) extrações da heap |
| Cada extração da heap | O(log V) |
| Relaxamento de arestas (cada aresta processada uma vez) | O(E) inserções na heap |
| Cada inserção na heap | O(log V) |
| **Total** | **O((V + E) log V)** |
| Reconstrução do caminho | O(V) |

Para o Campus UFG (V ≈ 10.000, E ≈ 11.526): operações ≈ (10.000 + 11.526) × log₂(10.000) ≈ 21.526 × 13,3 ≈ **286.000 operações** — realizável em milissegundos.

### 6.2 Uso de Memória

| Estrutura | Complexidade |
|---|---|
| Lista de adjacência | O(V + E) |
| Vetor de distâncias | O(V) |
| Vetor de predecessores | O(V) |
| Conjunto de visitados | O(V) |
| Heap (pior caso, com lazy deletion) | O(E) |
| **Total do Dijkstra** | **O(V + E)** |
| **Total do Grafo** | **O(V + E)** |

### 6.3 Renderização com Culling de Viewport

Sem culling: O(V + E) operações de desenho por frame.  
Com culling: O(V_vis + E_vis), onde V_vis e E_vis são os vértices/arestas dentro ou próximos da área visível.

Para o Campus UFG com zoom alto (exibindo apenas 100 dos 10.000 nós): O(100) operações, redução de 99% em relação ao ingênuo.

### 6.4 Parsing de Arquivos

| Formato | Complexidade |
|---|---|
| `.txt` (parseTXT) | O(V + E) — leitura linear |
| `.xml` (parseXML) | O(V + E) — DOMParser + querySelectorAll |
| `.json` (parseJSON) | O(V + E) — JSON.parse + deserialize |
| `.poly` (parsePOLY) | O(V + E) — leitura linear + distância euclidiana |

---

## 7. Decisões de Design

### DD01 — Execução Exclusiva no Navegador (Sem Servidor)

**Decisão:** O sistema não possui back-end; todo o processamento ocorre no browser.  
**Justificativa:** Elimina a necessidade de instalação, configuração de servidor, banco de dados e gerenciamento de sessões. O trabalho pode ser demonstrado em qualquer computador com browser moderno, incluindo o laboratório da UFG. Simplifica o desenvolvimento para uma equipe focada em algoritmos, não em infraestrutura.  
**Trade-off:** Limitado pela capacidade de memória e processamento do browser; sem persistência de estado entre sessões.

### DD02 — Lista de Adjacência em vez de Matriz de Adjacência

**Decisão:** A representação interna do grafo usa `Map<id, Array<{to, weight, edgeId}>>`.  
**Justificativa:** O grafo do Campus UFG é esparso (E/V² ≈ 11.526/10⁸ ≈ 0,01%). Uma matriz consumiria ~800 MB apenas para a estrutura, tornando o sistema inviável. A lista usa O(V+E), que para o Campus UFG é ~21.526 entradas — cabíveis na memória do browser.  
**Trade-off:** Verificar a existência de uma aresta específica é O(grau), não O(1) como na matriz. Essa operação não é crítica no caminho quente do Dijkstra.

### DD03 — JavaScript Puro (Vanilla), Sem Frameworks

**Decisão:** Nenhuma biblioteca externa (React, Vue, D3.js, Cytoscape.js etc.) é utilizada.  
**Justificativa:** Requerimento explícito do trabalho (demonstrar implementação própria). Elimina dependências que precisariam de instalação (npm). Todo o código é auditável e compreensível pela equipe e pelo professor. O arquivo `index.html` pode ser aberto diretamente no browser com duplo-clique.

### DD04 — Canvas API para Renderização

**Decisão:** A visualização do grafo é desenhada com Canvas 2D em vez de SVG ou WebGL.  
**Justificativa:** Canvas permite controle pixel a pixel, o que é necessário para o culling de viewport personalizado. Para grafos com 10.000 elementos, SVG criaria 10.000 nós DOM, o que seria lento. WebGL seria excessivamente complexo para o escopo do trabalho. Canvas 2D oferece o equilíbrio certo entre performance e simplicidade de código.

### DD05 — Viewport Culling no Renderer

**Decisão:** Antes de desenhar cada elemento, o Renderer verifica se ele está dentro dos limites visíveis do canvas e pula aqueles que estão fora.  
**Justificativa:** Sem culling, renderizar o Campus UFG (10.000 vértices, 11.526 arestas) a cada frame de animação resultaria em ~21.526 chamadas de desenho por frame, mesmo quando o usuário está com zoom alto e vê apenas 50 elementos. O culling reduz isso para O(elementos visíveis), tornando a navegação fluida.

### DD06 — Lazy Deletion na MinHeap

**Decisão:** Quando uma distância é relaxada, o novo par (distância, vértice) é inserido na heap sem remover a entrada antiga. A entrada obsoleta é detectada e descartada com `if (d > dist.get(u)) continue`.  
**Justificativa:** A implementação de `decrease-key` em uma heap binária requer manter referências para os índices dos nós, o que complexifica significativamente o código. A lazy deletion é mais simples de implementar e suficiente para o escopo do trabalho. O custo adicional é O(E log V) espaço na heap, que é aceitável.

---

## 8. Considerações de Performance

### 8.1 Culling de Viewport

O Renderer calcula os limites da área visível em coordenadas de mundo antes de cada frame:
```javascript
const wTL = canvasToWorld(0, 0);
const wBR = canvasToWorld(canvas.width, canvas.height);
```
Para cada aresta, verifica se ambos os vértices extremos estão fora do viewport pelo mesmo lado (ambos à esquerda, direita, acima ou abaixo). Se sim, a aresta é ignorada. Para vértices, verifica se o ponto no canvas está fora da área com margem de 40px.

### 8.2 Índice de Direcionamento

O `_directedSet` (Set de strings `"from,to"`) é reconstruído uma vez por frame em `_rebuildDirectedIndex()`, custando O(E). Cada chamada de `_hasBothDirections(edge)` tem custo O(1) em vez de O(E). Para o Campus UFG com 11.526 arestas e renderização a 30fps, isso economiza 11.526 × 11.526 − 11.526 ≈ 132 milhões de comparações por segundo.

### 8.3 LOD de Rótulos

Labels de vértices são ocultados quando `scale < 0.25` e pesos de arestas quando `scale < 0.2`. Isso evita chamar `ctx.fillText()` para milhares de elementos que seriam ilegíveis em zoom baixo.

### 8.4 Reconstrução do Índice Apenas Quando Necessário

A grade de fundo (`_drawGrid`) é ignorada quando o passo em pixels seria menor que 10 pixels, evitando o desenho de centenas de linhas invisíveis em zoom baixo.

---

## 9. Limitações Conhecidas

| Limitação | Descrição | Impacto |
|---|---|---|
| **Thread única** | O Dijkstra executa na thread principal do JavaScript. Para grafos muito grandes (> 50.000 nós), pode congelar a UI por alguns segundos. | Médio — o Campus UFG (10K nós) é tratado em milissegundos; grafos maiores não são esperados no contexto do trabalho. |
| **Sem undo/redo** | Não há histórico de operações; exclusões são permanentes (o diálogo de confirmação em "Limpar Tudo" é a única proteção). | Baixo — para uso acadêmico e demonstrativo. |
| **Sem Web Workers** | Sem paralelismo; poderia ser mitigado movendo o Dijkstra para um Worker, mas aumentaria a complexidade. | Baixo para os tamanhos de grafo esperados. |
| **Clipboard API restrita** | Em alguns contextos (protocolo `file://` em Firefox, por exemplo), a Clipboard API pode ser bloqueada. | Baixo — afeta apenas RF08; os dados do grafo ainda podem ser exportados via "Exportar". |
| **Coordenadas brutas** | As coordenadas geográficas do OSM (latitude/longitude) são usadas diretamente como coordenadas cartesianas, sem reprojeção. Para o mapa do Campus UFG, isso resulta em leve distorção visual (a grade não corresponde a metros reais), mas não afeta a correção do algoritmo. | Baixo — impacto visual cosmético. |
| **Memória para grafos extremamente grandes** | Grafos com > 100.000 vértices podem esgotar a memória disponível do browser (especialmente em dispositivos com < 4 GB de RAM). | Baixo — fora do escopo do trabalho. |
