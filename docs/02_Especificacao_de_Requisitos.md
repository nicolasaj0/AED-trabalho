# Documento de Especificação de Requisitos de Software (ERS)

**Projeto:** Sistema de Navegação Primitivo (Dijkstra)  
**Disciplina:** AED2 — Algoritmos e Estruturas de Dados 2 — INF/UFG  
**Professor:** André L. Moura  
**Versão:** 1.0  
**Data:** 20/05/2026  
**Referência:** IEEE Std 830-1998 / ABNT NBR 12207

---

## 1. Introdução

### 1.1 Propósito

Este documento especifica os requisitos funcionais e não funcionais do **Sistema de Navegação Primitivo (Dijkstra)**, desenvolvido como trabalho final da disciplina AED2 do Instituto de Informática da UFG no semestre 2026-1. O documento destina-se à equipe de desenvolvimento (alunos), ao professor orientador (Prof. André L. Moura) e a qualquer leitor que deseje compreender o comportamento esperado do sistema.

### 1.2 Escopo do Sistema

O sistema é uma aplicação web cliente (front-end only) que permite visualizar grafos ponderados, importar mapas de arquivos, criar e editar grafos interativamente, e calcular o caminho mínimo entre dois vértices pelo Algoritmo de Dijkstra. O sistema não possui componente servidor, banco de dados ou integração com serviços externos. Toda a lógica é processada no navegador do usuário.

### 1.3 Definições, Acrônimos e Abreviações

| Termo | Definição |
|---|---|
| RF | Requisito Funcional |
| RNF | Requisito Não Funcional |
| UI | User Interface (Interface do Usuário) |
| API | Application Programming Interface |
| OSM | OpenStreetMap |
| Canvas | Elemento HTML5 `<canvas>` para renderização 2D |
| Heap | Min-Heap binária usada como fila de prioridade |
| ERS | Especificação de Requisitos de Software |

### 1.4 Visão Geral do Documento

A Seção 2 descreve o sistema em nível macro. As Seções 3 e 4 detalham os requisitos funcionais e não funcionais, respectivamente. As Seções 5 e 6 abordam requisitos de interface e dados. A Seção 7 apresenta a matriz de rastreabilidade entre requisitos e módulos de código. A Seção 8 define os critérios de qualidade.

---

## 2. Descrição Geral do Sistema

### 2.1 Perspectiva do Sistema

O sistema é uma aplicação standalone de página única (SPA) executada exclusivamente no navegador. Não há comunicação de rede durante a operação normal; toda a entrada de dados ocorre via arquivos locais do usuário ou interação direta com o canvas. A saída consiste na visualização no canvas, nas estatísticas no painel lateral e em arquivos exportados localmente.

```
[Usuário] ←→ [Navegador Web]
                  ↓ ↑
           [Sistema (HTML/CSS/JS)]
                  ↓ ↑
           [Sistema de Arquivos Local]
           (importar/exportar)
```

### 2.2 Funções Principais do Sistema

1. Importar grafos de arquivos locais (`.txt`, `.xml`, `.json`, `.poly`).
2. Renderizar grafos interativos com zoom e pan.
3. Permitir criação e edição de grafos via mouse.
4. Executar o Algoritmo de Dijkstra e visualizar o resultado.
5. Exibir estatísticas de execução do algoritmo.
6. Exportar grafos para arquivos locais.
7. Copiar a imagem do canvas para a área de transferência.

### 2.3 Características dos Usuários

O usuário-alvo primário é um estudante de Ciência da Computação ou área afim, com conhecimento básico de algoritmos em grafos, capaz de operar um navegador web e compreender os conceitos de vértice, aresta e caminho mínimo. Não é necessário conhecimento de programação para operar o sistema. O sistema deve ser suficientemente intuitivo para ser demonstrado em apresentação para uma turma universitária.

### 2.4 Restrições Gerais

- Execução exclusiva no navegador; nenhum componente server-side.
- Nenhuma biblioteca JavaScript externa; código 100% vanilla.
- Sem acesso à câmera, microfone ou localização GPS.
- Sem persistência de dados entre sessões (exceto via exportação/importação manual de arquivos).
- Limitado pela memória do navegador para grafos de grande escala.

### 2.5 Suposições e Dependências

- O navegador suporta ES2022, Canvas API 2D, File API, Clipboard API e DOMParser.
- Os arquivos de entrada são válidos e bem formados conforme as especificações dos formatos suportados.
- O usuário utiliza um dispositivo com mouse (teclado e mouse físicos; dispositivos de toque não são oficialmente suportados).

---

## 3. Requisitos Funcionais

### RF01 — Importar Mapa de Arquivo

| Campo | Descrição |
|---|---|
| **ID** | RF01 |
| **Nome** | Importar Mapa de Arquivo |
| **Prioridade** | Alta |
| **Descrição** | O sistema deve permitir que o usuário selecione um arquivo local nos formatos `.txt`, `.xml`, `.json` ou `.poly` e importe o grafo contido nele, substituindo o grafo atual. O formato `.poly` é o gerado pelo utilitário `ConverteMapaParaGrafo.c` do professor André Moura (UFG), derivado de dados OSM. O formato `.xml` segue a convenção GraphML. O formato `.txt` usa linhas com prefixos `V` (vértice) e `E` (aresta). O formato `.json` contém a serialização interna do sistema. Após a importação, o grafo é ajustado automaticamente para caber na tela (fit-to-screen). |
| **Critério de Aceitação** | Dado um arquivo `.poly` com 10.000 vértices (Campus UFG), o sistema importa e exibe todos os vértices e arestas sem erros. Para formato inválido ou desconhecido, exibe mensagem de erro informativa na barra de status. |
| **Dependências** | RNF03 (performance), RF02 (enumeração de vértices) |

### RF02 — Enumerar Vértices e Rotular Arestas

| Campo | Descrição |
|---|---|
| **ID** | RF02 |
| **Nome** | Enumerar Vértices e Rotular Arestas |
| **Prioridade** | Alta |
| **Descrição** | Cada vértice deve exibir um rótulo (label) sobre si mesmo quando o nível de zoom for suficiente (escala > 0,25). O rótulo padrão é o ID interno do vértice, mas pode ser substituído por um texto personalizado informado pelo usuário na criação. As arestas devem exibir seu peso (weight) numa etiqueta flutuante posicionada no ponto médio da aresta quando o zoom permitir (escala > 0,2). A etiqueta de peso tem fundo branco semitransparente para legibilidade. |
| **Critério de Aceitação** | Ao dar zoom in em um grafo, os rótulos dos vértices e os pesos das arestas tornam-se visíveis. Ao dar zoom out abaixo dos limiares, os rótulos somem para não poluir a visualização. |
| **Dependências** | RNF01 (cores), RF01 |

### RF03 — Selecionar Origem e Destino

| Campo | Descrição |
|---|---|
| **ID** | RF03 |
| **Nome** | Selecionar Vértice de Origem e Destino |
| **Prioridade** | Alta |
| **Descrição** | O sistema deve permitir que o usuário selecione um vértice de origem (cor verde `#059669`) e um vértice de destino (cor vermelha `#DC2626`) clicando sobre eles nos modos "Selecionar Origem" e "Selecionar Destino", respectivamente. Clicar novamente no mesmo vértice desfaz a seleção (toggle). Se o destino selecionado for igual à origem já definida, a origem é automaticamente desmarcada (e vice-versa) para evitar estado inválido. O painel lateral exibe o rótulo dos vértices selecionados nas linhas "Origem" e "Destino". |
| **Critério de Aceitação** | Após selecionar origem e destino, os vértices exibem as cores corretas (verde e vermelho). Tentar selecionar o mesmo vértice para origem e destino resulta na desmarcação do anterior. A seleção é limpa ao importar novo grafo ou ao limpar tudo. |
| **Dependências** | RF05 (edição), RNF01 |

### RF04 — Calcular e Exibir Caminho Mínimo

| Campo | Descrição |
|---|---|
| **ID** | RF04 |
| **Nome** | Calcular e Exibir Caminho Mínimo |
| **Prioridade** | Alta |
| **Descrição** | Ao acionar o botão "Calcular" (ou pressionar Enter), o sistema deve executar o Algoritmo de Dijkstra a partir do vértice de origem. O caminho mínimo até o destino é destacado visualmente: vértices no caminho ficam âmbar (`#D97706`), arestas no caminho ficam âmbar com linha mais espessa (`#F59E0B`, largura 4px). Vértices explorados (alcançados pelo algoritmo mas não necessariamente no caminho mínimo) ficam azul-claro (`#60A5FA`). Caso não exista caminho (grafo desconexo), é exibida mensagem "Sem caminho entre origem e destino". Se origem ou destino não estiverem selecionados, mensagem de aviso é exibida. |
| **Critério de Aceitação** | Em um grafo com caminho conhecido, a rota exibida coincide com o caminho mínimo esperado. Em grafo desconexo, a mensagem de ausência de caminho é exibida. O destaque visual é removido ao clicar em "Limpar Rota". |
| **Dependências** | RF03, RNF03, RNF04 |

### RF05 — Criar e Editar Grafos Interativamente

| Campo | Descrição |
|---|---|
| **ID** | RF05 |
| **Nome** | Criar e Editar Grafos Interativamente |
| **Prioridade** | Alta |
| **Descrição** | O sistema deve permitir ao usuário criar grafos do zero e editar grafos existentes por meio de interações com o mouse no canvas. As operações suportadas são: (a) **Adicionar vértice** — clicar no canvas no modo "+Vértice" abre um modal onde o usuário pode informar um rótulo opcional; (b) **Adicionar aresta** — no modo "+Aresta", o usuário clica no vértice de origem e depois no vértice de destino; um modal permite definir o peso e o tipo (dirigida/não dirigida); (c) **Remover vértice** — no modo "Deletar", clicar sobre um vértice o remove junto com todas as suas arestas adjacentes; (d) **Remover aresta** — no modo "Deletar", clicar próximo a uma aresta a remove. |
| **Critério de Aceitação** | É possível construir um grafo completo do zero (sem importação de arquivo) com múltiplos vértices e arestas. A remoção de um vértice remove automaticamente todas as arestas incidentes. Arestas dirigidas e não dirigidas são criadas corretamente conforme a seleção do usuário no modal. |
| **Dependências** | RF06, RNF06 |

### RF06 — Suporte a Arestas Dirigidas e Não Dirigidas

| Campo | Descrição |
|---|---|
| **ID** | RF06 |
| **Nome** | Suporte a Arestas Dirigidas e Não Dirigidas |
| **Prioridade** | Alta |
| **Descrição** | O sistema deve suportar arestas dirigidas (sentido único, representadas com seta na ponta) e não dirigidas (bidirecionais, sem seta). O comportamento do Dijkstra respeita a direção: em uma aresta dirigida u→v, a vizinhança de u inclui v, mas a vizinhança de v não inclui u via essa aresta. Quando existem duas arestas dirigidas nos dois sentidos entre o mesmo par de vértices (u→v e v→u), as arestas são desenhadas como curvas quadráticas paralelas (para distingui-las visualmente). Arestas não dirigidas são desenhadas como linhas retas. |
| **Critério de Aceitação** | Uma aresta dirigida A→B permite navegar de A para B mas não de B para A. O visual com seta confirma a direção. Duas arestas opostas entre A e B são exibidas como curvas distintas. Uma aresta não dirigida entre A e B permite navegação nos dois sentidos. |
| **Dependências** | RF05, RNF02 |

### RF07 — Exibir Estatísticas do Algoritmo

| Campo | Descrição |
|---|---|
| **ID** | RF07 |
| **Nome** | Exibir Estatísticas do Algoritmo |
| **Prioridade** | Média |
| **Descrição** | Após a execução do Dijkstra, o painel lateral deve atualizar as seguintes estatísticas: (a) **Tempo** — tempo de execução do algoritmo em milissegundos (usando `performance.now()`); (b) **Nós explorados** — número de vértices efetivamente processados (retirados da heap e marcados como visitados); (c) **Custo total** — soma dos pesos das arestas no caminho mínimo encontrado. O painel também exibe a sequência completa de vértices no caminho (rótulos separados por "→"). |
| **Critério de Aceitação** | Após calcular o caminho, os três valores são exibidos no painel. O custo total coincide com a distância calculada pelo algoritmo (`DijkstraResult.getDistance(targetId)`). O tempo é não nulo e coerente com a complexidade do grafo. |
| **Dependências** | RF04 |

### RF08 — Copiar Imagem do Canvas

| Campo | Descrição |
|---|---|
| **ID** | RF08 |
| **Nome** | Copiar Imagem do Canvas para Clipboard |
| **Prioridade** | Baixa |
| **Descrição** | O sistema deve permitir ao usuário copiar o conteúdo atual do canvas como imagem PNG para a área de transferência do sistema operacional, mediante o botão "Copiar Imagem" ou o atalho Ctrl+C (quando o foco não está em um campo de texto). A operação utiliza a Clipboard API moderna (`navigator.clipboard.write`). Em caso de falha (permissão negada pelo navegador), uma mensagem de erro é exibida na barra de status. |
| **Critério de Aceitação** | Após acionar a função, é possível colar a imagem num editor de imagens ou documento de texto. A imagem copiada reflete o estado atual do canvas (grafo com rota destacada, se aplicável). |
| **Dependências** | RNF07 (compatibilidade de browser) |

---

## 4. Requisitos Não Funcionais

### RNF01 — Diferenciação Visual de Vértices e Arestas

| Campo | Descrição |
|---|---|
| **ID** | RNF01 |
| **Categoria** | Usabilidade / Interface |
| **Descrição** | Vértices e arestas devem ser exibidos com cores distintas conforme seu estado: vértice normal (cinza escuro `#4B5563`), origem (verde `#059669`), destino (vermelho `#DC2626`), no caminho (âmbar `#D97706`), explorado (azul-claro `#60A5FA`). Arestas normais são cinza-claro (`#9CA3AF`); arestas no caminho são âmbar (`#F59E0B`). Uma legenda no painel lateral exibe todas as cores e seus significados. |
| **Métrica de Verificação** | Inspecionar visualmente o canvas após selecionar origem/destino e calcular o caminho; confirmar que cada estado exibe a cor correta conforme a constante `COLORS` em `constants.js`. |

### RNF02 — Diferenciação Visual de Arestas Dirigidas e Não Dirigidas

| Campo | Descrição |
|---|---|
| **ID** | RNF02 |
| **Categoria** | Usabilidade / Interface |
| **Descrição** | Arestas dirigidas devem ser desenhadas com uma seta (chevron) na extremidade do vértice de destino. Arestas não dirigidas não possuem seta. Quando dois pares de arestas dirigidas opostas existem entre os mesmos vértices, elas devem ser desenhadas como curvas quadráticas deslocadas para evitar sobreposição. |
| **Métrica de Verificação** | Criar manualmente uma aresta dirigida e uma não dirigida; verificar visualmente a presença/ausência de seta. Criar arestas A→B e B→A; verificar curvas distintas. |

### RNF03 — Otimizado para Grafos de Grande Escala

| Campo | Descrição |
|---|---|
| **ID** | RNF03 |
| **Categoria** | Desempenho |
| **Descrição** | O sistema deve suportar grafos com milhares de vértices e arestas (ex.: Campus UFG com ~10.000 vértices e ~11.526 arestas) sem travamento severo. As técnicas de otimização incluem: (a) **culling de viewport** — apenas elementos dentro ou próximos da área visível do canvas são desenhados; (b) **índice de direcionamento** (`_directedSet`) — estrutura `Set` reconstruída antes de cada renderização para consulta O(1) sobre direcionamento; (c) **LOD de rótulos** — rótulos de vértices e pesos de arestas são omitidos em níveis de zoom baixos. |
| **Métrica de Verificação** | Importar o arquivo `Campus2UFG&Regiao.poly`; o sistema deve responder ao pan e zoom de forma fluida (sem travamento perceptível por mais de 1 segundo) após o carregamento. |

### RNF04 — Tempo de Resposta para Grafos Médios

| Campo | Descrição |
|---|---|
| **ID** | RNF04 |
| **Categoria** | Desempenho |
| **Descrição** | A execução do Algoritmo de Dijkstra para um grafo com aproximadamente 500 vértices e densidade típica de arestas deve completar em menos de 2 segundos, incluindo a atualização da interface. |
| **Métrica de Verificação** | Executar o Dijkstra num grafo de 500 nós e verificar o campo "Tempo" no painel; o valor deve ser inferior a 2000 ms. Ver CT19. |

### RNF05 — Eficiência de Memória

| Campo | Descrição |
|---|---|
| **ID** | RNF05 |
| **Categoria** | Desempenho |
| **Descrição** | A representação interna do grafo utiliza lista de adjacência (`Map<vertexId, Array<{to, weight, edgeId}>>`), que consome O(V+E) de memória, sendo mais eficiente que uma matriz de adjacência O(V²) para grafos esparsos. As estruturas temporárias do Dijkstra (`dist`, `prev`, `visited`, `heap`) são criadas e descartadas a cada execução. |
| **Métrica de Verificação** | Monitorar o uso de memória do processo do navegador (via DevTools → Memory) antes e depois de importar o Campus UFG; o consumo incremental deve ser compatível com O(V+E) (estimativa: < 50 MB para 10K nós). |

### RNF06 — Interface Intuitiva para Usuários Não Técnicos

| Campo | Descrição |
|---|---|
| **ID** | RNF06 |
| **Categoria** | Usabilidade |
| **Descrição** | A interface deve ser autoexplicativa: cada botão da barra de ferramentas indica claramente sua função e atalho de teclado. Um texto de dica ("Grafo vazio — importe um arquivo ou use +Vértice...") é exibido no canvas enquanto o grafo está vazio. A barra de status exibe o modo atual, as coordenadas do cursor e mensagens de feedback das ações. O painel lateral com legenda e estatísticas é permanentemente visível. |
| **Métrica de Verificação** | Solicitar a um usuário sem experiência prévia com o sistema que importe um arquivo e calcule um caminho mínimo; a tarefa deve ser concluída em menos de 5 minutos sem assistência. |

### RNF07 — Compatibilidade com Windows e Linux

| Campo | Descrição |
|---|---|
| **ID** | RNF07 |
| **Categoria** | Portabilidade |
| **Descrição** | O sistema deve funcionar corretamente nos sistemas operacionais Windows 10+ e Ubuntu 20.04+ (e distribuições equivalentes), utilizando os navegadores Google Chrome 100+, Mozilla Firefox 100+ e Microsoft Edge 100+. Não deve depender de funcionalidades exclusivas de sistema operacional. |
| **Métrica de Verificação** | Executar o conjunto de testes CT01–CT20 em Windows e Linux com ao menos dois navegadores; todos os casos devem passar. |

### RNF08 — Código Modular e Documentado

| Campo | Descrição |
|---|---|
| **ID** | RNF08 |
| **Categoria** | Manutenibilidade |
| **Descrição** | O código deve ser organizado em módulos com responsabilidades claramente separadas (Graph.js, Dijkstra.js, MinHeap.js, Renderer.js, FileIO.js, App.js, constants.js, main.js). Cada classe e função deve ter comentários explicativos. Constantes globais (cores, tamanhos, modos) devem estar centralizadas em `constants.js`. |
| **Métrica de Verificação** | Inspeção de código: cada arquivo deve corresponder a uma única responsabilidade; nenhum arquivo deve exceder 700 linhas; constantes não devem estar dispersas em múltiplos arquivos. |

---

## 5. Requisitos de Interface

### 5.1 Layout Geral

A interface é dividida em quatro regiões fixas:

1. **Barra de ferramentas (header `#toolbar`)** — no topo, contém agrupamentos de botões para modos de interação, operações de algoritmo, e I/O de arquivos.
2. **Painel lateral esquerdo (`#left-panel`)** — exibe estatísticas do grafo, da rota, do algoritmo, a legenda de cores e controles de zoom.
3. **Canvas principal (`#graph-canvas`)** — área central, ocupa todo o espaço restante, onde o grafo é renderizado.
4. **Barra de status (`#status-bar`)** — no rodapé, exibe o modo atual, coordenadas do cursor no mundo e mensagens de feedback.

### 5.2 Barra de Ferramentas

Organizada em 4 grupos separados por divisores visuais:

- **Grupo 1 — Modos:** Pan, +Vértice, +Aresta, Origem, Destino, Deletar.
- **Grupo 2 — Algoritmo:** Calcular (Enter), Limpar Rota.
- **Grupo 3 — I/O:** Importar, Exportar, Copiar Imagem, Limpar Tudo.

Cada botão exibe seu atalho de teclado em `<kbd>` ao lado do label.

### 5.3 Modais

- **Modal de Nova Aresta:** aparece ao confirmar a seleção dos dois vértices no modo "+Aresta". Campos: peso (número, padrão 1) e tipo (radio: não-direcionada / dirigida). Botões: Cancelar e Criar Aresta.
- **Modal de Novo Vértice:** aparece ao clicar no canvas no modo "+Vértice". Campo: rótulo (texto, opcional). Botões: Cancelar e Adicionar.

### 5.4 Painel Lateral

Seções: **Grafo** (contagem de vértices e arestas, rótulos de origem/destino), **Rota** (distância total, sequência de vértices), **Algoritmo** (tempo, nós explorados, custo), **Legenda** (cores), **Zoom** (+, -, Fit, 1:1, percentual).

---

## 6. Requisitos de Dados

### 6.1 Formato `.txt`

Arquivo de texto puro, linhas com prefixos:
```
# Comentário (ignorado)
V <id> <x> <y> [label]   ← vértice
E <fromId> <toId> <peso> <0|1>  ← aresta (0=não-dirigida, 1=dirigida)
```
Coordenadas e pesos são números de ponto flutuante. IDs são inteiros positivos.

### 6.2 Formato `.xml` (GraphML)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/graphml">
  <graph id="G" edgedefault="undirected">
    <node id="1" x="100.0" y="200.0" label="A"/>
    <edge id="1" source="1" target="2" weight="5.0" directed="false"/>
  </graph>
</graphml>
```

### 6.3 Formato `.json`

Serialização JSON interna da classe `Graph.serialize()`:
```json
{
  "nextVertexId": 3,
  "nextEdgeId": 2,
  "vertices": [{"id":1,"x":0,"y":0,"label":"A"}],
  "edges": [{"id":1,"from":1,"to":2,"weight":5,"directed":false}]
}
```

### 6.4 Formato `.poly` (Campus UFG)

Gerado por `ConverteMapaParaGrafo.c`:
```
<nVerts> 2 0 1          ← cabeçalho: número de vértices
<id> <x> <y>            ← um vértice por linha (repetir nVerts vezes)
<nEdges> 1              ← cabeçalho: número de arestas
<edgeId> <from> <to> <0|1>  ← uma aresta por linha (0=não-dir, 1=dir)
0                       ← terminador
```
O peso da aresta é calculado como distância euclidiana entre as coordenadas dos vértices.

---

## 7. Rastreabilidade Requisitos × Módulos

| Requisito | Graph.js | Dijkstra.js | MinHeap.js | Renderer.js | FileIO.js | App.js |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| RF01 — Importar Mapa | ✓ | | | ✓ | ✓ | ✓ |
| RF02 — Enumerar/Rotular | ✓ | | | ✓ | | |
| RF03 — Selecionar Origem/Destino | ✓ | | | ✓ | | ✓ |
| RF04 — Calcular Caminho Mínimo | ✓ | ✓ | ✓ | ✓ | | ✓ |
| RF05 — Criar/Editar Grafo | ✓ | | | ✓ | | ✓ |
| RF06 — Arestas Dirigidas/Não Dirigidas | ✓ | ✓ | | ✓ | ✓ | ✓ |
| RF07 — Estatísticas do Algoritmo | | ✓ | | | | ✓ |
| RF08 — Copiar Imagem | | | | ✓ | | ✓ |
| RNF03 — Performance / Culling | | | | ✓ | | |
| RNF04 — Tempo de Resposta | | ✓ | ✓ | | | |
| RNF05 — Eficiência de Memória | ✓ | ✓ | ✓ | | | |
| RNF08 — Modularidade | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## 8. Critérios de Qualidade

| Critério | Descrição | Meta |
|---|---|---|
| **Correção** | O caminho calculado deve ser o mínimo real | Verificação em grafo com resultado analítico conhecido (CT13) |
| **Completude** | Todos os RFs implementados e testáveis | 100% dos CTs passando |
| **Desempenho** | Dijkstra < 2s para 500 nós | Medido via `stat-time` (CT19) |
| **Robustez** | Sem crash ao importar arquivo inválido | Mensagem de erro exibida (CT04) |
| **Usabilidade** | Usuário completa tarefa em < 5 min sem ajuda | Teste com usuário real |
| **Portabilidade** | Funciona em Windows e Linux com 2 browsers | Testes manuais em ambos os OS |
| **Manutenibilidade** | Código organizado, sem módulos > 700 linhas | Inspeção de código |
