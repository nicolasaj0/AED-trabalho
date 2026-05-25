# Plano de Testes do Sistema

**Projeto:** Sistema de Navegação Primitivo (Dijkstra)  
**Disciplina:** AED2 — INF/UFG 2026-1  
**Professor:** André L. Moura  
**Versão:** 1.0 | **Data:** 20/05/2026

---

## 1. Objetivo e Escopo

### 1.1 Objetivo

Este plano define os casos de teste para verificar e validar que o Sistema de Navegação Primitivo (Dijkstra) atende a todos os requisitos funcionais e não funcionais especificados no ERS (documento 02). Os objetivos específicos são:

- **Testes funcionais:** verificar que cada funcionalidade do sistema opera conforme especificado (importação, edição, seleção, Dijkstra, exportação, clipboard).
- **Testes de integridade:** verificar a correção do algoritmo de Dijkstra em casos conhecidos.
- **Testes de performance:** verificar os limites de tempo de resposta definidos em RNF04 e a fluidez de renderização em RNF03.
- **Testes de robustez:** verificar o comportamento do sistema diante de entradas inválidas ou situações excepcionais.

### 1.2 Escopo dos Testes

Os testes são manuais (execução manual pelo testador em um navegador web). Não estão no escopo: testes automatizados unitários, testes de carga automatizados ou testes de segurança.

---

## 2. Ambiente de Teste

| Item | Detalhe |
|---|---|
| **Sistema Operacional 1** | Windows 10 / Windows 11 (64 bits) |
| **Sistema Operacional 2** | Ubuntu 22.04 LTS (64 bits) |
| **Navegador primário** | Google Chrome 120+ |
| **Navegador secundário** | Mozilla Firefox 120+ |
| **Hardware mínimo** | Processador 2 GHz dual-core, 4 GB RAM, placa de vídeo com suporte a Canvas 2D |
| **Arquivos de teste** | `examples/example.txt`, `examples/example.xml`, `Campus2UFG&Regiao.poly` |
| **Servidor** | Nenhum (arquivo aberto localmente via `file://` ou HTTP local) |
| **Versão do sistema** | Conforme repositório do projeto |

---

## 3. Casos de Teste

---

### CT01 — Importar Arquivo .txt Válido

| Campo | Descrição |
|---|---|
| **ID** | CT01 |
| **Caso de Teste** | Importar arquivo `.txt` válido |
| **Requisito** | RF01 |
| **Pré-condições** | Sistema aberto no navegador. Arquivo `examples/example.txt` disponível. |
| **Passos** | 1. Clicar no botão "Importar". 2. Selecionar o arquivo `example.txt`. 3. Aguardar o carregamento. |
| **Resultado Esperado** | O grafo é importado e exibido no canvas. O painel lateral exibe o número correto de vértices e arestas. A barra de status exibe "Arquivo importado: example.txt ([V] vértices, [E] arestas)". |
| **Resultado Obtido** | |
| **Status** | |

---

### CT02 — Importar Arquivo .xml Válido

| Campo | Descrição |
|---|---|
| **ID** | CT02 |
| **Caso de Teste** | Importar arquivo `.xml` válido (GraphML) |
| **Requisito** | RF01 |
| **Pré-condições** | Sistema aberto. Arquivo `examples/example.xml` disponível. |
| **Passos** | 1. Clicar em "Importar". 2. Selecionar `example.xml`. 3. Aguardar. |
| **Resultado Esperado** | Grafo carregado corretamente. Vértices e arestas correspondem ao conteúdo do arquivo XML. Mensagem de sucesso na barra de status. |
| **Resultado Obtido** | |
| **Status** | |

---

### CT03 — Importar Arquivo .poly do Campus UFG (~10.000 nós)

| Campo | Descrição |
|---|---|
| **ID** | CT03 |
| **Caso de Teste** | Importar arquivo `.poly` de grande escala |
| **Requisito** | RF01, RNF03 |
| **Pré-condições** | Sistema aberto. Arquivo `Campus2UFG&Regiao.poly` disponível. |
| **Passos** | 1. Clicar em "Importar". 2. Selecionar `Campus2UFG&Regiao.poly`. 3. Aguardar o carregamento. 4. Testar pan e zoom após o carregamento. |
| **Resultado Esperado** | O arquivo é importado sem erro. O painel exibe ~10.000 vértices e ~11.526 arestas. O canvas exibe o mapa completo com fit-to-screen automático. Pan e zoom respondem de forma fluida (sem travamento percebível > 1 segundo). |
| **Resultado Obtido** | |
| **Status** | |

---

### CT04 — Importar Arquivo com Formato Inválido

| Campo | Descrição |
|---|---|
| **ID** | CT04 |
| **Caso de Teste** | Tentar importar arquivo de formato não suportado |
| **Requisito** | RF01 (fluxo de exceção E1) |
| **Pré-condições** | Sistema aberto com um grafo carregado. |
| **Passos** | 1. Clicar em "Importar". 2. Selecionar um arquivo `.pdf` ou `.png` (renomear temporariamente para `.xyz` ou selecionar via "Todos os arquivos"). 3. Confirmar a seleção. |
| **Resultado Esperado** | O sistema exibe na barra de status: "Formato não suportado: use .txt, .xml, .json ou .poly". O grafo anterior não é alterado. |
| **Resultado Obtido** | |
| **Status** | |

---

### CT05 — Adicionar Vértice via Clique

| Campo | Descrição |
|---|---|
| **ID** | CT05 |
| **Caso de Teste** | Adicionar vértice manualmente clicando no canvas |
| **Requisito** | RF05 |
| **Pré-condições** | Sistema aberto (grafo vazio ou com vértices existentes). |
| **Passos** | 1. Clicar no botão "+Vértice" (ou pressionar V). 2. Clicar em uma área vazia do canvas. 3. No modal, digitar o rótulo "A" e clicar em "Adicionar". 4. Repetir para um segundo vértice com rótulo "B". |
| **Resultado Esperado** | Dois vértices são criados no canvas. O painel lateral incrementa o contador de vértices para 2. Os rótulos "A" e "B" são exibidos sobre os vértices (em zoom adequado). A barra de status exibe "Vértice adicionado". |
| **Resultado Obtido** | |
| **Status** | |

---

### CT06 — Adicionar Aresta Direcionada entre Dois Vértices

| Campo | Descrição |
|---|---|
| **ID** | CT06 |
| **Caso de Teste** | Criar aresta dirigida A→B |
| **Requisito** | RF05, RF06 |
| **Pré-condições** | Dois vértices "A" e "B" existem no grafo (criados em CT05 ou importados). |
| **Passos** | 1. Ativar modo "+Aresta" (ou tecla E). 2. Clicar sobre o vértice "A". 3. Clicar sobre o vértice "B". 4. No modal, definir peso = 5 e selecionar "Direcionada (seta)". 5. Confirmar. |
| **Resultado Esperado** | Uma aresta A→B é criada, exibida com seta apontando para B. O peso "5" aparece na etiqueta sobre a aresta. O contador de arestas no painel sobe para 1. |
| **Resultado Obtido** | |
| **Status** | |

---

### CT07 — Adicionar Aresta Não Dirigida

| Campo | Descrição |
|---|---|
| **ID** | CT07 |
| **Caso de Teste** | Criar aresta não dirigida entre dois vértices |
| **Requisito** | RF05, RF06 |
| **Pré-condições** | Dois vértices existem no canvas. |
| **Passos** | 1. Ativar modo "+Aresta". 2. Clicar vértice origem. 3. Clicar vértice destino. 4. No modal, selecionar "Não direcionada (bidirecional)" e peso = 3. 5. Confirmar. |
| **Resultado Esperado** | Aresta criada sem seta. Linha reta entre os dois vértices. O peso "3" visível. Navegar de ambos os vértices no Dijkstra é possível via essa aresta. |
| **Resultado Obtido** | |
| **Status** | |

---

### CT08 — Remover Vértice com Arestas Conectadas

| Campo | Descrição |
|---|---|
| **ID** | CT08 |
| **Caso de Teste** | Remover vértice que possui arestas adjacentes |
| **Requisito** | RF05 |
| **Pré-condições** | Grafo com ao menos 3 vértices conectados (ex.: A-B-C, todos conectados a B). |
| **Passos** | 1. Ativar modo "Deletar" (tecla Delete). 2. Clicar sobre o vértice central "B". |
| **Resultado Esperado** | O vértice "B" é removido. Todas as arestas que ligavam B a A e C também são removidas automaticamente. O contador de vértices e arestas no painel é decrementado corretamente. |
| **Resultado Obtido** | |
| **Status** | |

---

### CT09 — Selecionar Vértice de Origem

| Campo | Descrição |
|---|---|
| **ID** | CT09 |
| **Caso de Teste** | Selecionar vértice de origem no modo Origem |
| **Requisito** | RF03 |
| **Pré-condições** | Grafo com ao menos um vértice. |
| **Passos** | 1. Ativar modo "Origem" (botão ou tecla S). 2. Clicar sobre um vértice. |
| **Resultado Esperado** | O vértice muda de cor para verde (`#059669`). O painel lateral exibe o rótulo do vértice na linha "Origem". A barra de status exibe "Origem: [rótulo]". |
| **Resultado Obtido** | |
| **Status** | |

---

### CT10 — Selecionar Destino Igual à Origem (Deve Desmarcar a Origem)

| Campo | Descrição |
|---|---|
| **ID** | CT10 |
| **Caso de Teste** | Tentar selecionar como destino o mesmo vértice já definido como origem |
| **Requisito** | RF03 |
| **Pré-condições** | Um vértice "A" está selecionado como origem. |
| **Passos** | 1. Ativar modo "Destino" (botão ou tecla T). 2. Clicar sobre o mesmo vértice "A" já definido como origem. |
| **Resultado Esperado** | O vértice "A" torna-se o destino (vermelho). A origem é automaticamente desmarcada (painel "Origem" exibe "—"). O vértice exibe cor vermelha, não verde. |
| **Resultado Obtido** | |
| **Status** | |

---

### CT11 — Calcular Caminho com Origem e Destino no Mesmo Componente

| Campo | Descrição |
|---|---|
| **ID** | CT11 |
| **Caso de Teste** | Calcular Dijkstra com caminho existente |
| **Requisito** | RF04 |
| **Pré-condições** | Grafo com ao menos 2 vértices conectados. Origem selecionada (verde). Destino selecionado (vermelho). |
| **Passos** | 1. Clicar "Calcular" (ou pressionar Enter). |
| **Resultado Esperado** | Um caminho é encontrado e destacado em âmbar no canvas. Os vértices no caminho ficam âmbar; a aresta no caminho fica âmbar e mais espessa. O painel exibe distância, tempo e nós explorados. A barra de status exibe "Caminho encontrado! Custo total: [valor]". |
| **Resultado Obtido** | |
| **Status** | |

---

### CT12 — Calcular Caminho em Componentes Desconexos (Sem Caminho)

| Campo | Descrição |
|---|---|
| **ID** | CT12 |
| **Caso de Teste** | Dijkstra com origem e destino em componentes separados |
| **Requisito** | RF04 (fluxo alternativo A1) |
| **Pré-condições** | Grafo com ao menos dois vértices isolados (sem aresta entre eles). Origem selecionada no vértice A. Destino no vértice B (sem caminho). |
| **Passos** | 1. Clicar "Calcular". |
| **Resultado Esperado** | A barra de status exibe "Sem caminho entre origem e destino". Nenhum caminho é destacado no canvas (exceto possivelmente os nós explorados em azul-claro). |
| **Resultado Obtido** | |
| **Status** | |

---

### CT13 — Verificar Caminho Mínimo em Grafo com Resultado Conhecido

| Campo | Descrição |
|---|---|
| **ID** | CT13 |
| **Caso de Teste** | Validação da correção do Dijkstra em grafo controlado |
| **Requisito** | RF04, RNF08 |
| **Pré-condições** | Criar manualmente o grafo: A→B (peso 4), A→C (peso 2), C→B (peso 1), B→D (peso 3), C→D (peso 6). Caminho mínimo A→D = A→C→B→D = 2+1+3 = 6. |
| **Passos** | 1. Criar o grafo conforme descrito (usando +Vértice e +Aresta com arestas dirigidas). 2. Selecionar A como origem e D como destino. 3. Clicar "Calcular". |
| **Resultado Esperado** | O caminho destacado é A → C → B → D. O custo exibido é 6. Os nós no caminho estão âmbar. |
| **Resultado Obtido** | |
| **Status** | |

---

### CT14 — Verificar Estatísticas Após Dijkstra

| Campo | Descrição |
|---|---|
| **ID** | CT14 |
| **Caso de Teste** | Conferir exibição de estatísticas no painel lateral |
| **Requisito** | RF07 |
| **Pré-condições** | Dijkstra foi executado com sucesso (CT11 ou CT13). |
| **Passos** | 1. Verificar o painel lateral após o cálculo. |
| **Resultado Esperado** | O campo "Tempo" exibe um valor numérico positivo em milissegundos (ex.: "1.234 ms"). O campo "Nós explorados" exibe um inteiro positivo. O campo "Custo total" exibe o mesmo valor que "Distância". A linha "Caminho" exibe a sequência de rótulos separados por "→". |
| **Resultado Obtido** | |
| **Status** | |

---

### CT15 — Copiar Imagem para Clipboard

| Campo | Descrição |
|---|---|
| **ID** | CT15 |
| **Caso de Teste** | Copiar imagem do canvas para a área de transferência |
| **Requisito** | RF08 |
| **Pré-condições** | Sistema aberto com grafo visível no canvas. Navegador com permissão de acesso ao clipboard (Chrome/Edge via HTTP ou localhost). |
| **Passos** | 1. Clicar no botão "Copiar Imagem" (ou pressionar Ctrl+C). 2. Abrir um editor de imagem (Paint, GIMP) ou aplicativo de mensagens. 3. Pressionar Ctrl+V. |
| **Resultado Esperado** | A barra de status exibe "Imagem copiada para a área de transferência!". A imagem colada reflete o estado atual do canvas (incluindo destaque de rota, se aplicável). |
| **Resultado Obtido** | |
| **Status** | |

---

### CT16 — Exportar Grafo como .txt e Reimportar

| Campo | Descrição |
|---|---|
| **ID** | CT16 |
| **Caso de Teste** | Ciclo completo: editar → exportar → importar → comparar |
| **Requisito** | RF01, RF05 (UC09) |
| **Pré-condições** | Grafo com ao menos 3 vértices e 2 arestas criados manualmente. |
| **Passos** | 1. Anotar o número de vértices e arestas. 2. Clicar "Exportar". 3. Verificar que o arquivo `grafo.txt` foi baixado. 4. Clicar "Limpar Tudo" e confirmar. 5. Importar o arquivo `grafo.txt` recém-exportado. |
| **Resultado Esperado** | Após a reimportação, o painel exibe exatamente o mesmo número de vértices e arestas anotados no passo 1. As posições dos vértices e os pesos das arestas são preservados. |
| **Resultado Obtido** | |
| **Status** | |

---

### CT17 — Zoom In/Out com Roda do Mouse

| Campo | Descrição |
|---|---|
| **ID** | CT17 |
| **Caso de Teste** | Navegar com zoom usando a roda do mouse |
| **Requisito** | RF (UC10), RNF06 |
| **Pré-condições** | Grafo carregado no canvas. |
| **Passos** | 1. Posicionar o cursor sobre o canvas. 2. Girar a roda do mouse para cima (zoom in) várias vezes. 3. Girar a roda para baixo (zoom out) várias vezes. 4. Verificar o percentual de zoom no painel lateral. |
| **Resultado Esperado** | O canvas amplia (zoom in) mantendo fixo o ponto sob o cursor. A porcentagem no painel lateral aumenta. Ao dar zoom out, o canvas afasta. O zoom é limitado entre 5% e 1500%. |
| **Resultado Obtido** | |
| **Status** | |

---

### CT18 — Pan com Arrastar

| Campo | Descrição |
|---|---|
| **ID** | CT18 |
| **Caso de Teste** | Deslocar a visão arrastando o canvas |
| **Requisito** | RF (UC10), RNF06 |
| **Pré-condições** | Modo "Pan" ativo (padrão ao abrir o sistema). |
| **Passos** | 1. Pressionar e segurar o botão esquerdo do mouse no canvas. 2. Arrastar o mouse em diferentes direções. 3. Soltar o mouse. |
| **Resultado Esperado** | O grafo se move acompanhando o cursor durante o arrasto. O cursor muda para "grabbing" durante o arrasto e volta para "grab" ao soltar. As coordenadas na barra de status atualizam em tempo real. |
| **Resultado Obtido** | |
| **Status** | |

---

### CT19 — Performance: Dijkstra em Grafo de 500 Nós em < 2 Segundos

| Campo | Descrição |
|---|---|
| **ID** | CT19 |
| **Caso de Teste** | Verificar meta de tempo de resposta do RNF04 |
| **Requisito** | RNF04 |
| **Pré-condições** | Grafo com aproximadamente 500 vértices e arestas (pode ser obtido importando um subconjunto do Campus UFG ou criando manualmente). Origem e destino selecionados em vértices distantes. |
| **Passos** | 1. Configurar o grafo com ~500 vértices. 2. Selecionar origem e destino em extremos opostos do grafo. 3. Clicar "Calcular". 4. Verificar o campo "Tempo" no painel lateral. |
| **Resultado Esperado** | O campo "Tempo" exibe um valor inferior a 2000 ms (2 segundos). A interface não congela visivelmente durante o cálculo. |
| **Resultado Obtido** | |
| **Status** | |

---

### CT20 — Performance: Renderização do Campus UFG (10K nós) sem Travamento

| Campo | Descrição |
|---|---|
| **ID** | CT20 |
| **Caso de Teste** | Verificar fluidez de renderização com grafo de grande escala |
| **Requisito** | RNF03 |
| **Pré-condições** | Arquivo `Campus2UFG&Regiao.poly` importado (CT03 concluído com sucesso). |
| **Passos** | 1. Com o Campus UFG carregado, realizar pan arrastando o mouse por 5 segundos. 2. Fazer zoom in/out com a roda do mouse repetidamente. 3. Clicar "Fit" para ajustar tudo na tela. 4. Selecionar dois vértices e calcular Dijkstra. |
| **Resultado Esperado** | Pan e zoom respondem sem travamento perceptível (> 1 segundo de congelamento). O Dijkstra completa em tempo razoável (< 5 segundos para o Campus UFG completo). A visualização dos nós explorados e do caminho é atualizada corretamente. |
| **Resultado Obtido** | |
| **Status** | |

---

## 4. Matriz de Rastreabilidade Testes × Requisitos

| Caso de Teste | RF01 | RF02 | RF03 | RF04 | RF05 | RF06 | RF07 | RF08 | RNF03 | RNF04 | RNF06 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| CT01 | ✓ | | | | | | | | | | |
| CT02 | ✓ | | | | | | | | | | |
| CT03 | ✓ | | | | | | | | ✓ | | |
| CT04 | ✓ | | | | | | | | | | |
| CT05 | | ✓ | | | ✓ | | | | | | ✓ |
| CT06 | | | | | ✓ | ✓ | | | | | |
| CT07 | | | | | ✓ | ✓ | | | | | |
| CT08 | | | | | ✓ | | | | | | |
| CT09 | | | ✓ | | | | | | | | ✓ |
| CT10 | | | ✓ | | | | | | | | |
| CT11 | | | | ✓ | | | | | | | |
| CT12 | | | | ✓ | | | | | | | |
| CT13 | | | | ✓ | | | | | | | |
| CT14 | | | | ✓ | | | ✓ | | | | |
| CT15 | | | | | | | | ✓ | | | |
| CT16 | ✓ | | | | ✓ | | | | | | |
| CT17 | | | | | | | | | ✓ | | ✓ |
| CT18 | | | | | | | | | ✓ | | ✓ |
| CT19 | | | | ✓ | | | | | | ✓ | |
| CT20 | ✓ | | | ✓ | | | | | ✓ | | |

---

## 5. Critérios de Aceite

O sistema é considerado **aprovado** se:

1. **CT01, CT02, CT03** passam — importação de todos os formatos suportados funciona corretamente.
2. **CT05, CT06, CT07, CT08** passam — criação e edição interativa de grafos funcional.
3. **CT09, CT10** passam — seleção de origem/destino com comportamento correto de conflito.
4. **CT11, CT12, CT13** passam — algoritmo de Dijkstra produz resultado correto (incluindo ausência de caminho).
5. **CT14** passa — estatísticas exibidas corretamente após o Dijkstra.
6. **CT16** passa — exportação e reimportação preservam o grafo fielmente.
7. **CT19** passa — tempo de resposta < 2 segundos para 500 nós.
8. **CT04** passa — o sistema não crasha ao receber arquivo inválido.

Casos CT15, CT17, CT18 e CT20 são desejáveis mas não bloqueantes para a aprovação.

O sistema é considerado **reprovado** se qualquer um dos critérios 1–8 falhar sem justificativa técnica documentada.
