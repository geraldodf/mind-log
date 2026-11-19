# 2026-11-19 — Retrospectiva do ano

Registro completo (plano, decisões do dono e log) também em `D:\dev\_features\mindlog-retro.md`.

## Contexto
O dono pediu uma retrospectiva do ano no estilo Wrapped: sequência de telas animadas, compartilhável, com o
mascote apresentando. Branch `claude/feat-retrospectiva-bac1be`, um commit por etapa, sem push.

## Decisões do dono (todas a opção recomendada)
1. Núcleo enxuto: total concluído, por tipo, mês mais ativo, mais bem avaliados, nota média, sentimentos, recomendadas.
2. Menu abre qualquer ano com algo concluído; aviso na home de 1/12 a 31/1.
3. O ano de uma mídia vem de `endDate`; sem ela, de `startDate`; sem as duas fica de fora, com aviso.
4. Três faixas: 0 (estado vazio), 1–2 (versão curta), 3 ou mais (completa).
5. Compartilhar = imagem gerada no navegador, com o interruptor "Mostrar títulos".
6. O mascote aparece na abertura, no fecho e nas telas vazias (exceção declarada no `CLAUDE.md`).
7. Avanço manual, sem autoplay.

## Decisões técnicas (minhas)
- Agregação em memória num `RetrospectiveCalculator` puro (volume pessoal); sem migration, sem dependência nova.
- A tela cheia é movida para o `<body>`: o `<main>` tem `view-transition-name`, que prende elemento `fixed`.
- Imagem com Canvas API e Web Share API nativas; cores lidas dos tokens `--ml-*`.
- Títulos escondidos por padrão na imagem (privacidade primeiro; o dono vê a prévia e liga se quiser).
- `FormatPipe` novo para preencher `{campo}` em texto traduzido; `app-story-progress` entra na biblioteca.

## Verificação
Testes do back (`./mvnw test`, JDK 21) e do web (`ng test`) verdes; queries conferidas contra Postgres 13 real
(`docker compose -p mindlog-retro`, porta 52201); telas conferidas no navegador (desktop e 375 px, claro e escuro).
QA formal não rodou (o dono decide).

## Fora do escopo / pendências
- Link público: o perfil `/u/:username` exige login; fica para quando houver acesso anônimo.
- O contador "sem data" é global (todas as concluídas sem datas), não por ano.

## Revisão
O revisor achou 1 defeito alto (a tela cheia movida para o `<body>` nunca saía de lá e cobria o app depois de fechar),
3 médios (tentar de novo sem efeito e fluxo morto após erro; foco escapando do diálogo; compartilhar no iOS exigindo
a chamada direto do toque) e itens menores (revogação do blob, faixa de anos da API, nota com vírgula em pt-BR, teto
da cascata, clique direito, dica do interruptor, código morto). Tudo corrigido no mesmo lote.
