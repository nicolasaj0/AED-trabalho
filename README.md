# Sistema de Navegacao Dijkstra

Aplicacao web interativa para visualizacao e execucao do algoritmo de Dijkstra em grafos ponderados. Desenvolvida para a disciplina de Algoritmos e Estruturas de Dados (AED).

---

## Requisitos

- Qualquer navegador web moderno (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari)
- Nenhuma instalacao adicional necessaria

---

## Como executar

1. Extraia ou clone os arquivos do projeto
2. Abra o arquivo `index.html` diretamente no navegador (duplo clique ou arrastar para o browser)
3. A aplicacao carrega imediatamente — nenhum servidor necessario

---

## Como usar

### Criando um grafo manualmente

1. Selecione o modo **+Vertice** (ou pressione `V`)
2. Clique em qualquer area vazia do canvas — uma caixa pedira o rotulo do vertice (opcional)
3. Selecione o modo **+Aresta** (ou pressione `E`)
4. Clique no vertice de origem e depois no vertice de destino
5. Informe o peso e escolha se a aresta e direcionada ou nao

### Navegando no canvas

- **Arrastar**: segure e arraste com o mouse no modo Pan (tecla `P`) ou rode a roda do mouse para zoom
- **Zoom**: roda do mouse, ou os botoes +/- no painel esquerdo
- **Ajustar tela**: clique em **Fit** no painel de Zoom

### Calculando o caminho mais curto

1. Selecione o modo **Origem** (`S`) e clique no vertice inicial — ele ficara verde
2. Selecione o modo **Destino** (`T`) e clique no vertice final — ele ficara vermelho
3. Clique em **Calcular** (ou pressione `Enter`)
4. O caminho mais curto sera destacado em ambar/laranja
5. As estatisticas aparecem no painel esquerdo: distancia total, nos explorados, tempo de execucao

### Importando mapas

- Clique em **Importar** e selecione um arquivo `.txt`, `.xml` ou `.json`
- O grafo sera carregado e a tela se ajustara automaticamente

### Exportando

- Clique em **Exportar** para salvar o grafo atual como `.txt`
- **Copiar Imagem** copia o canvas para a area de transferencia (requer permissao do browser)

### Deletando elementos

- Modo **Deletar** (`Del`): clique em um vertice para remove-lo (junto com todas as suas arestas), ou clique em uma aresta para remove-la

### Atalhos de teclado

| Tecla       | Acao                        |
|-------------|-----------------------------|
| `P`         | Modo Pan (arrastar)         |
| `V`         | Modo adicionar Vertice      |
| `E`         | Modo adicionar Aresta       |
| `S`         | Modo selecionar Origem      |
| `T`         | Modo selecionar Destino     |
| `Del`       | Modo Deletar                |
| `Enter`     | Calcular Dijkstra           |
| `Escape`    | Cancelar / limpar selecao   |
| `Ctrl+C`    | Copiar imagem do canvas     |

---

## Formato dos arquivos

### Formato TXT

Cada linha comeca com uma letra que indica o tipo do elemento. Linhas com `#` sao comentarios.

```
# Comentario
V <id> <x> <y> <rotulo>
E <fromId> <toId> <peso> <0=nao-direcionado|1=direcionado>
```

**Exemplo:**
```
# Mapa simples
V 1 100 100 CidadeA
V 2 300 100 CidadeB
V 3 500 200 CidadeC
E 1 2 10 0
E 2 3  7 1
E 1 3 15 0
```

- `x` e `y`: coordenadas no canvas (numeros inteiros ou decimais)
- `peso`: qualquer numero positivo (inteiro ou decimal)
- O campo `0` ou `1` define se a aresta e bidirecional ou de mao unica

### Formato XML (GraphML simplificado)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/graphml">
  <graph id="G" edgedefault="undirected">
    <node id="1" x="100" y="100" label="CidadeA"/>
    <node id="2" x="300" y="100" label="CidadeB"/>
    <edge id="e1" source="1" target="2" weight="10" directed="false"/>
    <edge id="e2" source="2" target="3" weight="7"  directed="true"/>
  </graph>
</graphml>
```

- Atributo `directed`: `true`/`false` ou `1`/`0`
- O atributo `label` e opcional; sem ele, o ID e usado como rotulo

### Formato JSON

Exportado automaticamente pela aplicacao ao salvar. Pode ser reimportado sem perda de informacao.

### Formato .poly (Campus UFG — gerado pelo ConverteMapaParaGrafo.c)

Formato produzido pelo programa C fornecido pelo professor a partir de arquivos `.osm` do OpenStreetMap:

```
<num_vertices>  2  0  1
<id>  <x>  <y>
...
<num_arestas>  1
<edgeId>  <from>  <to>  <0_ou_1>
...
0
```

O peso de cada aresta e calculado automaticamente como a distancia euclidiana entre os dois vertices.
Para importar o mapa do Campus UFG: extraia `Campus2UFGRegiao.zip` e importe `Campus2UFG&Regiao.poly`.

---

## Arquitetura dos arquivos

```
index.html            Interface principal
css/
  styles.css          Estilos da aplicacao
js/
  constants.js        Constantes globais (cores, tamanhos, modos)
  MinHeap.js          Fila de prioridade minima (min-heap binario)
  Graph.js            Estrutura de dados do grafo (lista de adjacencia)
  Dijkstra.js         Algoritmo de Dijkstra usando MinHeap
  Renderer.js         Renderizador canvas com zoom/pan
  FileIO.js           Importacao e exportacao de arquivos
  App.js              Controlador principal da aplicacao
  main.js             Ponto de entrada
examples/
  example.txt         Mapa de exemplo em formato TXT
  example.xml         Mesmo mapa em formato XML
```

### Complexidade

O algoritmo de Dijkstra implementado usa uma **fila de prioridade min-heap binario** e uma **lista de adjacencia**, resultando em complexidade **O((V + E) log V)**, adequada para grafos grandes.

---

## Autores

- (Nome do autor 1)
- (Nome do autor 2)
- (Nome do autor 3)

Disciplina: Algoritmos e Estruturas de Dados  
Instituicao: (Nome da instituicao)  
Ano: 2025
