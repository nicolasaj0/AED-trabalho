# Glossário e Referências Bibliográficas

**Projeto:** Sistema de Navegação Primitivo (Dijkstra)  
**Disciplina:** AED2 — INF/UFG 2026-1  
**Professor:** André L. Moura  
**Versão:** 1.0 | **Data:** 20/05/2026

---

## 1. Glossário

Termos técnicos utilizados na documentação e no sistema, em ordem alfabética.

---

### Adjacência

Relação entre dois vértices de um grafo: dois vértices são **adjacentes** (ou vizinhos) se existe uma aresta que os conecta diretamente. Em grafos dirigidos, a adjacência é direcional: se existe a aresta u→v, então v é adjacente a partir de u, mas u não é necessariamente adjacente a partir de v.

---

### Algoritmo

Sequência finita e determinística de passos bem definidos para resolver um problema computacional. Neste contexto, refere-se especificamente ao **Algoritmo de Dijkstra**, que resolve o problema do caminho mínimo de única fonte em grafos com pesos não negativos.

---

### Aresta (Edge)

Conexão entre dois vértices de um grafo. Uma aresta pode ser:
- **Não dirigida (bidirecional):** a conexão vale nos dois sentidos (u ↔ v).
- **Dirigida (unidirecional):** a conexão vale apenas em um sentido (u → v).
- **Ponderada:** possui um valor numérico (peso) associado, representando custo, distância ou tempo.

No sistema, arestas são representadas pela classe `Edge`, com atributos `id`, `from`, `to`, `weight` e `directed`.

---

### Caminho

Sequência de vértices v₁, v₂, ..., vₖ em um grafo tal que existe uma aresta entre cada par consecutivo (vᵢ, vᵢ₊₁). O **comprimento** de um caminho ponderado é a soma dos pesos de todas as arestas percorridas.

---

### Caminho Mínimo (Shortest Path)

Caminho entre dois vértices cuja soma de pesos das arestas é a menor possível dentre todos os caminhos alternativos. O Algoritmo de Dijkstra garante encontrar o caminho mínimo em grafos com pesos não negativos. No sistema, o caminho é reconstruído percorrendo o vetor de predecessores de trás para frente (`DijkstraResult.getPath()`).

---

### Componente Conexo (Connected Component)

Subconjunto maximal de vértices de um grafo em que existe caminho entre qualquer par de vértices do subconjunto. Um grafo com mais de um componente conexo é chamado de **grafo desconexo**. O Dijkstra retorna distância `Infinity` para vértices pertencentes a componentes diferentes da origem.

---

### Culling de Viewport (Viewport Culling)

Técnica de otimização de renderização que descarta (não desenha) elementos gráficos localizados fora da área visível da tela. No sistema, o `Renderer` calcula os limites da área visível em coordenadas de mundo antes de cada quadro e ignora vértices e arestas cujos extremos estão fora desses limites, reduzindo drasticamente o número de chamadas ao Canvas API.

---

### Dígrafo (Directed Graph)

Grafo em que todas as arestas possuem orientação definida. Uma aresta no dígrafo é um par ordenado (u, v), significando que existe ligação de u para v, mas não necessariamente de v para u. No sistema, um grafo pode misturar arestas dirigidas e não dirigidas no mesmo objeto `Graph`.

---

### Dijkstra

Algoritmo publicado por Edsger Wybe Dijkstra em 1959 no artigo "A note on two problems in connexion with graphs". Resolve o problema do **caminho mais curto de única fonte** em grafos ponderados com pesos não negativos. Opera de forma gulosa: a cada iteração, extrai o vértice não visitado de menor distância conhecida e relaxa todas as suas arestas. Com heap mínima binária, a complexidade é O((V+E) log V).

---

### Fila de Prioridade (Priority Queue)

Estrutura de dados abstrata que suporta inserção de elementos com prioridade e extração do elemento de menor (ou maior) prioridade. No Dijkstra, implementada como **heap mínima binária** (`MinHeap`): inserção e extração em O(log n).

---

### Grafo (Graph)

Estrutura matemática G = (V, E), onde V é um conjunto de **vértices** e E é um conjunto de **arestas** conectando pares de vértices. Grafos modelam uma ampla variedade de problemas reais: redes de computadores, mapas de estradas, redes sociais, dependências entre tarefas etc.

---

### Grafo Ponderado (Weighted Graph)

Grafo em que cada aresta possui um valor numérico denominado **peso** (ou custo). O peso pode representar distância, tempo de travessia, custo monetário etc. O Algoritmo de Dijkstra é aplicável exclusivamente a grafos ponderados com pesos não negativos.

---

### Heap (Heap Binária)

Árvore binária quase-completa armazenada implicitamente em um array onde o nó na posição i tem filhos nas posições 2i+1 (esquerdo) e 2i+2 (direito), e pai em (i-1)÷2. Uma **min-heap** mantém o invariante de que cada nó tem valor ≤ ao de seus filhos. Uma **max-heap** mantém o invariante inverso.

---

### Lista de Adjacência (Adjacency List)

Representação de um grafo onde cada vértice v mantém uma lista de seus vizinhos imediatos (e os pesos das arestas). Usa O(V+E) de memória — eficiente para grafos esparsos. Alternativa à **matriz de adjacência**, que usa O(V²) e é eficiente apenas para grafos densos.

No sistema: `Map<vertexId, Array<{to, weight, edgeId}>>` em `Graph._adjacency`.

---

### Matriz de Adjacência (Adjacency Matrix)

Representação de um grafo como uma matriz V×V onde a célula M[i][j] contém o peso da aresta de i para j (ou 0/∞ se não existe). Uso de memória: O(V²). Vantagem: verificação de adjacência em O(1). Desvantagem: impraticável para grafos esparsos grandes (o Campus UFG com 10.000 nós exigiria 10⁸ células ≈ 800 MB).

---

### Min-Heap (Heap Mínima)

Heap binária onde o elemento de menor prioridade (valor mínimo) está sempre na raiz (posição 0 do array). Usada no Dijkstra como fila de prioridade para sempre extrair o vértice de menor distância conhecida. Operações `push` e `pop` têm complexidade O(log n).

---

### Nó / Vértice (Node / Vertex)

Unidade fundamental de um grafo. No contexto deste sistema, um vértice representa um ponto geográfico ou um ponto abstrato de um grafo. Possui atributos: `id` (identificador único inteiro), `x` e `y` (coordenadas no plano cartesiano) e `label` (rótulo textual). Representado pela classe `Vertex`.

---

### OSM (OpenStreetMap)

Projeto colaborativo de mapeamento geográfico de código aberto, mantido pela comunidade global desde 2004. Disponibiliza dados cartográficos do mundo inteiro gratuitamente sob a licença ODbL. Os dados são exportáveis no formato XML `.osm`. O arquivo `Campus2UFG&Regiao.poly` foi derivado de dados OSM pelo utilitário `ConverteMapaParaGrafo.c` do professor André L. Moura.

---

### Peso (Weight)

Valor numérico associado a uma aresta de um grafo ponderado. Representa o "custo" de percorrer aquela aresta. No arquivo `.poly` do Campus UFG, o peso é calculado como a **distância euclidiana** entre as coordenadas geográficas (x, y) dos dois vértices extremos da aresta.

---

### Relaxamento (Edge Relaxation)

Operação central do Algoritmo de Dijkstra: ao processar o vértice u com distância d[u], para cada vizinho v com peso w na aresta (u,v), verifica-se se `d[u] + w < d[v]`. Em caso afirmativo, `d[v]` é atualizado para `d[u] + w` e o predecessor de v é registrado como u. O relaxamento "relaxa" a estimativa conservadora de distância até v.

---

### Subgrafo

Grafo G' = (V', E') onde V' ⊆ V e E' ⊆ E, e toda aresta em E' conecta vértices em V'. O caminho mínimo encontrado pelo Dijkstra pode ser interpretado como um subgrafo do grafo original.

---

### Vértice Visitado

No contexto do Dijkstra, um vértice é considerado **visitado** (ou processado) quando é extraído da fila de prioridade e sua menor distância é definitivamente estabelecida. Uma vez visitado, o vértice não é processado novamente. O conjunto de visitados é implementado como `Set` para consulta O(1) (`visited.has(u)`).

---

## 2. Referências Bibliográficas

As referências estão formatadas conforme a norma ABNT NBR 6023:2018.

---

**[1]** CORMEN, Thomas H. et al. **Introduction to Algorithms**. 4. ed. Cambridge, MA: MIT Press, 2022. ISBN 978-0-262-04630-5.

> Obra de referência padrão em algoritmos. O Capítulo 22 (Graph Algorithms) e o Capítulo 24 (Single-Source Shortest Paths) cobrem o Algoritmo de Dijkstra e a implementação com heap de Fibonacci, com provas formais de correção e análise de complexidade.

---

**[2]** SEDGEWICK, Robert; WAYNE, Kevin. **Algorithms**. 4. ed. Upper Saddle River, NJ: Addison-Wesley Professional, 2011. ISBN 978-0-321-57351-3.

> Apresenta implementações práticas em Java de algoritmos em grafos, incluindo Dijkstra com fila de prioridade indexada (Capítulo 4). Especialmente útil para a análise de estruturas de dados associadas.

---

**[3]** DIJKSTRA, E. W. A note on two problems in connexion with graphs. **Numerische Mathematik**, Berlim, v. 1, n. 1, p. 269–271, dez. 1959. DOI: 10.1007/BF01386390.

> Artigo original de Dijkstra que introduz o algoritmo homônimo. Descreve dois problemas: construção de árvore geradora mínima e caminho mais curto de fonte única. O artigo tem apenas 3 páginas e é surpreendentemente acessível.

---

**[4]** OPENSTREETMAP CONTRIBUTORS. **OpenStreetMap**. Disponível em: https://www.openstreetmap.org. Acesso em: 20 maio 2026.

> Fonte dos dados geográficos do Campus UFG e região circunvizinha, utilizados como conjunto de dados real para testes do sistema. Os dados foram exportados no formato `.osm` e convertidos para o formato `.poly` pelo utilitário do professor.

---

**[5]** MDN WEB DOCS. **Canvas API**. Mozilla Foundation, 2026. Disponível em: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API. Acesso em: 20 maio 2026.

> Documentação oficial da Canvas API do HTML5, utilizada para toda a renderização gráfica do sistema. Cobre métodos de desenho (`arc`, `lineTo`, `quadraticCurveTo`, `fillText`), transformações e exportação de imagem (`toBlob`).

---

**[6]** ZIVIANI, Nivio. **Projeto de Algoritmos com Implementações em Pascal e C**. 3. ed. São Paulo: Cengage Learning, 2010. ISBN 978-85-221-0869-8.

> Referência nacional em algoritmos e estruturas de dados, amplamente adotada em cursos de computação no Brasil. Apresenta implementações de grafos, algoritmos de menor caminho e estruturas de dados como heaps em linguagem C, contexto diretamente relacionado ao trabalho.

---

**[7]** SZWARCFITER, Jayme Luiz; MARKENZON, Lilian. **Estruturas de Dados e seus Algoritmos**. 3. ed. Rio de Janeiro: LTC, 2010. ISBN 978-85-216-1708-5.

> Livro nacional de referência em estruturas de dados para o contexto brasileiro. Cobre grafos, representações (lista de adjacência, matriz), busca em largura/profundidade e algoritmos de caminhos mínimos com rigor matemático.

---

**[8]** PRESSMAN, Roger S.; MAXIM, Bruce R. **Engenharia de Software: Uma Abordagem Profissional**. 8. ed. Porto Alegre: AMGH, 2016. ISBN 978-85-8055-533-3.

> Referência adotada para as práticas de documentação de software utilizadas neste trabalho (ERS, casos de uso, plano de testes). O Capítulo 8 (Entendimento dos Requisitos) e o Capítulo 17 (Estratégias de Teste) fundamentam os documentos 02 e 06 desta documentação.

---

**[9]** GOODRICH, Michael T.; TAMASSIA, Roberto; GOLDWASSER, Michael H. **Data Structures and Algorithms in Python**. Hoboken, NJ: Wiley, 2013. ISBN 978-1-118-29027-9.

> Apresenta implementações modernas de estruturas de dados, incluindo filas de prioridade e heaps (Capítulo 9) e grafos com algoritmos de caminhos mínimos (Capítulo 14). Útil para compreender a versão do Dijkstra com lazy deletion adotada neste projeto.

---

*Fim do documento.*
