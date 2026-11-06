# 2026-11-05 — Refactor geral de UI/UX

**Contexto:**
- Pedido: revisar todas as telas, rotas e formulários do `mind-log-web` e refatorar
  para melhorar UI/UX. Autorização explícita para decidir a ordem das etapas e
  executar tudo sem confirmar etapa a etapa.
- Skills `ui-patterns` e `motion-design` carregadas como critério de revisão.
- Base: design system fechado em 2026-08-27 e consolidação de `shared/ui` de 2026-11-05.

**Auditoria inicial (o que estava errado, com número):**
- `app-select` sem `label`/`required`/`errorMessage` → 24 `<label class="ios-label">`
  crus em 6 páginas.
- Zero `aria-`/`role` em 16 de 18 templates de página; 6 componentes interativos
  sem aria nenhum; teclado só em 3 dos ~10 componentes com overlay.
- Nenhum arquivo de tokens de movimento: durações soltas (150/200/250/300/600ms),
  `transition: all`, `prefers-reduced-motion` tratado em 1 lugar.
- Skeleton genérico (card de mídia virava 3 linhas de texto).
- 74 utilitários de espaçamento fora da escala, em 20 arquivos.
- `autocomplete-input` e `multi-select` mortos — e o primeiro arrastava Angular
  Material + classes Bootstrap para dentro do design system.

**Decisões:**
- Ordem executada 2 → 1 → 3 → 4 → 5 (a11y primeiro: maior impacto real e contido
  em `shared/ui`, risco quase nulo de regressão visual).
- Movimento vira token em `--ml-dur-*` / `--ml-ease-*` no `styles.scss`, com o
  `tailwind.config.js` só apontando — mesma regra já usada para cor.
- Nova escala semântica de altura de controle (`control-sm` 36 / `control` 44 /
  `control-lg` 52) e `min-w/min-h-touch`, em vez de padding vertical.
- Novo token semântico `link` / `link-hover`: o template escreve `text-link` e
  não mais o par `text-primary-600 dark:text-primary-400`, que no tema claro
  não alcançava contraste mínimo.
- `ink-subtle` escurecido nos dois temas (claro 148,163,184 → 90,105,125;
  escuro 100,116,139 → 130,145,165). Era a cor de **todo** rótulo de campo e
  texto de apoio, com 2,56:1 no claro e 3,90:1 no escuro.
- Fundo sólido que carrega texto branco passou de `-600` para `-700`
  (botão primário, página ativa da paginação, aba selecionada, chip sólido):
  branco sobre `primary-600` dá 3,68:1. A rampa da marca **não** mudou.
- `autocomplete-input` e `multi-select` removidos (mortos); `MatDialogModule`
  removido do `app.module` junto, por ter ficado sem uso.
- `icon-btn` e `card` estendidos (`routerLink`, `tone="danger"`) em vez de
  contornar com HTML cru na página.

**Progresso:**

*Etapa 1 — movimento*
- `--ml-dur-fast|base|slow|enter` e `--ml-ease-enter|exit|inout|spring` no `:root`.
- `tailwind.config.js`: `duration-*`/`ease-*` apontando para os tokens; keyframes
  (`fade-in`, `fade-in-up`, `scale-in`, `slide-up`) passam a usar os tokens.
- Bloco global `prefers-reduced-motion: reduce` — mantém opacidade de propósito
  (zerar tudo prenderia conteúdo de `animate-fade-in` em `opacity: 0`), com
  spinner como exceção e shimmer de skeleton parado.
- 16 `transition-all` / `transition: all` → transições de propriedade nomeada.
  Nenhuma duração crua restante em `pages/`, `shared/`, `components/`.

*Etapa 2 — a11y e teclado*
- `select`: setas, Home/End, Enter/Espaço, Esc, busca por letra,
  `aria-activedescendant`, devolução de foco; opções viraram `role="option"`
  (botão dentro de listbox é inválido).
- `filter-dropdown`: i18n, `aria-expanded`/`aria-controls`, Esc com foco de volta.
- `pagination`: `nav` nomeado, `aria-current`, clique no botão (não no `<li>`),
  e janela de páginas responsiva — 10 botões estouravam 375px.
- `search-input`: `type="search"`, rótulo, botão de limpar nomeado, placeholder
  padrão traduzido (era "Buscar por descrição…", herança do Money Matters).
- `date-picker-input`: botão de limpar virou irmão do gatilho — aninhado num
  `<button>` ele não recebia foco e era inalcançável por teclado.
- `modal`: `role="dialog"`, `aria-modal`, `aria-labelledby`, `cdkTrapFocus` com
  devolução de foco e trava de rolagem do corpo.
- `rating-stars`: só leitura virou `role="img"` (eram 5 botões desabilitados);
  interativo virou `radiogroup` com setas e Delete.
- `segmented-control`: `role="group"` + `aria-pressed` no lugar de `tablist`/`tab`
  (não há painel de aba) e navegação por setas.
- `form-input`/`form-select`/`form-textarea`: `id` gerado — com `id` vazio o
  `for` do `<label>` não apontava para nada —, `aria-invalid`, `aria-describedby`,
  `role="alert"` no erro.
- 49 ícones decorativos receberam `aria-hidden`.
- Link "pular para o conteúdo" no `app.component`.

*Etapa 3 — contrato do `app-select`*
- `label`/`required`/`errorMessage`/`hint`/`ariaLabel` absorvidos pelo componente;
  páginas limpas (media-form, public-profile, content, media-types, statuses).
- `.ios-hint` criado para o texto de apoio ficar igual nos três campos.

*Etapa 4 — carregamento e vazio*
- Skeleton ganhou vocabulário (`text`, `title`, `chip`, `bar`, `circle`, `block`)
  e `aria-hidden` no host; cada lista passou a ter o esqueleto com a forma do
  conteúdo real (media-list, home, planned, top10, people, notifications,
  public-profile, content, media-types, statuses, admin, users).
- Spinner de tela cheia de `media-detail` e `media-form` trocado por esqueleto
  das duas colunas.
- Grade do esqueleto do admin corrigida (era 2/4 colunas, o conteúdo é 2/3).
- `users` deixou de montar esqueleto com `div.skeleton-row` solta no template.

*Etapa 5 — varredura por rota*
- 74 espaçamentos normalizados para a escala 1/2/3/4/6/8; recuo óptico de ícone
  virou `.input-pad-icon-left|right` (não é ritmo de espaçamento).
- 11 tamanhos de fonte abaixo do mínimo (`text-[9px]`/`text-[10px]`) → `text-2xs`.
- Ações do card de mídia: duas âncoras estilizadas à mão viraram `app-icon-btn`
  (componente ganhou `routerLink`).
- **Telas de autenticação não tinham nenhuma tradução** e o idioma padrão do app
  é inglês — login, cadastro e troca de senha abriam em português. Traduzidas.
- `fa-regular fa-lock` não existe no Font Awesome 6 Free Regular: o cadeado do
  login e do cadastro renderizava como quadrado vazio. Trocado por `fa-solid`.
- Entrada do card de autenticação era `translateY(100%)` (~660px). Trocada por
  `animate-fade-in-up` (14px).
- 48px de rolagem morta nas telas de autenticação (o respiro da página era
  aplicado por fora de um filho `min-h-screen`).
- `profile`: zona de perigo deixou de ser card feito à mão; `<h5>` → `<h2>`
  (hierarquia de título); placeholders traduzidos.
- `app-table` ganhou região rolável focável e nomeada.

**Verificado:**
- `ng build` (dev) e `ng build` (produção) passam, sem aviso de budget.
- Navegador embutido, `localhost:4210` (4200 estava ocupada por outro projeto):
  login e cadastro em 375px e em 1280px, tema claro e escuro — sem rolagem
  horizontal, sem rolagem morta, cadeado renderizando.
- Contraste medido no DOM após as mudanças: rótulo 5,60:1 (claro) / 5,78:1
  (escuro), link 5,36:1 / 10,27:1, apoio 7,58:1 / 7,24:1 — antes 2,56:1 e 3,68:1.
- Alvos de toque do login: alternar senha 44×44, Entrar 52, Google 46.

**Não verificado / em aberto:**
- **As rotas autenticadas não foram exercidas no navegador.** A API em `:8080`
  responde 302 para um serviço que não parece ser o `mind-log-api`, e não havia
  credencial disponível. Media list, planned, top10, people, notifications,
  admin, perfil e detalhe foram revisados só por código e build.
- Contraste foi medido na tela de login. Chips de tom (`tone.ts`, texto sobre
  fundo tingido) não foram medidos um a um.
- Nenhum teste automatizado foi executado — o projeto não tem suíte de UI.
- Falta decidir se `text-link` deve substituir também o uso em `tone.ts` e no
  `spinner` (lá o primary-600 é gráfico/chip, não texto sobre superfície clara).

**Próximo passo:**
- Subir o `mind-log-api` e repetir a verificação nas rotas autenticadas,
  principalmente `/media` (card, filtros, paginação), `/planned` (arrastar com
  teclado) e `/admin` (tabela).
