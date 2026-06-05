# Documento de Visão do Projeto

**Disciplina:** AED2 — Algoritmos e Estruturas de Dados 2  
**Instituição:** INF/UFG — Instituto de Informática, Universidade Federal de Goiás  
**Semestre:** 2026-1  
**Data de elaboração:** 20/05/2026  
**Versão:** 1.0

---

## 1. Identificação do Projeto

| Campo               | Valor                                                         |
|-------------------  |---------------------------------------------------------------|
| **Nome do Projeto** | Sistema de Navegação Primitivo (Dijkstra)                     |
| **Disciplina**      | AED2 — Algoritmos e Estruturas de Dados 2                     |
| **Curso**           | Ciência da Computação / Sistemas de Informação — INF/UFG      |
| **Professor**       | André L. Moura                                                |
| **Semestre**        | 2026-1                                                        |
| **Data de Entrega** | 07/06/2026                                                    |
| **Repositório**     | https://github.com/MassivePYR/AED-trabalho                    |

### Equipe

| # |            Nome           |   Matrícula   |
|---|---------------------------|---------------|
| 1 | DANIELLY DE MORAES SANTOS |   201709629   |
| 2 | JOSÉ JEOVAH DOS REIS NETO |   202203518   |
| 3 | NICOLAS ALVES DE JESUS    |   202301477   |
| 4 | RUBENS CARVALHO ROCHA     |   202306979   |

---

## 2. Objetivo do Projeto

O projeto consiste no desenvolvimento de um **sistema interativo de visualização e navegação em grafos**, executado inteiramente no navegador web, sem necessidade de instalação de software adicional. O sistema permite que o usuário importe mapas reais (como o Campus UFG e região circunvizinha, com aproximadamente 10.000 vértices e 11.526 arestas), crie grafos manualmente ou edite grafos existentes, e execute o **Algoritmo de Dijkstra** para calcular o caminho de menor custo entre dois pontos selecionados.

O objetivo acadêmico central é demonstrar, de forma visual e interativa, a aplicação prática de algoritmos clássicos de teoria dos grafos — em particular o algoritmo de Dijkstra — e das estruturas de dados que os sustentam: **lista de adjacência**, **heap mínima binária**, **vetor de distâncias** e **vetor de predecessores**. O sistema foi projetado para evidenciar, em tempo real, a diferença entre grafos dirigidos e não dirigidos, o processo de relaxamento de arestas e a reconstrução do caminho mínimo.

Do ponto de vista da engenharia de software, o projeto é implementado em JavaScript puro (vanilla), utilizando a API Canvas do HTML5 para renderização vetorial de alta performance. A arquitetura segue um padrão similar ao MVC (Model-View-Controller): a camada de modelo é representada pelas classes `Graph` e `Dijkstra`, a camada de visualização pela classe `Renderer`, e o controle pela classe `App`. Essa separação favorece a manutenibilidade e a extensão futura do sistema.

---

## 3. Escopo

### 3.1 Dentro do Escopo

- Visualização interativa de grafos ponderados, dirigidos e não dirigidos, sobre um canvas HTML5.
- Importação de mapas a partir de arquivos `.txt`, `.xml`, `.json` e `.poly` (formato OpenStreetMap convertido pelo utilitário em C fornecido pelo professor).
- Exportação do grafo corrente para o formato `.txt`.
- Criação e edição interativa de grafos: adição e remoção de vértices e arestas via clique do mouse, com configuração de peso e direcionamento.
- Seleção visual de vértice de origem (verde) e destino (vermelho).
- Execução do Algoritmo de Dijkstra e destacamento visual do caminho mínimo (âmbar/laranja).
- Exibição de estatísticas do algoritmo: tempo de processamento em milissegundos, número de nós explorados e custo total do caminho.
- Navegação no canvas: zoom com a roda do mouse e pan com arrastar.
- Cópia da imagem do canvas para a área de transferência do sistema operacional.
- Suporte a grafos de grande escala (Campus UFG: ~10.000 vértices) com otimização via culling de viewport.

### 3.2 Fora do Escopo

- Rastreamento GPS em tempo real ou integração com serviços de localização.
- Processamento servidor (back-end): toda a lógica é executada no cliente (browser).
- Aplicativos móveis nativos (Android/iOS).
- Algoritmos de caminhos mínimos alternativos ao Dijkstra (A*, Bellman-Ford, Floyd-Warshall).
- Funcionalidade de desfazer/refazer (undo/redo).
- Edição colaborativa em tempo real (multi-usuário).
- Autenticação de usuários ou persistência de dados em banco de dados.
- Suporte a grafos com pesos negativos nas arestas.

---

## 4. Partes Interessadas / Stakeholders

| Stakeholder | Papel | Interesse Principal |
|---|---|---|
| **Prof. André L. Moura** | Orientador e avaliador do trabalho | Verificar a correta implementação do algoritmo de Dijkstra, das estruturas de dados (heap mínima, lista de adjacência) e da qualidade técnica do código. |
| **Alunos da equipe** | Desenvolvedores e mantenedores do sistema | Aprender na prática a implementação de algoritmos de grafos, cumprir os requisitos do trabalho e obter aprovação na disciplina. |
| **Usuário final (demais alunos, professores)** | Usuário do sistema | Utilizar a ferramenta para visualizar e compreender o funcionamento do algoritmo de Dijkstra de forma intuitiva, sem necessidade de conhecimento técnico profundo. |
| **Turma da disciplina AED2** | Avaliadores secundários (apresentação) | Compreender a implementação e o funcionamento do sistema durante a apresentação final. |

---

## 5. Contexto e Motivação

O algoritmo de Dijkstra, publicado por Edsger W. Dijkstra em 1959, é um dos algoritmos mais fundamentais da ciência da computação. Ele resolve o problema do caminho mínimo de única fonte em grafos ponderados com pesos não negativos, encontrando aplicação em sistemas de roteamento de redes (OSPF), GPS e aplicativos de navegação (Google Maps, Waze), jogos eletrônicos (pathfinding de NPCs), logística e transporte, e redes de telecomunicações.

No contexto da disciplina AED2, o estudo de algoritmos em grafos representa o culminar do aprendizado sobre estruturas de dados avançadas. A implementação de uma heap mínima binária como fila de prioridade — em vez de uma busca linear — reduz a complexidade do Dijkstra de O(V²) para O((V+E) log V), diferença que se torna dramaticamente visível ao trabalhar com o mapa real do Campus UFG (mais de 10.000 nós). Visualizar esse processo em tempo real, com a animação do grafo e a exibição dos nós explorados, transforma um conceito abstrato num objeto concreto e observável.

A escolha de um mapa real da UFG como conjunto de dados de teste foi deliberada: aproxima o trabalho acadêmico de uma aplicação do mundo real, tornando o sistema uma ferramenta de estudo genuinamente motivadora. O arquivo `.poly` fornecido pelo professor foi convertido a partir de dados do OpenStreetMap pelo utilitário `ConverteMapaParaGrafo.c`, conectando diretamente a disciplina com a prática de engenharia de dados geográficos.

---

## 6. Tecnologias Utilizadas

| Tecnologia | Versão / Detalhe | Justificativa |
|---|---|---|
| **HTML5** | Living Standard (2026) | Estrutura da página e elementos semânticos; suporte universal nos navegadores modernos. |
| **CSS3** | Living Standard (2026) | Estilização da interface, layout flexbox, variáveis de cor. |
| **JavaScript** | ES2022 (vanilla, sem frameworks) | Linguagem de script do navegador; ausência de dependências externas simplifica a distribuição e demonstra o domínio dos fundamentos. |
| **Canvas API** | HTML5 Canvas 2D Context | Renderização de alta performance para grafos com milhares de elementos; controle total sobre o desenho vetorial. |
| **File API / FileReader** | Web API padrão | Leitura de arquivos locais sem necessidade de servidor. |
| **Clipboard API** | Web API (writeText/write) | Cópia da imagem do canvas para a área de transferência. |
| **DOMParser** | Web API padrão | Parsing de arquivos XML (GraphML) diretamente no browser. |
| **performance.now()** | Web API (High Resolution Time) | Medição precisa do tempo de execução do Dijkstra em milissegundos. |

---

## 7. Restrições do Projeto

1. **Execução exclusiva no navegador:** o sistema deve funcionar sem servidor web, apenas abrindo o arquivo `index.html` localmente em um navegador moderno.
2. **Sem bibliotecas JavaScript externas:** toda a lógica (algoritmo, estruturas de dados, renderização, I/O) deve ser implementada em JavaScript puro, sem uso de frameworks (React, Vue, etc.) ou bibliotecas de grafos (D3.js, Cytoscape.js, etc.).
3. **Compatibilidade com Windows e Linux:** o sistema deve funcionar em ambos os sistemas operacionais utilizando navegadores padrão (Google Chrome, Mozilla Firefox, Microsoft Edge).
4. **Meta de desempenho:** o cálculo do Dijkstra para grafos de aproximadamente 500 nós deve concluir em menos de 2 segundos (RNF04). Para o mapa completo do Campus UFG (~10.000 nós), a renderização deve ser fluida sem travamento visível.
5. **Sem uso de Workers:** para simplificar a implementação, o algoritmo é executado na thread principal do JavaScript, o que pode causar breve congelamento da UI para grafos muito grandes.
6. **Conformidade com o formato `.poly`:** o parser deve ser compatível com o formato gerado especificamente pelo `ConverteMapaParaGrafo.c` do professor André L. Moura.

---

## 8. Premissas

1. O usuário dispõe de um navegador web moderno (Google Chrome 100+, Firefox 100+, Microsoft Edge 100+) com suporte a ES2022, Canvas API e Clipboard API.
2. Os arquivos de mapa fornecidos para importação estão em formato válido e bem formado (XML válido, estrutura `.poly` conforme especificação do professor).
3. As coordenadas dos vértices nos arquivos importados são valores numéricos reais (ponto flutuante); coordenadas geográficas (latitude/longitude do OSM) são tratadas diretamente como coordenadas cartesianas para fins de visualização, sem reprojeção.
4. Os pesos das arestas no arquivo `.poly` são calculados como distância euclidiana entre as coordenadas dos vértices adjacentes (conforme implementado no parser `FileIO.parsePOLY`).
5. O ambiente de execução possui memória RAM suficiente para carregar o grafo completo do Campus UFG (~10.000 vértices, ~11.526 arestas) na memória do navegador.
6. O projeto é utilizado como ferramenta de estudo e demonstração acadêmica, não como sistema de produção para navegação real.

---

## 9. Glossário

| Termo | Definição |
|---|---|
| **Grafo** | Estrutura matemática composta por um conjunto de vértices (nós) e um conjunto de arestas (conexões entre pares de vértices). Pode ser dirigido ou não dirigido, ponderado ou não ponderado. |
| **Vértice (Nó)** | Unidade fundamental de um grafo; representa uma entidade (ex.: interseção de rua, ponto de interesse). Neste sistema, possui coordenadas (x, y) e um rótulo. |
| **Aresta** | Conexão entre dois vértices do grafo; representa uma relação ou ligação (ex.: trecho de rua). Pode ter peso e direcionamento. |
| **Peso** | Valor numérico associado a uma aresta que representa o custo, distância ou tempo de traversão daquela conexão. Neste sistema, é a distância euclidiana entre os vértices. |
| **Dijkstra** | Algoritmo guloso para encontrar o caminho de menor custo de um vértice-fonte para todos os demais vértices de um grafo com pesos não negativos. Complexidade: O((V+E) log V) com heap mínima. |
| **Min-Heap (Heap Mínima)** | Árvore binária quase-completa onde o nó pai sempre tem prioridade menor ou igual à dos filhos. Utilizada como fila de prioridade no Dijkstra; operações push e pop em O(log n). |
| **Lista de Adjacência** | Representação de um grafo onde cada vértice mantém uma lista dos seus vizinhos imediatos. Eficiente em memória para grafos esparsos (poucos arestas em relação ao quadrado dos vértices). |
| **Caminho Mínimo** | Sequência de vértices de um grafo tal que a soma dos pesos das arestas percorridas é a menor possível entre todos os caminhos alternativos entre origem e destino. |
| **OSM** | OpenStreetMap — projeto colaborativo de mapeamento geográfico de código aberto que disponibiliza dados cartográficos do mundo inteiro em formato XML (.osm). |
| **.poly** | Formato de arquivo de grafo gerado pelo utilitário `ConverteMapaParaGrafo.c` do professor André L. Moura, derivado do formato Triangle/Poly. Contém vértices com coordenadas e arestas com direcionamento. |
| **Relaxamento** | Operação central do Dijkstra: ao visitar um vértice u, para cada vizinho v, verifica-se se o caminho via u é mais curto que o caminho atualmente conhecido até v; em caso positivo, atualiza-se a distância de v. |
| **Culling de Viewport** | Técnica de otimização de renderização que descarta (não desenha) elementos do grafo que estão fora da área visível do canvas, reduzindo drasticamente o número de operações de desenho. |
| **Componente Conexo** | Subgrafo onde existe caminho entre qualquer par de vértices. Em grafos não conexos, pode não existir caminho entre vértices de componentes diferentes. |
| **Dígrafo** | Grafo dirigido — as arestas têm orientação, ou seja, a aresta (u→v) não implica a existência da aresta (v→u). |
| **GraphML** | Formato XML padronizado para a representação de grafos, utilizado no formato `.xml` suportado por este sistema. |
