# MindLog – CLAUDE.md

Perfil: pessoal — see section 1.1 of the global `CLAUDE.md`.

**Padrão de UI transversal:** `D:\dev\_padrao\` (comece pelo `README.md`: componentes, UI/UX, movimento, mobile,
visual, mascote). Este arquivo só registra o que é do MindLog e as exceções declaradas ao padrão. Catálogo de
componentes com API: `mind-log-web/COMPONENTS.md`. Mascote: `mind-log-web/brand/mascot/`.

## Project Overview

**MindLog** is a personal media tracking platform built on top of the **Money Matters** base project.
It allows users to track any type of media they consume — movies, series, books, games, courses, podcasts, and more.
The platform is generic and extensible, designed to eventually support public profiles similar to MyAnimeList or Letterboxd.

> ⚠️ This project is adapted from Money Matters. All references to "money", "transactions", "budgets", or finance must be replaced with MindLog domain concepts.

---

## Tech Stack

- **Backend:** Spring Boot + relational database (PostgreSQL)
- **Frontend:** Follow the same color scheme and component patterns from Money Matters
- **Auth:** Reuse the existing authentication system from Money Matters as-is

---

## Project Structure

```
mind-log/
├── mind-log-api/                  # Spring Boot REST API
│   ├── src/main/java/com/mindlog/
│   │   ├── MindLogApplication.java             # Entry point
│   │   ├── data/
│   │   │   ├── dtos/              # DTOs por domínio (auth, follow, mediatype, status, usermedia, etc.)
│   │   │   ├── enums/             # Recommendation, RolesENUM, SuggestionStatus, AuthProvider
│   │   │   ├── models/            # Entidades JPA: User, UserMedia, MediaType, Status,
│   │   │   │                      #   Follow, Notification, Suggestion, SystemEvent, Role, PasswordRecoverToken
│   │   │   └── converters/        # StringListConverter
│   │   ├── infra/security/        # Spring Security, JWT filters, OAuth2SuccessHandler,
│   │   │                          #   CookieOAuth2AuthorizationRequestRepository
│   │   ├── repositories/          # Spring Data JPA repositories (11 repositórios)
│   │   ├── resources/             # REST controllers (@RestController)
│   │   │   ├── AdminResource.java
│   │   │   ├── AuthResource.java
│   │   │   ├── FollowResource.java
│   │   │   ├── MediaTypeResource.java
│   │   │   ├── NotificationResource.java
│   │   │   ├── PrivacyPolicyResource.java
│   │   │   ├── PublicProfileResource.java
│   │   │   ├── StatusResource.java
│   │   │   ├── SuggestionResource.java
│   │   │   ├── UserMediaResource.java
│   │   │   ├── UserResource.java
│   │   │   └── handlers/ResourceExceptionHandler.java
│   │   └── services/
│   │       ├── AuthService.java
│   │       ├── admin/             # AdminService
│   │       ├── audit/             # AuditService, SystemEventService
│   │       ├── follow/            # FollowService
│   │       ├── mediatype/         # MediaTypeService
│   │       ├── notification/      # NotificationService, NotificationScheduler
│   │       ├── profile/           # PublicProfileService
│   │       ├── status/            # StatusService
│   │       ├── suggestion/        # SuggestionService
│   │       ├── user/              # UserService + use cases (RegisterUser, GetUserById, etc.)
│   │       └── usermedia/         # UserMediaService
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   ├── application-dev.properties
│   │   └── db/migration/          # V1__init.sql, V2__add_notification_social_fields.sql
│   ├── docker/                    # Dockerfiles para dev e prod
│   ├── docker-compose.yml
│   ├── Dockerfile                 # Multi-stage: Maven + JRE 21
│   └── Jenkinsfile
└── mind-log-web/                  # Angular frontend
    ├── src/app/
    │   ├── app.module.ts
    │   ├── app-routing.module.ts
    │   ├── pages/                 # 14 módulos de página (media, planned, auth, profile, admin, etc.)
    │   ├── services/              # 15+ services
    │   ├── guards/                # auth e role guards
    │   ├── interceptors/          # auth e http-error interceptors
    │   └── shared/                # ui/ (biblioteca única de componentes) + layout/app-shell
    ├── brand/mascot/              # kit do mascote (fonte única mascot.js + build.js)
    ├── COMPONENTS.md              # catálogo da biblioteca, com API e exemplo
    ├── nginx/nginx.conf
    ├── Dockerfile                 # Multi-stage: Node 22 + Nginx
    └── package.json
```

---

## Key Files

| Arquivo | Descrição |
|---|---|
| `mind-log-api/src/main/java/com/mindlog/MindLogApplication.java` | Entry point Spring Boot |
| `mind-log-api/src/main/java/com/mindlog/infra/security/WebSecurityConfig.java` | Configuração de segurança, JWT e OAuth2 |
| `mind-log-api/src/main/java/com/mindlog/infra/security/OAuth2SuccessHandler.java` | Handler de login social (Google/OAuth2) |
| `mind-log-api/src/main/java/com/mindlog/resources/UserMediaResource.java` | Controller principal (entidade UserMedia) |
| `mind-log-api/src/main/java/com/mindlog/resources/AuthResource.java` | Endpoints de autenticação |
| `mind-log-api/src/main/java/com/mindlog/resources/PublicProfileResource.java` | Perfis públicos de usuários |
| `mind-log-api/src/main/java/com/mindlog/services/usermedia/UserMediaService.java` | Lógica de negócio central |
| `mind-log-api/src/main/resources/application.properties` | Configuração da aplicação |
| `mind-log-api/src/main/resources/db/migration/` | Histórico de migrations Flyway |
| `mind-log-web/src/app/app-routing.module.ts` | Definição de rotas Angular |

---

## Dependencies & Tech Stack (Versões)

### Backend (mind-log-api)
| Tecnologia | Versão |
|---|---|
| Java | 21 |
| Spring Boot | 3.3.5 |
| Spring Data JPA | (gerenciado) |
| Spring Security | (gerenciado) |
| Spring OAuth2 Client | (gerenciado) |
| Spring Validation | (gerenciado) |
| PostgreSQL | (runtime) |
| H2 Database | (runtime, testes) |
| Flyway Core + PostgreSQL | (gerenciado) |
| Lombok | (compile-time) |
| Auth0 Java JWT | 3.19.3 |
| ModelMapper | 2.4.5 |

### Frontend (mind-log-web)
| Tecnologia | Versão |
|---|---|
| Angular | ^18.2.14 (última da 18; upgrade de major fica fora, decisão de 2026-11-12) |
| Angular CDK | ^18.2.14 |
| TypeScript | ~5.5.2 |
| ng-bootstrap | ^17.0.1 (só dropdown e datepicker; diálogo é o `app-modal`) |
| Tailwind CSS | ^3.4.19 |
| ngx-toastr | ^19.0.0 |
| @auth0/angular-jwt | ^5.2.0 |
| Font Awesome Free | ^6.7.2 (só pelo `app-icon`) |
| @fontsource-variable (Inter, Space Grotesk) | ^5.3.0 (fontes servidas pelo app) |

### Comandos
```bash
# Backend
./mvnw spring-boot:run
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Frontend
npm start       # ng serve (porta 4200)
npm run build   # ng build

# Docker
docker-compose up
```

---

## Database

When creating or referencing the database, always use:
```
Database name: mind-log
```

Do not use the Money Matters database name. All new migrations, scripts, and configurations must point to `mind-log`.

---

## Naming & Branding

- Application name: **MindLog**
- Replace all UI labels, page titles, email templates, and copy that reference "Money Matters" with "MindLog"
- MindLog tem **identidade visual própria** (ciano → violeta) — ver "Design System" abaixo.
  A regra antiga de herdar a identidade do Money Matters está **revogada** desde o
  refactor visual de 2026-08-27.

---

## Design System

> Fechado no refactor visual de 2026-08-27. Pacote de decisões e histórico em
> `D:\second-brain\dev\mind-log\refactor-visual`.

### Fonte única da verdade para cor

Toda cor nasce no `:root` de `mind-log-web/src/styles.scss`, em variáveis `--ml-*`,
no formato **canais RGB separados por espaço** (`--ml-primary-600: 8 145 178;`).
O `tailwind.config.js` **não contém nenhuma cor** — só monta rampas apontando para
as variáveis. Para trocar um tom do sistema, edite o `styles.scss`, nunca o config.

**6 famílias:** `primary` (ciano, marca/ação/em progresso) · `secondary` (violeta,
par do gradiente) · `success` (esmeralda) · `warning` (âmbar) · `danger` (rosa) ·
`neutral` (cinza frio).

### Superfícies semânticas — o template não escreve `dark:` para superfície

Escreva `bg-surface-card`, `text-ink`, `text-ink-muted`, `text-ink-subtle`,
`border-hairline`; o valor troca sozinho em `html.dark`. `dark:` só é aceitável
para ajustar **opacidade de uma família de cor** (ex.: `bg-primary-50
dark:bg-primary-500/10`), nunca para superfície/texto/borda.

### Elevação — 4 níveis, e só

Nada · `shadow-sm` (controles) · `shadow-md` (**card, sempre**) · `shadow-lg`
(modal, dropdown, sidebar). Hover sobe exatamente um nível e a transição precisa
incluir `box-shadow`. **Sombra colorida não existe.**

### Raio — escala semântica, sem escala numérica

`rounded-chip` (10px) · `rounded-control` (14px) · `rounded-card` (20px) ·
`rounded-panel` (28px) · `rounded-shell` (24px) · `rounded-full`.
A escala numérica (`rounded-xl`, `rounded-lg`…) foi **removida do config**.

### Altura de controle — escala semântica

`min-h-control-sm` (36px, controle denso) · `min-h-control` (44px, padrão) ·
`min-h-control-lg` (52px, CTA) · `min-w-touch`/`min-h-touch` (44px, alvo mínimo
de toque). A altura de botão, input e select vem daqui — **não** de padding
vertical, senão os controles de uma mesma linha não fecham na mesma altura.
Botão de ícone usa `.icon-btn-touch`, que só força os 44px em aparelho sem
ponteiro (`@media (hover: none)`); no desktop ele continua compacto.

### Movimento — token, como a cor

Duração e curva nascem em `--ml-dur-*` e `--ml-ease-*` no `:root` do
`styles.scss`; o `tailwind.config.js` só aponta para elas. Nenhum componente
escreve `duration-200` nem `cubic-bezier` solto.

`duration-fast` (150ms: saída, pressionar, hover) · `duration-base` (200ms:
padrão) · `duration-slow` (300ms: tela, folha, painel) · `duration-enter`
(400ms: entrada de destaque) · `duration-shared` (500ms: indicador que desliza).
Curvas (valores do padrão): `ease-enter` · `ease-exit` · `ease-inout` ·
`ease-spring` (a mola 300/25 amostrada em `linear()`). Pressionar é
`active:scale-press` (0,97). Troca de página por View Transitions: só o
`<main>` faz fade de `fast`; seleção (segmentado, sidebar) é um indicador que
desliza com a mola.

Dois tokens não têm utilitário do Tailwind porque não são usados em classe:
`--ml-dur-count` (900ms, duração da contagem de número) e `--ml-dur-stagger`
(50ms, passo entre itens da cascata). Quem os lê é a diretiva `appCountUp` e
a classe `.stagger-in`.

Regras: anime só `transform` e `opacity`; **`transition-all` não entra** —
nomeie as propriedades (`transition-[background-color,color]`); saída em até
150ms; entrada de card/modal desloca 4–14px, nunca `translateY(100%)` (isso é
folha vindo da borda, e só no celular).

`prefers-reduced-motion: reduce` tem um bloco global no fim do `styles.scss`
que zera transformação e animação — **mantendo opacidade de propósito**, senão
conteúdo com `animate-fade-in` fica preso em `opacity: 0`. Spinner é a exceção
que continua girando; shimmer de skeleton para. Ele zera também
`animation-delay` e `transition-delay`: zerar só a duração deixaria o item da
cascata esperando o atraso inteiro antes de aparecer, que é exatamente a espera
que a preferência quer eliminar.

#### Número que conta e cascata de entrada

Número que representa **quantidade** conta de 0 até o valor com a diretiva
`appCountUp` (`shared/ui/count-up/`): tiles do dashboard, métricas do admin,
contadores do perfil público. Número **ordinal** (posição no top 10) não conta
— contar até "7" numa medalha não significa nada. Contador que muda a cada
filtro ou página também não: a recontagem a cada clique é ruído.

A diretiva **escreve o `textContent` do elemento**, então o elemento não pode
ter interpolação dentro; prefixo e sufixo entram por `countUpPrefix` /
`countUpSuffix`, nunca como texto solto ao lado. O elemento precisa de
`tabular-nums` (todos os números do app já têm), senão a largura do dígito
muda a cada quadro e o número treme. `app-stat-card` já aplica sozinho quando
`value` é numérico.

Cascata de entrada é a classe **`.stagger-in` no contêiner** — o atraso vive no
`styles.scss`, não no template, porque valor arbitrário em `[]` é proibido.
Passo de 50ms, teto no 10º item: acima disso a cascata deixa de ser leitura de
sequência e vira espera. Use em grade de tiles e lista curta, não em lista
paginada.

Duas armadilhas já pagas aqui:

- **A cascata precisa de `animation-fill-mode: both`.** Com `forwards` (o que
  `animate-fade-in-up` usa), o item fica no estilo normal durante o atraso,
  pisca para `opacity: 0` quando a animação começa, e só então entra.
- **`requestAnimationFrame` para de ser chamado quando a janela não está sendo
  pintada** (aba de fundo, janela coberta) — e nesse caso
  `document.visibilityState` ainda pode dizer `visible`, então ouvir
  `visibilitychange` não cobre. Sem um `setTimeout` de segurança, a contagem
  congela num valor intermediário com `aria-busy` preso em `true`.

### Contraste — piso de 4,5:1 para texto

Texto pequeno (<18pt) precisa de 4,5:1 sobre a superfície em que está, nos
**dois** temas. Consequências já embutidas nos tokens, não reabrir:

- `ink-subtle` é o tom mais claro permitido para texto (90 105 125 no claro,
  130 145 165 no escuro). Nada mais claro que isso carrega texto.
- Link e texto de marca usam **`text-link`** (token que vira sozinho com o
  tema), nunca `text-primary-600 dark:text-primary-400` — esse par dá 3,68:1
  no tema claro. Hover: `hover:text-link-hover`.
- Fundo sólido com texto branco usa o degrau **`-700`** da família
  (`bg-primary-700`, `bg-success-700`), não `-600`: branco sobre `primary-600`
  dá 3,68:1. A rampa da marca continua a mesma — o que muda é qual degrau
  carrega texto.

### Componente antes de HTML cru

A biblioteca vive em `mind-log-web/src/app/shared/ui/` (barrel em `index.ts`) e é
**a única**. A pasta `components/` não existe mais (curadoria, 2026-11-12): os
pickers foram para `shared/ui` e os compostos de domínio para junto da tela que
os usa (`pages/home/onboarding-modal`, `pages/user/users/admin-user-form-modal`,
`pages/user/users/mobile-users-list`). A lista completa, com props e exemplo, é
o `mind-log-web/COMPONENTS.md` — componente novo ou API mudada entra lá no mesmo
commit.

A única diretiva da biblioteca é `appCountUp` (ver "Movimento"); todo o resto
é componente.

`app-multi-select` e `app-autocomplete-input` foram **removidos** em 2026-11-05:
estavam mortos, e o autocomplete ainda arrastava Angular Material e classes do
Bootstrap (`form-control`, `invalid-feedback`) para dentro do design system. Se
um deles voltar a ser preciso, escreva de novo seguindo `app-select`.

**Todo campo traz o próprio rótulo e o próprio erro.** `app-select`,
`app-form-input`, `app-form-textarea` e `app-date-picker-input` têm `label`,
`required`, `errorMessage` e `hint`; grupo de controles (estrelas, chips,
caixas) usa `app-field-group` — `<label>` ou `<p class="ios-label">` solto ao
lado de um campo é defeito.

**Diálogo é um só: `app-modal`** (folha de baixo no celular, central a partir
de `sm`, saída animada, `canClose` para alterações não salvas). Aberto por
código: `ModalService.open()`. `NgbModal` não entra mais.

**Botões têm corpo e não têm contorno:** `primary`, `secondary` (suave da
marca), `danger` (suave), `danger-solid` (só no diálogo de confirmação),
`gradient` (CTA de destaque, gradiente nos degraus `-700`) e `sidebar`. Não
existe `ghost` nem `outline`: link de texto é `app-text-link`.

**Carregando, vazio e erro são três estados.** Falha de carga é
`app-load-error` com "Tentar novamente", nunca lista vazia; vazio por filtro é
`app-empty-state pose="search"` com "Limpar filtros". Formulário com estado
implementa `canDeactivate` (rota) usando o `UnsavedChangesService`.

Não escreva card, botão, input, select, tabela, abas ou paginação à mão — um
`<button>`, `<input>` ou `<table>` cru num template de página é defeito, não
atalho. Se o componente não atende, **estenda o componente** — não contorne com
Tailwind solto no template. Componentes **não têm escape hatch de estilo**
(nada de `@Input() color`).

Confirmação de exclusão é sempre o `ConfirmationDialogService` — `confirm()`
nativo não entra.

O CDK de drag & drop monta preview e placeholder no `<body>`, fora do template,
então as classes deles vivem no bloco "CDK Drag & Drop" do `styles.scss`, não
no template (usado em `pages/planned`).

Classes de tom (`bg-primary-50` etc.) montadas dinamicamente ficam em
`shared/ui/tone.ts`, como **strings literais completas** — o scanner JIT do
Tailwind não enxerga `bg-${tone}-50`.

### Acessibilidade — o que todo componente e toda tela devem ter

Fechado na varredura de 2026-11-05. Não regredir:

- **Ícone é decoração:** o `app-icon` já sai com `aria-hidden`. O nome da
  ação vem do texto do botão ou do `ariaLabel`.
- **Controle sem texto visível exige `ariaLabel`** (`app-icon-btn`, toggle,
  estrelas, limpar busca, limpar data).
- **Overlay fecha no Esc e devolve o foco ao gatilho** (select, filtro, data,
  emoji, modal). Modal usa `cdkTrapFocus` + trava de rolagem do corpo.
- **Listbox é listbox:** opções são `role="option"` dentro de `role="listbox"`,
  nunca `<button>`; a navegação é por seta/Home/End/typeahead no gatilho, com
  `aria-activedescendant`.
- **`role="tab"` só com painel de aba.** Filtro que muda uma lista já visível é
  `role="group"` + `aria-pressed` (ver `app-segmented-control`).
- **Campo com erro** tem `aria-invalid`, `aria-describedby` e `role="alert"` na
  mensagem; o `id` é gerado pelo componente quando não vem de fora, senão o
  `for` do `<label>` não aponta para nada.
- **Bloco de carregamento** é `role="status"` com rótulo; o esqueleto em si é
  `aria-hidden` (ele é forma, não conteúdo).
- Hierarquia de título: a página tem um `<h1>` (do `app-page-header`); seção
  começa em `<h2>`. Não pule nível.

### Idioma — nenhuma string fixa na UI

Todo texto visível sai de `i18n/en.ts` + `i18n/pt.ts` pelo pipe `translate`,
**inclusive em `shared/ui` e nas telas de autenticação**. O idioma padrão é
`en`, então string em português fixa no template aparece no meio de uma tela
inglesa — foi o que aconteceu com login, cadastro e troca de senha até
2026-11-05. `aria-label` também é texto visível para leitor de tela: traduza.

### Mapa semântico de status (usar sem exceção)

| Status | Família | Ícone |
|---|---|---|
| Planned | `neutral` | `clock` |
| In Progress | `primary` | `play` |
| Completed | `success` | `circle-check` |
| Paused | `warning` | `pause` |
| Dropped | `danger` | `xmark` |

Recomendação: `thumbs-up` success · `minus` neutral · `thumbs-down` danger
(nomes do mapa do `app-icon`).
Resolvido por `resolveStatusVisual()` / `resolveRecommendationVisual()` em `shared/ui/tone.ts`.

### Gradiente é acento, não plano de fundo

`bg-grad-brand` (logo) · `bg-grad-brand-strong` (FAB e CTA: carrega texto ou
ícone branco, que sobre o `-500` dá 2,43:1) · `bg-grad-brand-soft` (fundo de
ícone/badge) · `.text-gradient-brand` · `bg-grad-sidebar` · `bg-grad-glow`.
**Nunca** em fundo de card comum, fundo de página, texto de corpo ou borda de input.

### Ícones e emoji

Ícones são **Font Awesome 6**, sempre pelo `app-icon` com o nome do mapa
fechado em `shared/ui/icon/icon.component.ts` (o compilador recusa nome que não
está lá). Tela nenhuma escreve `<i class="fa-...">`. **Sem emoji na UI** — a
única exceção é o campo `feelings` do `UserMedia`, que é dado do usuário.

### Mascote

O **Nó** (o anel do logo com rosto; nome ainda não escolhido, no código
`mascot`). Fonte única `mind-log-web/brand/mascot/mascot.js`; gere tudo com
`node brand/mascot/build.js`. Entra só pelo `app-empty-state` /
`app-load-error` (prop `pose`) e no primeiro passo do onboarding; telas de
administração usam `[mascot]="false"`. Onde aparece e com que texto:
`brand/mascot/playbook.html`.

**Exceção declarada (decisão do dono, 2026-11-19):** a retrospectiva do ano (`/retrospective`) usa o mascote também na
abertura (`wave`), no fecho (`celebrate`) e na imagem de compartilhar, além dos estados vazios. Nas telas do
meio ele não aparece e continua sem falar de si.

### Espaçamento — 6 degraus, base 4px

`1` · `2` · `3` · `4` · `6` · `8`. Proibidos `1.5`, `2.5`, `5`, `7`, `10` e valor
arbitrário em `[]`.

### Layout

Desktop (`md+`): sidebar flutuante (`fixed left-4 top-4 bottom-4 w-56
rounded-shell`), conteúdo compensa com `md:ml-64`. Mobile: topbar fina + barra
inferior `h-[74px]` (exceção declarada ao padrão de escala) com FAB central
para `/media/new` e folha "Mais" (`app-modal`). As barras fixas somam a safe
area (`viewport-fit=cover`), alturas de tela são `dvh` e campos têm 16 px no
celular. Tudo em `shared/layout/app-shell/`. **Mobile first: desenhe em 375px.**

**Exceção declarada (decisão do dono, 2026-11-12):** detalhe e edição de mídia
continuam em página inteira também no celular (o formulário é grande e tem o
painel de preview); a folha de baixo é para diálogos.

### Tema

Claro e escuro são igualmente de primeira classe. `ThemeService` respeita
`prefers-color-scheme` quando não há escolha salva; script anti-flash no
`<head>` do `index.html` aplica a classe antes do primeiro paint.

### Armadilhas já pagas (não repetir)

- **`overflow-hidden` vai no elemento que TEM o raio.** Pôr `overflow-hidden`
  no host de `<app-card>` (que não tem raio) recorta o filho arredondado em
  quadrado. Use `[clip]="true"`, que aplica no elemento certo.
- **`height: 100%` num item de grid anula o `align-items: stretch`.** A
  porcentagem não resolve contra uma linha de altura automática e cai para
  `auto`. Para cards de mesma altura, deixe a altura em `auto` e use
  `min-h-*` no conteúdo.
- **`gap` só funciona com `display: flex`/`grid`.** `@apply items-center gap-2`
  sem `flex` é silenciosamente inerte — foi o que colou o ícone no texto do
  botão de feedback.
- **Ícone do Font Awesome precisa do nome do glifo SEMPRE presente.**
  `fa-star` fica fixo; o que alterna é `fa-solid` / `fa-regular`. Aplicar
  `fa-star` só no estado cheio faz a estrela vazia sumir por completo.
- **Diálogo aberto pelo `ModalService` vive no `<body>`, fora do
  router-outlet.** Ele sobrevive a troca de rota e a fim de sessão — quem abre
  precisa fechá-lo no logout (ver `OnboardingService`).
- **Gradiente em `objectBoundingBox` não pinta traço horizontal** (altura zero):
  no SVG do mascote o gradiente é `userSpaceOnUse`.
- **`@import` Sass de pacote `@fontsource` não gera `@font-face`.** As fontes
  entram pelo array `styles` do `angular.json`.
- **Altura de linha de tabela precisa ser fixa.** Uma célula que quebra em
  duas linhas (dois badges, por exemplo) estica só aquela linha e a tabela
  perde o ritmo. `.ios-table tbody tr` tem `height: 68px`.
- **A sidebar é escura nos DOIS temas.** Dentro dela use
  `text-surface-sidebar-fg` e `bg-white/10`, nunca `text-ink-*` — que inverte
  com o tema e vira texto escuro sobre fundo escuro no tema claro. Há
  `app-icon-btn variant="sidebar"` e `.sidebar-feedback-cta` para isso.
- **Font Awesome 6 Free Regular tem poucos glifos.** `fa-regular fa-lock`,
  `fa-regular fa-trash`, `fa-regular fa-grip-vertical` e companhia não existem
  e renderizam como quadrado vazio, sem erro nenhum. Antes de usar
  `fa-regular`, confirme que o ícone está no conjunto livre; no resto,
  `fa-solid`. Teste rápido no console: um glifo ausente mede 30px a 40px de
  fonte, um presente mede 35px ou mais.
- **Comentário HTML dentro de template inline não aceita acento grave.** O
  template é template literal: `` ` `` no comentário fecha a string e o build
  quebra com erros de sintaxe que apontam para o lugar errado.
- **`min-h-dvh` dentro de contêiner com padding soma rolagem morta.** As
  telas de autenticação se centralizam sozinhas em `min-h-dvh`; por isso o
  `app.component` só aplica `px`/`py` quando há sessão.
- **Esqueleto tem de ter a forma e a altura do conteúdo real.** Três linhas de
  texto no lugar de um card faz a página saltar quando os dados chegam — e a
  grade do esqueleto precisa ter o mesmo número de colunas do conteúdo.

### Layout das páginas

As telas ocupam a **largura toda** — o `<main>` do `app.component.html` não
tem `max-w` nem `mx-auto`, e as páginas começam com `<div class="w-full">`.
Formulários grandes usam duas colunas: campos à esquerda e um painel
`xl:sticky` à direita com preview e ações (ver `media-form`).

### Toasts

Mensagem sempre via `i18n.t('toast.*')` — nunca string literal. A cor sai do
mapa semântico como **faixa lateral de 4px** + ícone: sucesso→`success`,
erro→`danger`, aviso→`warning`, info→`primary`. O fundo continua sendo a
superfície elevada; toast inteiro colorido não existe.

### Assets estáticos — atenção

Este projeto **não usa a pasta `public/`**. O `angular.json` lista os assets
**explicitamente**, arquivo por arquivo (`src/favicon.ico`, `src/favicon.svg`,
`src/apple-touch-icon.png`, `src/assets`). Um arquivo novo na raiz de `src/` só
é publicado depois de ser adicionado aos **dois** blocos `assets` (build e test).
Arquivo largado em `public/` é silenciosamente ignorado — não dá erro de build,
só 404 em runtime.

---

## Domain Model

### User
Represents a registered user of the platform. Auth is already implemented — do not recreate it.

| Field | Type | Notes |
|---|---|---|
| id | BIGINT | PK |
| username | VARCHAR | unique |
| email | VARCHAR | unique |
| created_at | TIMESTAMP | |

---

### MediaType
Defines the type of media being tracked (Movie, Series, Book, Game, etc.).

| Field | Type | Notes |
|---|---|---|
| id | BIGINT | PK |
| name | VARCHAR | |
| is_system | BOOLEAN | true = platform default |
| user_id | BIGINT | FK → User, nullable if system |

Rules:
- `is_system = true` → belongs to the platform, visible to all users
- `is_system = false` → belongs to a specific user
- Users cannot edit or delete system media types

---

### Status
Represents the progress state of a media entry.

System defaults: `Planned`, `In Progress`, `Completed`, `Paused`, `Dropped`

| Field | Type | Notes |
|---|---|---|
| id | BIGINT | PK |
| name | VARCHAR | |
| is_system | BOOLEAN | |
| user_id | BIGINT | FK → User, nullable if system |

Rules:
- System statuses are available to all users
- User statuses belong only to their creator
- Users cannot modify system statuses

---

### UserMedia
The core entity — represents a media item tracked by a user.

| Field | Type | Notes |
|---|---|---|
| id | BIGINT | PK |
| user_id | BIGINT | FK → User |
| title | VARCHAR | |
| media_type_id | BIGINT | FK → MediaType |
| status_id | BIGINT | FK → Status |
| rating | INT | 1–5 stars, nullable |
| feeling | VARCHAR | emoji string, nullable |
| recommendation | ENUM | RECOMMEND, NEUTRAL, NOT_RECOMMEND |
| start_date | DATE | nullable |
| end_date | DATE | nullable |
| notes | TEXT | short personal comments |
| review | TEXT | longer written reflection |
| visibility | ENUM | PUBLIC, PRIVATE |
| planned_order | INT | posição manual na fila de planejados, nullable |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

Field rules:
- **rating**: integer 1 to 5 only
- **feeling**: free string (emoji), optional — examples: 😍 🔥 🙂 😐 💀
- **recommendation**: must be exactly one of `RECOMMEND`, `NEUTRAL`, `NOT_RECOMMEND`
- **visibility**: `PUBLIC` entries appear on the user's public profile
- **notes vs review**: both are free text; notes are short, review is long-form
- **planned_order**: só tem sentido para entradas em *Planned*. É a ordem que o
  usuário definiu arrastando em `/planned`, gravada 1..n por tipo de mídia pelo
  `PATCH /v1/media/planned-order`. `NULL` = ainda não ordenada, vai para o fim da
  fila (desempate por `created_at`). Não entra no `UserMediaSaveDTO`: a ordem muda
  só pelo endpoint de reordenação.
- No granular progress tracking (no episode numbers, page counts, etc.) — progress = status

---

## User Capabilities

### Media Management
- Create, edit, delete a media entry
- Change status, rating, feeling, recommendation
- Add notes and write a review
- Set start and end dates
- Toggle visibility (public/private)

### Media Type Management
- View system media types
- Create custom media types
- Use both system and custom types when creating entries
- Cannot edit or delete system types

### Status Management
- View system statuses
- Create custom statuses
- Use both system and custom statuses when creating entries
- Cannot modify system statuses

### Viewing
- View their own full media list
- Filter by media type, status, or recommendation
- Search their own library by title
- View public lists of other users

### Planned Queue (`/planned`)
- Ver tudo que está em *Planned*, agrupado por tipo de mídia, com o primeiro item
  de cada grupo destacado como o próximo
- Definir a sequência arrastando os itens; a ordem é **por tipo de mídia** (não se
  arrasta um item de um tipo para outro)
- Mudar o status de uma entrada a tira dessa fila

---

### Retrospective (`/retrospective`, `/retrospective/:year`)
- Sequência de telas em tela cheia (`pages/retrospective/story`), avanço **manual** (toque, setas, arrastar), sem
  autoplay. O componente se move para o `<body>`: o `<main>` tem `view-transition-name`, que prende elemento
  `fixed` e o z-index dentro dele.
- Uma mídia entra no ano de `endDate` (status *Completed*); sem ela, o ano de `startDate`; sem as duas, fica de
  fora e a tela avisa quantas ficaram. Nunca `updatedAt`.
- Três faixas: 0 concluídas = estado vazio; 1–2 (`lowData`) = abertura, total com os títulos e fecho; 3 ou mais =
  versão completa (a tela sem dado é pulada).
- API `GET /v1/retrospective/years` e `/{year}`: cálculo em `RetrospectiveCalculator` (puro, sem I/O).
- A home oferece o ano de 1/12 a 31/1 (`bannerYear`); o menu abre qualquer ano com algo concluído.
- Compartilhar = imagem 1080 × 1920 desenhada numa `<canvas>` no navegador (cores dos tokens `--ml-*`), pela Web
  Share API ou por download. Os títulos começam escondidos (interruptor "Mostrar títulos"). Sem link público: o perfil
  `/u/:username` exige login.

## Design Rules

- Do **not** store or manage images
- Do **not** track granular progress (episodes, pages, etc.)
- Keep the model generic — never assume the platform only tracks movies or anime
- Prioritize normalization and clean relational structure
- All new entities must follow the same repository/service/controller pattern used in Money Matters
- Para regras de UI (paleta, elevação, raio, componentes), ver "Design System" acima

---

## What NOT to Do

- Do not recreate auth — it's already done
- Do not write color in `tailwind.config.js` — it lives in `--ml-*` no `styles.scss`
- Do not write duration or easing in a component — they live in `--ml-dur-*` / `--ml-ease-*`
- Do not use `transition-all`; name the properties you animate
- Do not use colored shadows, or any radius/spacing outside the semantic scales
- Do not hand-roll a card, button or input — use `shared/ui/`
- Do not write a `<label>` next to a field — the field component owns its label
- Do not hardcode user-facing text; it goes through `i18n/` and the `translate` pipe
- Do not put emoji in the UI (except the user's `feelings` field)
- Do not write `<i class="fa-...">` — icons go through `app-icon`
- Do not open dialogs with `NgbModal` or hand-rolled overlays — use `app-modal` / `ModalService`
- Do not show a failed load as an empty list — use `app-load-error`
- Do not edit `mascot-art.generated.ts` or the mascot exports by hand — change `brand/mascot/mascot.js` and run the build
- Do not hardcode media categories
- Do not use the Money Matters database name
- Do not leave any "Money Matters" branding in user-facing content