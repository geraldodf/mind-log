# 2026-11-05 — Fila de planejados, componentização e redesign da página de detalhe

**Context:**
- O dono pediu duas features ("lista de coisas planejadas, para ver qual é o próximo livro/série" e "pesquisa por nome na library") e, no meio da execução, mais duas frentes: componentizar tudo que é reutilizável (como em Kore/Essentials/iDrink) e melhorar a página de detalhe.
- Levantamento inicial: a única lista de planejamento do projeto era `FUTURE_FEATURES.md`; não existia `docs/progress/` nem pacote em `D:\second-brain\dev\mind-log`.

**Decisões:**
- **Busca por nome na library: nada a fazer.** Já estava implementada (campo com debounce em `media-list`, param `title` → `UserMediaRepository.findAllByUserIdFiltered`, incluindo o fix de cast do commit `d54c389`). Confirmado com o dono, que não tinha visto que existia.
- **Planejados:** página dedicada `/planned`, agrupada por tipo de mídia, com o primeiro item de cada grupo destacado como "próximo".
- **Ordem da fila: manual, definida pelo usuário** (não por data/lançamento). Implica campo novo `planned_order` + migration + endpoint de reordenação. Mecanismo escolhido: **arrastar e soltar** (`@angular/cdk/drag-drop`, já no projeto).
- **Componentes:** copiar a **API/estrutura** dos componentes do Kore (`D:\dev\kore\saquei-web\src\app\components`) e **reescrever o estilo com os tokens `--ml-*` do MindLog**. Alertado ao dono que copiar literalmente traria o design system do Kore e quebraria a identidade fechada no refactor visual de 2026-08-27; ele confirmou a abordagem de copiar só a API.
- **Página de detalhe:** redesign (duas colunas, review/notes como protagonista, painel `xl:sticky` com metadados e ações, no mesmo padrão do `media-form`) **+ ações rápidas inline** (trocar status, dar nota, favoritar sem ir ao formulário) — era o que faltava para justificar abrir a tela, já que o card da library mostra quase tudo.
- Reuso do `PUT` existente (remontando o `UserMediaSaveDTO` a partir da entrada carregada) para as ações inline, em vez de criar endpoints novos.
- Execução delegada a subagentes `implementador` (sonnet · high), conforme as regras de roteamento do CLAUDE.md global, com revisão do diff antes de reportar.

**Progress:**
- Corrigido o espaçamento entre ícone e texto em "Notificações" no sidebar (`shared/layout/app-shell/app-shell.component.html:34`): o `<span>` que envolve ícone+texto não era `flex`, então o `gap-3` do `.sidebar-nav-link` não atuava dentro dele — é a armadilha de `gap` sem `flex` já registrada no `AGENTS.md`.
- Criado este pacote de log (`docs/progress/` + índice), que o projeto ainda não tinha.
- Em andamento: Step 1a (consolidar `shared/ui/` + componentes faltantes) e Step 2 API (migration `V3__add_planned_order.sql`, `GET /v1/media/planned`, `PATCH /v1/media/planned-order`).

- **Step 1a — biblioteca consolidada.** `shared/ui/` virou a única biblioteca: 7 componentes novos (`toggle`, `checkbox`, `segmented-control`, `table`, `icon-btn`, `spinner`, `password-requirements`), 7 movidos de `components/` (`search-input`, `pagination`, `filter-dropdown`, `multi-select`, `autocomplete-input`, `date-picker-input`, `confirmation-dialog`) e `components/text-input` apagado por duplicar `app-form-input`. Em `components/` ficaram só os compostos de domínio.
- **Step 1b — telas componentizadas.** ~15 telas trocaram HTML cru por componentes; `confirm()` nativo saiu de `pages/**`; paginações inline viraram `app-pagination`. Componentes estendidos sem escape hatch: `app-btn` (`sidebar`, `soft`, `danger-solid`), `app-icon-btn` (`primary`, `xs`, `fill`), `app-segmented-control` (`underline`), `app-table` (`fill`), `app-form-*` (`size`, `autocomplete`, `loading`, `clearable`, `passwordToggle` e `markForCheck` no `writeValue`, que faltava sob OnPush). `directives/password|username` passaram a ler `event.target` para funcionar sobre `<app-form-input>`. Sobraram 6 `<button>` crus no `app-shell` (dropdowns do ng-bootstrap e tiles da barra mobile) — registrados, não escondidos.
- **Step 2 — fila de planejados.** Backend conforme acima; frontend em `pages/planned/` com uma `cdkDropList` por grupo (sem listas conectadas, então não se arrasta entre tipos), handle de 44px com `touch-none`, atualização otimista com rollback e lista travada enquanto a requisição está em voo. Estilos do preview/placeholder do CDK no `styles.scss`, porque o CDK os monta no `<body>`.
- **Step 3 — detail redesenhada.** Duas colunas (review/notes à esquerda, painel `xl:sticky` à direita), ações inline de status/nota/favorito salvando pelo `PUT` existente.
- **Revisão independente (`revisor`)**: nenhum achado bloqueante. Corrigidos daí: `app-icon-btn` disparava `(click)` mesmo desabilitado (o `disabled:pointer-events-none` jogava o clique no host), 4 listas de rótulos que não reagiam à troca de idioma (eram propriedades, viraram getters), regras de senha fixas em PT-BR (foram para i18n), guarda de concorrência nas ações inline da detail e erro ignorado ao carregar status.
- **QA no app rodando** (stack `docker-compose.local.yml`, browser interno): fila agrupada com "Up next", arraste persistindo após reload, arraste entre grupos bloqueado, ações inline persistindo sem perder review/notes/recommendation, busca com debounce, exclusão pelo diálogo, mobile 375px sem scroll horizontal, temas claro/escuro legíveis, console limpo. Corrigidos depois do QA: diálogo de confirmação traduzido e com Confirmar em `danger`, botões de recomendação estourando o card em 375px (viraram grid), cantos quadrados e alinhamento das linhas em `/planned`, e o título de página que colapsava a 0 em 768px (o header só vira linha em `lg` agora).

**Decisão de domínio confirmada pelo dono (2026-11-05):** desfavoritar passa a **limpar** `topRank`. O `update` tratava `null` como "mantenha", então a tela limpava o #1 e o banco guardava, e refavoritar ressuscitava o rank antigo. Agora `isFavorite = false` zera o rank; com favorito ligado, `null` continua significando "mantenha". Verificado de ponta a ponta no ambiente local: rank 1 → desfavoritar → `topRank: null` no banco → refavoritar → continua `null`.

## Rodada de pendências (2026-11-05, depois do QA)

O dono pediu para resolver tudo que não exigisse tocar o servidor. Feito e verificado no ambiente local:

- **nginx (`mind-log-web/nginx/nginx.conf`)** — removido o `$uri/` do `try_files`. A rota `/media` colidia com a pasta `media/` que o build gera para as fontes do Font Awesome: o nginx normalizava o diretório e devolvia 301 para `/media/` (perdendo a porta publicada), caindo em 403. Em produção o sintoma seria 403 ao abrir ou recarregar a Library. Medido depois: `/media` 200, `/media/` 200, fontes 200.
- **`scrollPositionRestoration: 'enabled'`** no `RouterModule.forRoot`. Verificado: sair da lista em y=500, abrir a detail, voltar → y=474.
- **`PATCH /planned-order` endurecido** — passa a exigir que todos os ids sejam entradas no *Planned* de sistema **e** do mesmo tipo de mídia, rejeitando a requisição inteira. Verificado: ids de tipos diferentes → 400; ids do mesmo grupo → 204.
- **Abas da Library** — novo `GET /v1/media/used-types` (DISTINCT dos tipos do usuário) alimenta as abas, que antes eram derivadas só da página carregada e escondiam tipos fora dela. Verificado: abas trazem Book, Movie e Series mesmo com Movie fora da página 1. A lista é recarregada também após exclusão, caso a última entrada de um tipo saia.
- **Diálogo de confirmação** — `confirm(target?)` mostra o que será afetado; o título/nome passa a ser enviado em media-list, media-detail, media-types, statuses, content e users. Verificado: o diálogo exibe "Dune".
- **Cabeçalho sticky das tabelas (estava sem verificação)** — **estava quebrado.** O `h-full` encadeado das telas não limitava altura nenhuma (nenhum ancestral tem altura definida), então o `.table-scroll` crescia com as linhas, quem rolava era a página e o `thead` subia até sumir (medido: topo em `-495`). Corrigido com um teto de viewport (`max-height: calc(100vh - 14rem)`) no modo `fill` do `app-table`. Verificado com 33 linhas: rola dentro do contêiner e o header fica cravado.
- **Tiles da barra mobile** — novo `app-sheet-tile` em `shared/ui/` (vira `<a>` com `link`, `<button>` sem), eliminando 10 blocos de markup repetido e 3 dos 6 `<button>` crus do `app-shell`. Sobram 3, que são markup obrigatório do dropdown do ng-bootstrap.
- **Scroll horizontal em 375px** — apareceu na Library: o bloco de ações do cabeçalho (busca de 224px + filtro + botão) não quebrava. Agora quebra (`flex-wrap`, busca `w-full sm:w-56`). Verificado: documento com 375px e zero elementos transbordando, com o sheet aberto inclusive.
- **Título de página colapsando** — o `app-page-header` só vira linha em `lg`; em `md` as ações consumiam a largura toda e o `h1` ficava com 0px. Verificado em 768px: 97px.
- **Onboarding** — altura mínima no bloco de texto para o modal não pular entre passos, e os pontos de progresso ganharam `aria-label` e `aria-current`.
- **Acesso admin** — a conta de teste local foi promovida a `ROLE_ADMIN` (`INSERT` em `users_roles` no container descartável, autorizado pelo dono) só para destravar a verificação das tabelas. Nada remoto foi tocado.

Não resolvido por depender de coisas fora daqui: serviço de e-mail (`AuthService.java:114`, precisa de provedor e credenciais) e o arraste por toque real (a ferramenta de browser só emite eventos de mouse).

**Open items:**
- **Arraste por toque real** continua sem prova: a ferramenta de browser emite eventos de mouse. O `touch-action` do handle está correto.
- **Serviço de e-mail** (`AuthService.java:114`) segue não implementado: a recuperação de senha depende de provedor e credenciais, que são decisão do dono.
- **`.agents/`** continua fora do `.gitignore` e aparece como untracked — não mexi porque não sei se a skill deve ser versionada no repositório.
- **Nada commitado.** Todo o trabalho de hoje está na working tree.
- O **deploy** precisa subir o `nginx.conf` novo junto com o front, senão a Library continua em 403 em produção.

**Next step:**
- Revisar o diff e decidir sobre commit e deploy; o `nginx.conf` é a mudança que destrava a Library em produção.
