# Como atualizar o site Bué FIT!

Este guia explica como atualizar o menu da semana, os preços e os restantes dados do site diretamente no GitHub, sem precisar de instalar nada. Segue os passos pela ordem indicada e, na dúvida, copia o formato das linhas que já existem.

Todos os dados do site estão na pasta **`data/`**:

| Ficheiro | O que contém | Com que frequência muda |
|---|---|---|
| `data/semanas.js` | As marmitas, sopas e sumos do menu de cada semana | **Toda a semana** |
| `data/precos.js` | Preços e pacotes de tudo | Raramente |
| `data/ingredientes.js` | Ingredientes das marmitas personalizadas | Às vezes |
| `data/sobremesas.js` | Sobremesas | Às vezes |
| `data/pokes.js` | Tipos, bases e ingredientes dos pokes | Às vezes |
| `data/zonas.js` | Zonas de entrega e taxas | Raramente |
| `data/mensagens.js` | Número de WhatsApp e mensagem do pedido | Raramente |

---

## Como editar um ficheiro no GitHub (vale para todos)

1. Abre **github.com** no browser e entra na tua conta.
2. Abre o repositório do site (**buefit**).
3. Clica na pasta **`data`** e depois no ficheiro que queres editar (ex.: `semanas.js`).
4. Clica no ícone de **lápis** ✏️ no canto superior direito do ficheiro ("Edit this file").
5. Faz a alteração (as instruções específicas estão nas secções abaixo).
6. Clica no botão verde **"Commit changes..."** no canto superior direito.
7. Na caixa que aparece, escreve uma descrição curta do que fizeste (ex.: *"Menu da semana 35"*) e clica em **"Commit changes"**.
8. Pronto — a alteração fica guardada e o site atualiza automaticamente pouco depois. Abre o site alguns minutos mais tarde e confirma que está tudo certo (se estiver a ver a versão antiga, força a atualização com Cmd+Shift+R / Ctrl+Shift+R).

> **Se te enganares antes de guardar:** basta sair da página sem fazer commit — nada é alterado.
> **Se te enganares depois de guardar:** não apagues nada às cegas. Volta a editar o ficheiro e corrige, ou pede ajuda. O GitHub guarda o histórico de todas as versões (botão **"History"** na página do ficheiro), por isso nada se perde de vez.

---

## ⚠️ Regras de ouro (lê antes de editar)

Estes ficheiros são código, por isso a **pontuação importa**. Um caractere fora do sítio pode impedir o site de carregar.

1. **Copia sempre o formato de uma linha existente.** É a forma mais segura de acertar.
2. **Cada texto fica entre plicas `' '`** e **cada linha termina com vírgula `,`**. Não apagues plicas, vírgulas, parênteses `[ ]` nem chavetas `{ }`.
3. **Não uses plica/apóstrofo dentro dos nomes.** Escreve *"Arroz de coco"* e não *"Arroz d'coco"* — o apóstrofo `'` fecha o texto antes do tempo e parte o site. Se for mesmo preciso, usa o apóstrofo curvo `’` (diferente da plica reta).
4. **Acrescenta itens novos sempre no FIM da lista e nunca reordenes nem apagues os existentes.** A posição de cada item faz parte do código dos pedidos — se mudares a ordem, os links de pedidos antigos passam a mostrar itens errados.
5. **Não mudes os códigos** que já existem (`B1`, `P12`, etc.).
6. **Não apagues semanas antigas** em `semanas.js` — são precisas para ler pedidos dessas semanas.
7. **Não mexas nas linhas que começam por `/*` ou `//`** — são notas explicativas (a cinzento no GitHub) e não afetam o site, mas as que começam por `//` à frente de números (ex.: `// 5: 38,`) estão de propósito "desligadas".
8. **Preços escrevem-se com PONTO, não vírgula:** `7.60` ✅ — `7,60` ❌. Sem símbolo de euro.

---

## 🗓️ Toda a semana: adicionar o menu da semana

**Ficheiro:** `data/semanas.js`

### Passo 1 — Descobre o número da semana

Cada menu tem uma chave no formato `'ANO-SEMANA'` (ex.: `'2026-35'` = semana 35 de 2026). Para saber o número da semana, pesquisa no Google *"que semana do ano é hoje"*. Lembra-te de que estás normalmente a adicionar a **próxima** semana, não a atual.

### Passo 2 — Copia um bloco existente

Seleciona um bloco completo de uma semana anterior — desde a linha `'2026-34': {` até à linha `},` (inclusive) — copia-o e cola-o **por baixo do último bloco**, mas ainda **antes da última linha `};`** do ficheiro.

### Passo 3 — Atualiza o bloco novo

1. Muda o número da semana na primeira linha (ex.: `'2026-35': {`).
2. Em `marmitas`, substitui as marmitas pelas novas — uma por linha, cada uma entre plicas e a terminar com vírgula. Normalmente são 10, mas o número pode variar (8, 12, …) — o site ajusta-se automaticamente ao tamanho da lista.
3. Em `sopas`, põe as sopas da semana, uma por linha no formato `[ 'Nome', 0.0 ],` (o `0.0` é o extra que soma ao preço base de sopa em `precos.js` — normalmente fica `0.0`).
4. Em `sumos`, o mesmo formato das sopas. Se ainda não houver sumos nessa semana, deixa a lista vazia: `sumos: [],` — a secção simplesmente não aparece no site.

O resultado deve ficar assim:

```js
  '2026-35': {
    marmitas: [
      'Arroz branco, Feijão preto, Bife grelhado',
      'Puré de batata, Brócolis, Frango assado',
      'Esparguete à bolonhesa',
      'Arroz integral, Legumes salteados, Salmão grelhado',
      'Cuscuz vegetariano, Beterraba, Tofu grelhado',
      'Batata doce assada, Couve, Peru grelhado',
      'Penne ao molho de tomate com atum',
      'Arroz de cenoura, Feijão verde, Bifanas',
      'Quinoa, Cogumelos, Frango desfiado',
      'Salada de grão de bico, Ovos cozidos',
    ],
    sopas: [
      [ 'Sopa de Abóbora',       0.0 ],
      [ 'Sopa de Alho Francês',  0.0 ],
    ],
    sumos: [],
  },
```

A **ordem importa** nas três listas: a posição é o número do item no pedido (a 1.ª marmita é a marmita 1, a 1.ª sopa é a sopa 1, e assim por diante), por isso escreve-as pela ordem oficial do menu.

O site mostra sozinho a semana atual (ou a mais recente que existir) — não é preciso apagar nem "ativar" nada.

### Checklist antes de guardar

- [ ] O número da semana está certo e não repete um já existente
- [ ] Estão lá todas as marmitas do menu, pela ordem oficial
- [ ] As sopas da semana estão em `sopas` (e os sumos em `sumos`, ou `sumos: [],` se não houver)
- [ ] Cada linha acaba com `,` e não tem apóstrofos no meio dos nomes
- [ ] O bloco termina com `},` e a última linha do ficheiro continua a ser `};`
- [ ] Não apagaste nenhuma semana antiga

---

## 💶 Mudar preços

**Ficheiro:** `data/precos.js`

Cada categoria tem uma tabela `quantidade: preço`. Por exemplo, nas marmitas do menu da semana tamanho M:

```js
    M: {
      1:  7.60,   ← preço de 1 marmita
      10: 74,     ← pacote de 10 marmitas por 74€
      15: 108,    ← pacote de 15 por 108€
      ...
```

- **Para mudar um preço:** altera só o número a seguir aos dois pontos. Ponto em vez de vírgula (`7.60`), sem `€`.
- **Para adicionar um pacote novo:** copia uma linha existente e muda a quantidade e o preço. Ex.: `25: 165,`.
- **Para desativar um pacote:** põe `//` no início da linha (é assim que os pacotes de 5 estão desligados: `// 5: 38,`). Para o reativar, apaga o `//`.
- **Pokes:** o preço base está em `poke: { 1: 10 }`. Logo abaixo, `POKE_INCLUDED_INGS = 5` é quantos ingredientes estão incluídos e `POKE_EXTRA_ING = 1.5` é o custo de cada ingrediente a mais.

Não mexas nos nomes das categorias (`semanal`, `propria`, `sobremesa`, …) nem na secção `GROUP_LABELS` — a menos que queiras mudar o nome que aparece no site, que é o texto entre plicas à direita.

---

## 🥗 Ingredientes das marmitas personalizadas

**Ficheiro:** `data/ingredientes.js`

Há três listas: `BASES` (arrozes, purés, massas…), `SIDES` (acompanhamentos) e `PROTS` (proteínas). Cada linha tem 6 colunas:

```js
  [ 'P26',  'Lombo de Salmão Grelhado',  3.0,  'f-salmon',  'Peixes & Mar',  'peixe veg vegan' ],
     │       │                            │     │            │                │
     código  nome no site                 extra ícone        grupo/secção     dietas que VIOLA
```

- **Mudar o preço extra de um ingrediente:** altera só o número (3.º valor). `0.0` = sem custo extra.
- **Mudar o nome:** altera só o texto do 2.º valor.
- **Adicionar um ingrediente novo:**
  1. Copia a linha mais parecida (mesmo tipo de ingrediente) e cola-a **no fim da lista certa**.
  2. Dá-lhe um **código novo que nunca tenha sido usado** — continua a numeração (`B34`, `A21`, `P40`, …).
  3. Muda o nome e o extra.
  4. Reaproveita um ícone de um ingrediente parecido (4.º valor, ex.: `'f-fish'`).
  5. No grupo (5.º valor), usa um dos que já existem para o ingrediente aparecer nessa secção (nos `SIDES` fica vazio: `''`).
  6. Nas restrições (6.º valor), lista as dietas que o ingrediente **não pode** integrar, separadas por espaço, usando as chaves da lista `DIETAS` no topo do ficheiro (`gluten`, `lactose`, `ovo`, `nuts`, `peixe`, `marisco`, `soja`, `veg`, `vegan`, `fodmap`). Ex.: um queijo seria `'lactose vegan'`. Se não viola nenhuma, deixa `''`.
- **Retirar um ingrediente do site:** não apagues a linha (o código já pode ter sido usado em pedidos) — pede ajuda para o desativar, ou põe `//` no início da linha e confirma no site que nada partiu.

---

## 🍨 Sobremesas

**Ficheiro:** `data/sobremesas.js`

(As sopas e os sumos mudam toda a semana e estão em `semanas.js` — ver a secção do menu da semana.)

Uma lista simples, `DESSERTS`. Cada linha é `[ 'Nome', extra ],`:

```js
  [ 'Mousse de Manga',   0.0 ],
```

O `extra` soma ao preço base da categoria (que está em `precos.js`). `0.0` = preço base; `1.0` = base + 1€.

- **Adicionar:** copia uma linha, cola **no fim da lista** e muda o nome (e o extra, se tiver).
- **Nunca reordenes nem apagues** — a posição faz parte do código dos pedidos.

---

## 🐟 Pokes

**Ficheiro:** `data/pokes.js`

Mesmo formato `[ 'Nome', extra ],` em três listas: `POKE_TYPES` (proteína), `POKE_BASES` (base) e `POKE_INGS` (ingredientes). Nos `POKE_INGS` há um 3.º valor: a cor com que o ingrediente aparece no site, no formato `'#F0B95C'` — ao adicionar um novo, copia a cor de um ingrediente de tom parecido (ou pede uma cor no [coolors.co](https://coolors.co)). Adicionar sempre no fim, nunca reordenar.

---

## 🚚 Zonas de entrega

**Ficheiro:** `data/zonas.js`

Cada linha é `[ 'Zona', taxa ],`. Para mudar uma taxa, altera só o número. Zonas novas entram **no fim da lista**.

---

## 💬 WhatsApp e mensagem do pedido

**Ficheiro:** `data/mensagens.js`

- `WHATSAPP_NUMERO` — o número que recebe os pedidos, escrito como quiseres que apareça no site (espaços e símbolos são ignorados ao abrir o WhatsApp).
- `MSG_PEDIDO` — a mensagem que o cliente envia. Podes mudar o texto à vontade, mas **mantém o `{link}`**: é substituído automaticamente pelo link com o resumo do pedido. Os asteriscos `*texto*` põem o texto a negrito no WhatsApp.

---

## Se o site partir depois de uma alteração

Se o site aparecer em branco ou sem menu depois de guardares, foi quase de certeza uma plica, vírgula ou parêntese a mais/a menos na última edição.

1. Abre o ficheiro que editaste no GitHub e clica em **"History"** (canto superior direito).
2. Clica na tua alteração para veres, lado a lado, o que mudou (verde = adicionado, vermelho = removido) — o erro está aí.
3. Corrige com uma nova edição, ou pede ajuda mostrando esse ecrã.

Na dúvida, mais vale pedir ajuda do que apagar coisas — o histórico guarda tudo, mas é mais fácil prevenir do que reconstruir.
