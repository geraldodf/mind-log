# 2026-11-05 — Contagem de número e cascata de entrada

**Contexto:**
- Continuação do refactor de UI/UX registrado em
  [2026-11-05-refactor-ui-ux-geral.md](2026-11-05-refactor-ui-ux-geral.md), já
  commitado em `b82f4da`.
- Pedido: "count up animation ou dashboard entrance animation", nos lugares com
  gráfico e número que fizessem sentido. O levantamento de onde aplicar foi
  apresentado e aprovado antes da implementação.
- Antes disso, o usuário pediu a inversão da convenção de instruções do projeto.

**Levantamento:**
- **Não existe gráfico no app.** `chart.js` e `@fullcalendar/angular` estão no
  `package.json` mas não são importados em lugar nenhum do `src/`. Então
  "dashboard entrance animation" aqui é a cascata dos tiles, não animação de
  série de dados.
- Números encontrados: 3 na home (total, próximos, não lidas), 9 nas métricas do
  admin, 3 no perfil público, 1 no subtítulo de `/media`, 1 por grupo em
  `/planned`, posição 1–10 no `/top10`.

**Decisões:**
- Count up só onde o número é **quantidade** e estável na tela: home, admin,
  perfil público (15 números).
- **Fora:** posição do `/top10` (é ordinal — contar até "7" numa medalha não
  significa nada), total de `/media` (muda a cada filtro e página, recontar a
  cada clique é ruído) e badge de grupo em `/planned` (número baixo, alvo
  pequeno).
- Diretiva (`appCountUp`) e não componente: aplica no `<p>`/`<span>` que já
  existe, sem mudar estrutura de template. Consequência aceita: a diretiva passa
  a ser dona do `textContent`, então esses elementos perdem a interpolação e
  ganham `countUpPrefix` para o `+` das métricas de "hoje".
- Contagem roda fora da zona do Angular — ~60 quadros/s dentro da zona seriam
  60 rodadas de change detection por segundo.
- Duração (`--ml-dur-count`) e passo da cascata (`--ml-dur-stagger`) nascem no
  `:root`, como qualquer outro valor de movimento. Sem utilitário no
  `tailwind.config.js` porque não são usados em classe.
- Cascata como classe CSS (`.stagger-in`) e não atributo por item: o projeto
  proíbe valor arbitrário em `[]`, e cascata é regra de folha de estilo.
  Aplicada em 3 lugares: tiles da home, 9 métricas do admin, lista do `/top10`.
- Quadros próprios (`@keyframes ml-stagger-in`) em vez de reusar o `fadeInUp` do
  `tailwind.config.js`: o Tailwind só emite `@keyframes` junto do utilitário que
  os usa, então a cascata quebraria no dia em que ninguém escrevesse
  `animate-fade-in-up`.

**Progresso:**
- Novo `shared/ui/count-up/count-up.directive.ts` (+ barrel). easeOutCubic,
  casas decimais herdadas do alvo, `aria-busy` enquanto conta, valor imediato
  com `prefers-reduced-motion` (consultado a cada animação, não uma vez).
- `app-stat-card` aplica a diretiva quando `value` é numérico; valor em texto
  continua interpolado (as duas saídas são exclusivas).
- `styles.scss`: tokens `--ml-dur-count` / `--ml-dur-stagger`, bloco
  "Cascata de entrada", e `animation-delay` / `transition-delay` zerados no
  bloco de movimento reduzido.
- Templates: `home` (grid de tiles + contador de não lidas), `admin-panel`
  (grid de 9 + os 9 valores), `public-profile` (3 contadores), `top10`
  (`animate-fade-in` do contêiner virou `stagger-in` nos filhos — fade no pai
  mais cascata nos filhos seria fade duplo).
- Fechados 7 ícones decorativos sem `aria-hidden` em `shared/ui` e
  `components/` (empty-state, recommendation-chip, status-chip, sheet-tile ×2,
  stat-card, onboarding-modal). **O relatório anterior dizia que essa varredura
  tinha voltado zero; ela só cobria `pages/`.**
- `CLAUDE.md`: subseção "Número que conta e cascata de entrada" dentro de
  "Movimento", com as duas armadilhas abaixo.

**Dois defeitos encontrados durante a verificação (corrigidos):**
- `fill-mode: forwards` na cascata faz o item aparecer, piscar para invisível
  quando a animação começa e só então entrar. Precisa ser `both`.
- `requestAnimationFrame` para de ser chamado quando a janela não está sendo
  pintada, e nesse caso `document.visibilityState` ainda diz `visible` — ouvir
  `visibilitychange` não cobriria. Sem rede de segurança a contagem congelava
  num valor intermediário com `aria-busy` preso em `true`. Foi observado na
  prática: 74 quadros em 500ms com o painel à vista, **1** com ele escondido.
  Resolvido com um `setTimeout(duração + 150ms)` que assenta o valor final.

**Verificado:**
- `ng build` dev e produção passam. Produção: 1,42 MB cru / 314,09 kB de
  transferência (era 1,41 MB / 313,12 kB), sem aviso de budget.
- Verificação feita em rota temporária de sondagem (`/probe`), criada para o
  teste e **removida depois** — `app-routing.module.ts` voltou ao estado do
  commit anterior, confirmado por `git status`.
- Contagem medida no DOM: 1234 → 1271 em ~900ms, desacelerando
  (+1245 a 100ms, +1257 a 252ms, +1260 a 308ms), valor final exato,
  `aria-busy` presente durante e removido no fim.
- Movimento reduzido (com `matchMedia` forçado): valor final no mesmo tique,
  sem `aria-busy`.
- Cascata medida: atraso 0 → 450ms em passos de 50ms, `fill-mode: both`,
  duração 400ms, e teto confirmado — os itens 11 e 12 compartilham o atraso do
  10º.
- `app-stat-card` conferido nos quatro casos: inteiro, inteiro pequeno, texto
  não numérico (passa direto) e decimal (4,5 mantém a casa).

**Não verificado / em aberto:**
- **As rotas reais continuam sem verificação no navegador** — a API em `:8080`
  não é o `mind-log-api` e não há credencial. A prova acima é da diretiva e da
  classe em isolamento, não das telas `/`, `/admin` e `/u/:username` montadas.
- Não medido em aparelho real nem com CPU desacelerada.

**Próximo passo:**
- Subir o `mind-log-api` e conferir as três telas de verdade: a sequência dos
  9 tiles do admin (400ms de atraso + 400ms de duração = 800ms até o último),
  a contagem da home na primeira carga, e o contador de seguidores do perfil
  público mudando ao seguir/deixar de seguir.
