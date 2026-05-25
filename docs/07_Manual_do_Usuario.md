# Manual do Usuário — Sistema de Navegação Primitivo (Dijkstra)

**Projeto:** Sistema de Navegação Primitivo (Dijkstra)  
**Disciplina:** AED2 — INF/UFG 2026-1  
**Professor:** André L. Moura  
**Versão:** 1.0 | **Data:** 20/05/2026

---

## 1. Apresentação do Sistema

O **Sistema de Navegação Primitivo (Dijkstra)** é uma ferramenta interativa de visualização e análise de grafos que executa diretamente no seu navegador web, sem necessidade de instalação. Com ele você pode:

- **Importar mapas reais** no formato OpenStreetMap `.poly` (como o mapa do Campus UFG com mais de 10.000 pontos), bem como grafos nos formatos `.txt`, `.xml` e `.json`.
- **Criar grafos do zero** clicando no canvas para adicionar vértices (pontos) e conectá-los com arestas (ligações ponderadas).
- **Calcular o caminho mais curto** entre dois pontos do mapa usando o **Algoritmo de Dijkstra**, com destaque visual animado do percurso.
- **Visualizar estatísticas** do algoritmo: tempo de processamento, número de nós explorados e custo total do caminho.
- **Exportar e compartilhar** o grafo editado em arquivo `.txt` ou copiar a imagem do canvas diretamente para a área de transferência.

A interface é dividida em quatro regiões principais que permanecem visíveis durante toda a utilização:

- **Topo:** barra de ferramentas com todos os botões e atalhos.
- **Esquerda:** painel com estatísticas do grafo, da rota e do algoritmo, além da legenda de cores.
- **Centro:** canvas principal onde o grafo é desenhado e interagido.
- **Rodapé:** barra de status com o modo ativo, coordenadas do cursor e mensagens de feedback.

---

## 2. Requisitos do Sistema

| Item | Mínimo Recomendado |
|---|---|
| **Sistema Operacional** | Windows 10, Windows 11, Ubuntu 20.04+, macOS 12+ |
| **Navegador** | Google Chrome 100+, Mozilla Firefox 100+, Microsoft Edge 100+ |
| **Memória RAM** | 2 GB livres (4 GB recomendado para mapas grandes) |
| **Processador** | Dual-core 2 GHz ou superior |
| **Resolução de tela** | Mínimo 1280 × 720 pixels |
| **Dispositivo de entrada** | Mouse com roda de scroll (recomendado); touchpad funciona parcialmente |
| **Conexão de rede** | Não necessária |

> **Nota sobre o protocolo `file://`:** A função de copiar imagem para clipboard pode não funcionar quando o arquivo é aberto diretamente pelo explorador de arquivos em alguns navegadores. Para garantir pleno funcionamento de todas as funcionalidades, recomenda-se servir os arquivos via servidor HTTP local (ex.: `python3 -m http.server 8080` e acessar `http://localhost:8080`).

---

## 3. Instalação e Execução

O sistema não requer instalação. Siga os passos:

**Método 1 — Abertura direta (mais simples):**
1. Localize a pasta do projeto (`AED-trabalho/`).
2. Dê duplo clique no arquivo `index.html`.
3. O sistema abrirá automaticamente no seu navegador padrão.

**Método 2 — Servidor HTTP local (recomendado para funcionalidade completa):**
1. Abra um terminal (Prompt de Comando no Windows, Terminal no Linux/macOS).
2. Navegue até a pasta do projeto:
   ```
   cd /caminho/para/AED-trabalho
   ```
3. Inicie um servidor HTTP simples:
   - Python 3: `python3 -m http.server 8080`
   - Python 2: `python -m SimpleHTTPServer 8080`
   - Node.js: `npx serve .`
4. Abra o navegador e acesse: `http://localhost:8080`

**Verificação:** O sistema está funcionando quando você vê a barra de ferramentas no topo, o painel lateral à esquerda com contadores zerados, e o canvas central com o texto "Grafo vazio — Importe um arquivo ou use o modo +Vértice para adicionar nós".

---

## 4. Interface do Usuário

### 4.1 Barra de Ferramentas (Topo)

A barra de ferramentas está dividida em grupos separados por linhas verticais:

**Grupo 1 — Modos de Interação:**
| Botão | Atalho | Função |
|---|---|---|
| Pan | P | Modo de arrasto: move a visão do canvas. Padrão ao abrir. |
| +Vértice | V | Adiciona um novo vértice ao clicar no canvas. |
| +Aresta | E | Conecta dois vértices clicando primeiro no de origem e depois no de destino. |
| Origem | S | Define qual vértice é o ponto de partida do Dijkstra (verde). |
| Destino | T | Define qual vértice é o ponto de chegada do Dijkstra (vermelho). |
| Deletar | Del | Remove o vértice ou aresta clicado. |

**Grupo 2 — Algoritmo:**
| Botão | Atalho | Função |
|---|---|---|
| Calcular | Enter | Executa o Dijkstra entre origem e destino selecionados. |
| Limpar Rota | — | Remove o destaque visual do caminho calculado. |

**Grupo 3 — Arquivo e Imagem:**
| Botão | Atalho | Função |
|---|---|---|
| Importar | — | Abre o diálogo de seleção de arquivo (.txt, .xml, .json, .poly). |
| Exportar | — | Baixa o grafo atual como arquivo `grafo.txt`. |
| Copiar Imagem | Ctrl+C | Copia o canvas como PNG para a área de transferência. |
| Limpar Tudo | — | Remove todos os vértices e arestas (solicita confirmação). |

### 4.2 Painel Lateral Esquerdo

**Seção Grafo:**
- **Vértices:** número total de vértices no grafo.
- **Arestas:** número total de arestas no grafo.
- **Origem:** rótulo do vértice de origem selecionado (— se nenhum).
- **Destino:** rótulo do vértice de destino selecionado (— se nenhum).

**Seção Rota (após calcular):**
- **Distância:** custo total do caminho mínimo.
- **Caminho:** sequência de rótulos dos vértices no caminho, separados por →.

**Seção Algoritmo (após calcular):**
- **Tempo:** tempo de execução do Dijkstra em milissegundos.
- **Nós explorados:** quantos vértices foram processados pelo algoritmo.
- **Custo total:** mesmo valor da distância.

**Seção Legenda:**
Referência rápida das cores usadas no canvas:
- Cinza escuro: vértice normal.
- Verde: vértice de origem.
- Vermelho: vértice de destino.
- Âmbar/laranja: vértice ou aresta no caminho mínimo.
- Azul-claro: vértice explorado pelo algoritmo (mas não no caminho mínimo).
- Cinza-claro: aresta normal.
- Âmbar brilhante: aresta no caminho mínimo.

**Seção Zoom:**
Botões para controle de zoom: `+` (aproximar), `-` (afastar), `Fit` (ajustar todos os elementos na tela), `1:1` (zoom 100%). O percentual atual é exibido ao lado.

### 4.3 Canvas Principal (Centro)

Área de desenho do grafo. Toda a interação visual acontece aqui:
- Vértices são representados como círculos com rótulo interno.
- Arestas são linhas (ou curvas, para arestas opostas) com etiqueta de peso.
- Arestas dirigidas têm uma seta na extremidade de destino.
- Uma grade de fundo ajuda na orientação espacial.

### 4.4 Barra de Status (Rodapé)

Dividida em três seções:
- **Esquerda:** modo de interação ativo (ex.: "Arrastar", "Adicionar Vértice").
- **Centro:** coordenadas do cursor em unidades de mundo (`x: 150  y: 230`).
- **Direita:** mensagens de feedback de operações recentes (desaparecem após 4 segundos).

---

## 5. Modos de Operação

O sistema opera em um de seis modos exclusivos. O modo ativo é destacado na barra de ferramentas e indicado na barra de status.

### 5.1 Modo Pan (Arrastar) — Tecla P

**Cursor:** mão aberta (grab); mão fechada (grabbing) durante o arrasto.

Use este modo para mover a visão do canvas. Pressione e segure o botão esquerdo do mouse e arraste para deslocar o mapa em qualquer direção. A roda do mouse funciona para zoom em qualquer modo.

É o modo padrão ao iniciar o sistema.

### 5.2 Modo Adicionar Vértice — Tecla V

**Cursor:** mira (crosshair).

Clique em qualquer área vazia do canvas para criar um novo vértice. Um modal aparecerá pedindo um rótulo opcional. Se deixado em branco, o sistema atribui o ID numérico do vértice como rótulo.

Clicar sobre um vértice existente não faz nada (evita sobreposição).

### 5.3 Modo Adicionar Aresta — Tecla E

**Cursor:** mira (crosshair).

Para criar uma aresta:
1. Clique no **vértice de origem** — ele ficará com borda âmbar destacada.
2. Mova o mouse: uma linha tracejada de borracha acompanha o cursor.
3. Clique no **vértice de destino** (diferente do primeiro).
4. No modal "Nova Aresta", defina o **peso** (padrão: 1) e o **tipo** (não-direcionada ou dirigida).
5. Confirme com "Criar Aresta" ou Enter.

Pressione Escape a qualquer momento para cancelar a criação em andamento.

### 5.4 Modo Selecionar Origem — Tecla S

**Cursor:** ponteiro (pointer).

Clique sobre um vértice para defini-lo como ponto de **partida** do Dijkstra. Ele ficará verde. Clicar novamente no mesmo vértice o desmarca. Selecionar como origem um vértice que já é o destino desmarca automaticamente o destino.

### 5.5 Modo Selecionar Destino — Tecla T

**Cursor:** ponteiro (pointer).

Análogo ao modo Origem. Clique sobre um vértice para defini-lo como ponto de **chegada** do Dijkstra. Ele ficará vermelho.

### 5.6 Modo Deletar — Tecla Delete (ou Backspace)

**Cursor:** proibido (not-allowed).

Clique sobre um **vértice** para removê-lo (junto com todas as suas arestas). Clique próximo a uma **aresta** para removê-la individualmente. O sistema detecta automaticamente qual elemento está mais próximo do clique.

---

## 6. Operações com o Grafo

### 6.1 Criando um Grafo do Zero

Para criar um grafo manualmente:

1. Pressione **V** para ativar o modo "+Vértice".
2. Clique no canvas onde deseja posicionar o primeiro vértice. No modal, insira um rótulo (ex.: "A") e confirme.
3. Repita para cada vértice desejado ("B", "C", etc.).
4. Pressione **E** para ativar o modo "+Aresta".
5. Clique no vértice "A" (aparece destacado). Clique no vértice "B".
6. No modal, defina o peso (ex.: 5) e o tipo (dirigida ou não). Confirme.
7. Repita para cada aresta desejada.
8. Com o grafo criado, pressione **S**, clique no vértice de origem, pressione **T**, clique no destino.
9. Pressione **Enter** para calcular o caminho.

### 6.2 Importando Mapa de Arquivo

Formatos suportados: `.txt`, `.xml`, `.json` e `.poly`.

1. Clique no botão **"Importar"** na barra de ferramentas.
2. No diálogo de arquivo, navegue até o arquivo desejado.
3. Selecione o arquivo e clique em "Abrir".
4. O sistema carrega o grafo e ajusta automaticamente o zoom para mostrar todos os elementos.
5. Confira no painel lateral o número de vértices e arestas importados.

**Para o Campus UFG:** selecione o arquivo `Campus2UFG&Regiao.poly`. O carregamento pode levar alguns segundos para ~10.000 nós.

### 6.3 Exportando o Grafo

O sistema suporta exportação apenas para o formato `.txt`:

1. Clique no botão **"Exportar"**.
2. O navegador iniciará automaticamente o download do arquivo `grafo.txt`.
3. O arquivo pode ser reimportado posteriormente pelo mesmo sistema.

O arquivo gerado contém linhas `V` para vértices e `E` para arestas, conforme o formato descrito na Seção 11.

---

## 7. Calculando o Caminho Mínimo

### Passo a Passo

**Pré-requisito:** O grafo deve estar carregado (importado ou criado manualmente).

1. **Selecione a origem:** Pressione **S** e clique sobre o vértice de partida. Ele ficará verde. O painel lateral exibe o rótulo na linha "Origem".

2. **Selecione o destino:** Pressione **T** e clique sobre o vértice de chegada (diferente da origem). Ele ficará vermelho. O painel lateral exibe o rótulo na linha "Destino".

3. **Execute o algoritmo:** Pressione **Enter** (ou clique em "Calcular").

4. **Observe o resultado:**
   - As arestas do caminho mínimo ficam **âmbar brilhante** e mais espessas.
   - Os vértices no caminho ficam **âmbar**.
   - Os vértices visitados pelo algoritmo (mas fora do caminho ótimo) ficam **azul-claro**.
   - A barra de status exibe: "Caminho encontrado! Custo total: [valor]".

5. **Consulte as estatísticas** no painel lateral:
   - **Distância:** comprimento total do caminho.
   - **Caminho:** sequência completa de vértices.
   - **Tempo:** tempo de processamento.
   - **Nós explorados:** quantos vértices o algoritmo visitou.

6. **Para limpar o destaque:** clique em "Limpar Rota". Você pode selecionar novos pontos e recalcular sem precisar reimportar o mapa.

### O que Fazer se Não Houver Caminho

Se a barra de status exibir "Sem caminho entre origem e destino", significa que não existe nenhuma rota ligando os dois vértices no grafo (componentes desconexos ou bloqueio por arestas dirigidas). Verifique:
- Se os vértices pertencem ao mesmo componente conexo.
- Se as arestas dirigidas não estão bloqueando o percurso.

---

## 8. Interpretando os Resultados

### 8.1 Cores dos Vértices

| Cor | Significado |
|---|---|
| Cinza escuro | Vértice normal, não envolvido na última execução. |
| Verde (`#059669`) | Ponto de **origem** selecionado pelo usuário. |
| Vermelho (`#DC2626`) | Ponto de **destino** selecionado pelo usuário. |
| Âmbar (`#D97706`) | Vértice que **faz parte do caminho mínimo** encontrado. |
| Azul-claro (`#60A5FA`) | Vértice **explorado** pelo Dijkstra mas não no caminho ótimo. |

### 8.2 Cores e Estilos das Arestas

| Estilo | Significado |
|---|---|
| Linha cinza fina | Aresta normal. |
| Linha âmbar espessa | Aresta que **faz parte do caminho mínimo**. |
| Seta na extremidade | Aresta **dirigida** (sentido único). |
| Linha reta | Aresta **não dirigida** (bidirecional) entre dois vértices. |
| Curva para um lado | Aresta **dirigida** quando existe também a oposta (par de arestas opostas). |
| Etiqueta branca com número | **Peso** da aresta (custo de traversão). |

### 8.3 Estatísticas do Algoritmo

- **Tempo de execução:** medido em milissegundos com alta precisão (`performance.now()`). Inclui apenas o Dijkstra em si, não a renderização.
- **Nós explorados:** quantos vértices foram efetivamente processados (retirados da fila de prioridade e marcados como visitados). Em grafos densos, pode ser próximo ao total de vértices. Em grafos com boa heurística de posicionamento de origem/destino, pode ser muito menor.
- **Custo total:** soma dos pesos de todas as arestas no caminho mínimo. No mapa do Campus UFG, representa a distância euclidiana total em unidades das coordenadas do OSM.

---

## 9. Navegação no Canvas

### Zoom

| Ação | Resultado |
|---|---|
| Roda do mouse para cima | Zoom in, mantendo fixo o ponto sob o cursor. |
| Roda do mouse para baixo | Zoom out, mantendo fixo o ponto sob o cursor. |
| Botão "+" no painel | Zoom in centrado no canvas. |
| Botão "-" no painel | Zoom out centrado no canvas. |
| Botão "Fit" | Ajusta a visão para mostrar todos os vértices na tela. |
| Botão "1:1" | Redefine zoom para 100% com câmera na posição inicial. |

O zoom mínimo é 5% e o máximo é 1500%.

### Pan (Mover a Visão)

| Ação | Resultado |
|---|---|
| Arrastar com botão esquerdo (modo Pan) | Move a visão do canvas em qualquer direção. |
| Tecla P | Ativa o modo Pan. |

### Dicas de Navegação

- Após importar um arquivo, clique em **"Fit"** para centralizar o mapa na tela.
- Para localizar vértices específicos em grafos grandes, dê zoom in progressivamente na área de interesse.
- As coordenadas de mundo do cursor são sempre exibidas na barra de status (útil para entender a escala).
- Em zoom baixo (< 25%), os rótulos dos vértices são ocultados automaticamente para evitar poluição visual.

---

## 10. Atalhos de Teclado

| Tecla | Ação |
|---|---|
| **P** | Ativar modo Pan (Arrastar) |
| **V** | Ativar modo Adicionar Vértice |
| **E** | Ativar modo Adicionar Aresta |
| **S** | Ativar modo Selecionar Origem |
| **T** | Ativar modo Selecionar Destino |
| **Delete** ou **Backspace** | Ativar modo Deletar |
| **Enter** | Executar Dijkstra (Calcular caminho) |
| **Ctrl+C** | Copiar imagem do canvas para clipboard (quando cursor não está em campo de texto) |
| **Escape** | No modo +Aresta: cancela a seleção de origem em andamento. Em outros modos: limpa origem, destino e caminho. |
| **Roda do mouse** | Zoom in/out centrado no ponto do cursor |

> Os atalhos P, V, E, S, T são ignorados quando o foco está em um campo de texto (ex.: modal de criação de vértice/aresta).

---

## 11. Formatos de Arquivo Suportados

### Formato .txt

Arquivo de texto puro. Cada linha define um vértice (prefixo `V`) ou uma aresta (prefixo `E`). Linhas que começam com `#` são comentários ignorados.

```
# Meu grafo de exemplo
V 1 0.0 0.0 Origem
V 2 100.0 0.0 Ponto_B
V 3 100.0 100.0 Destino
E 1 2 5.0 0
E 2 3 3.0 1
E 1 3 9.0 0
```

**Colunas para vértice:** `V  <id>  <x>  <y>  [rótulo]`  
**Colunas para aresta:** `E  <fromId>  <toId>  <peso>  <0=não-dirigida | 1=dirigida>`

### Formato .xml (GraphML)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/graphml">
  <graph id="G" edgedefault="undirected">
    <node id="1" x="0.0"   y="0.0"   label="A"/>
    <node id="2" x="100.0" y="0.0"   label="B"/>
    <edge id="1" source="1" target="2" weight="5.0" directed="false"/>
  </graph>
</graphml>
```

### Formato .json

Serialização interna do sistema. Use para salvar e restaurar o estado exato, incluindo IDs internos:

```json
{
  "nextVertexId": 3,
  "nextEdgeId": 2,
  "vertices": [
    {"id": 1, "x": 0, "y": 0, "label": "A"},
    {"id": 2, "x": 100, "y": 0, "label": "B"}
  ],
  "edges": [
    {"id": 1, "from": 1, "to": 2, "weight": 5, "directed": false}
  ]
}
```

### Formato .poly (Campus UFG / OSM)

Gerado pelo utilitário `ConverteMapaParaGrafo.c` do professor André L. Moura. Estrutura:

```
<nVerts> 2 0 1          ← linha de cabeçalho de vértices
<id> <x> <y>            ← um vértice por linha (repete nVerts vezes)
<nEdges> 1              ← linha de cabeçalho de arestas
<edgeId> <from> <to> <0|1>  ← uma aresta por linha (0=não-dir, 1=dir)
0                       ← linha terminadora
```

O peso de cada aresta é calculado automaticamente como a distância euclidiana entre as coordenadas dos dois vértices extremos.

---

## 12. Perguntas Frequentes / Troubleshooting

**P1: O botão "Copiar Imagem" não funciona. O que fazer?**  
R: A Clipboard API requer contexto seguro. Tente abrir o sistema via servidor HTTP local (`python3 -m http.server 8080`) em vez de pelo protocolo `file://`. Se o problema persistir no Firefox, verifique as permissões em `about:config` → `dom.events.asyncClipboard.clipboardItem`.

---

**P2: Importei o arquivo `.poly` do Campus UFG mas a tela ficou em branco. O que aconteceu?**  
R: O arquivo pode ter sido carregado mas os vértices estão fora da área visível. Clique no botão **"Fit"** no painel lateral para ajustar automaticamente o zoom e mostrar todos os elementos. Se o problema persistir, verifique o painel lateral: se "Vértices" exibe 0, pode ter ocorrido um erro de parsing — confira a barra de status para mensagem de erro.

---

**P3: Cliquei em "Calcular" mas nada aconteceu e não houve mensagem.**  
R: Verifique se tanto a **origem** quanto o **destino** estão selecionados (painel lateral deve mostrar os rótulos, não "—"). Se algum não estiver selecionado, o sistema exibirá uma mensagem de aviso na barra de status pedindo para selecionar o elemento ausente. Use os modos **Origem (S)** e **Destino (T)** para selecionar os vértices.

---

**P4: Criei arestas A→B e B→A mas elas parecem sobrepostas. É normal?**  
R: Sim, e o sistema trata isso automaticamente. Quando existem duas arestas dirigidas opostas entre o mesmo par de vértices, elas são desenhadas como **curvas** deslocadas para lados opostos, permitindo distingui-las visualmente. Se as curvas não aparecerem, dê zoom in para vê-las melhor.

---

**P5: O sistema ficou lento ao navegar no mapa do Campus UFG. Como otimizar?**  
R: Em grafos grandes, o desempenho da renderização depende da quantidade de elementos visíveis. Tente: (a) usar o **zoom in** para ver apenas a área de interesse — o sistema automaticamente omite elementos fora da tela (viewport culling); (b) usar um navegador baseado em Chromium (Chrome ou Edge) que tende a ter melhor desempenho de Canvas; (c) fechar outras abas pesadas do navegador para liberar memória e CPU.

---

**P6: Exportei o grafo como `.txt` mas ao reimportar os IDs dos vértices mudaram. Isso é um problema?**  
R: O sistema reatribui IDs sequencialmente ao importar um arquivo. O comportamento lógico do grafo (quais vértices estão conectados, com quais pesos) é preservado fielmente. Os IDs numéricos são apenas identificadores internos; o que importa é a topologia (conexões) e os pesos, que são mantidos corretamente. Se precisar preservar os IDs originais, use o formato `.json` (exportação via JSON preserva os IDs internos).

---

## 13. Limitações Conhecidas

| Limitação | Impacto Prático |
|---|---|
| **Sem desfazer (Undo):** operações de remoção são permanentes. | Ao remover um vértice acidentalmente, é necessário recriá-lo manualmente ou reimportar o arquivo. Use "Exportar" com frequência como backup. |
| **Thread única:** para grafos muito grandes (> 50.000 nós), o Dijkstra pode congelar a interface por alguns segundos. | Não afeta o Campus UFG (~10.000 nós); relevante apenas para grafos excepcionalmente grandes. |
| **Clipboard em `file://`:** copiar imagem pode falhar em alguns browsers via protocolo `file://`. | Use servidor HTTP local para garantir funcionamento. |
| **Coordenadas OSM não reprojetadas:** no mapa do Campus UFG, as unidades de distância no painel são baseadas nas coordenadas brutas do OSM (não em metros reais). | Impacto apenas cosmético nos valores de custo; o caminho mínimo encontrado é correto em termos de sequência de vértices. |
| **Sem suporte a touch:** interações de toque (tablet, smartphone) não são oficialmente suportadas. | Use mouse para a melhor experiência. |
| **Memória para grafos extremamente grandes:** grafos com > 100.000 vértices podem esgotar a memória do browser. | Fora do escopo do trabalho acadêmico. |
