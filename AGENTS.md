# MindLog – CLAUDE.md

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
    │   ├── components/            # só compostos de domínio (quill, emoji/icon picker, modais)
    │   ├── pages/                 # 14 módulos de página (media, planned, auth, profile, admin, etc.)
    │   ├── services/              # 15+ services
    │   ├── guards/                # auth e role guards
    │   ├── interceptors/          # auth e http-error interceptors
    │   └── shared/                # ui/ (biblioteca única de componentes) + layout/app-shell
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
| Angular | ^18.2.0 |
| Angular Material + CDK | ^18.2.14 |
| TypeScript | ~5.5.2 |
| Bootstrap | ^5.3.3 |
| Tailwind CSS | ^3.4.19 |
| Chart.js | ^4.4.7 |
| FullCalendar (Angular) | ^6.1.16 |
| ngx-toastr | ^19.0.0 |
| @auth0/angular-jwt | ^5.2.0 |
| Quill (rich text) | ^2.0.3 |

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

### Componente antes de HTML cru

A biblioteca vive em `mind-log-web/src/app/shared/ui/` (barrel em `index.ts`) e é
**a única** — não existe um segundo conjunto de componentes reutilizáveis em outro
lugar (consolidada em 2026-11-05; antes disso `components/` mantinha um conjunto
paralelo, com `text-input` duplicando `app-form-input`):
`app-card`, `app-btn`, `app-icon-btn`, `app-badge`, `app-status-chip`,
`app-recommendation-chip`, `app-page-header`, `app-empty-state`, `app-skeleton`,
`app-spinner`, `app-stat-card`, `app-section`, `app-theme-toggle`,
`app-form-input`, `app-form-select`, `app-form-textarea`, `app-select`,
`app-multi-select`, `app-autocomplete-input`, `app-date-picker-input`,
`app-search-input`, `app-filter-dropdown`, `app-pagination`, `app-table`,
`app-segmented-control`, `app-toggle`, `app-checkbox`, `app-rating-stars`,
`app-password-requirements`, `app-modal`, `app-confirmation-dialog`,
`app-avatar-placeholder`.

Em `components/` ficam **só os compostos de domínio**: `quill-editor`,
`emoji-picker`, `icon-picker`, `onboarding-modal`, `admin-user-form-modal`,
`mobile-users-list`.

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

### Mapa semântico de status (usar sem exceção)

| Status | Família | Ícone |
|---|---|---|
| Planned | `neutral` | `fa-regular fa-clock` |
| In Progress | `primary` | `fa-solid fa-play` |
| Completed | `success` | `fa-solid fa-circle-check` |
| Paused | `warning` | `fa-solid fa-pause` |
| Dropped | `danger` | `fa-solid fa-xmark` |

Recomendação: `fa-thumbs-up` success · `fa-minus` neutral · `fa-thumbs-down` danger.
Resolvido por `resolveStatusVisual()` / `resolveRecommendationVisual()` em `shared/ui/tone.ts`.

### Gradiente é acento, não plano de fundo

`bg-grad-brand` (marca, FAB, CTA de destaque) · `bg-grad-brand-soft` (fundo de
ícone/badge) · `.text-gradient-brand` · `bg-grad-sidebar` · `bg-grad-glow`.
**Nunca** em fundo de card comum, fundo de página, texto de corpo ou borda de input.

### Ícones e emoji

Ícones são **Font Awesome 6** (`fa-solid fa-*`), não Tabler. **Sem emoji na UI** —
a única exceção é o campo `feelings` do `UserMedia`, que é dado do usuário.

### Espaçamento — 6 degraus, base 4px

`1` · `2` · `3` · `4` · `6` · `8`. Proibidos `1.5`, `2.5`, `5`, `7`, `10` e valor
arbitrário em `[]`.

### Layout

Desktop (`md+`): sidebar flutuante (`fixed left-4 top-4 bottom-4 w-56
rounded-shell`), conteúdo compensa com `md:ml-64`. Mobile: topbar fina + barra
inferior `h-[74px]` com FAB central para `/media/new` e bottom sheet "Mais".
Tudo em `shared/layout/app-shell/`. **Mobile first: desenhe em 375px.**

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
- **Modal do ng-bootstrap vive no `<body>`, fora do router-outlet.** Ele
  sobrevive a troca de rota e a fim de sessão — quem abre precisa fechá-lo no
  logout (ver `OnboardingService`).
- **Altura de linha de tabela precisa ser fixa.** Uma célula que quebra em
  duas linhas (dois badges, por exemplo) estica só aquela linha e a tabela
  perde o ritmo. `.ios-table tbody tr` tem `height: 68px`.
- **A sidebar é escura nos DOIS temas.** Dentro dela use
  `text-surface-sidebar-fg` e `bg-white/10`, nunca `text-ink-*` — que inverte
  com o tema e vira texto escuro sobre fundo escuro no tema claro. Há
  `.btn-icon-sidebar` e `.sidebar-feedback-cta` para isso.

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
- Do not use colored shadows, or any radius/spacing outside the semantic scales
- Do not hand-roll a card, button or input — use `shared/ui/`
- Do not put emoji in the UI (except the user's `feelings` field)
- Do not hardcode media categories
- Do not use the Money Matters database name
- Do not leave any "Money Matters" branding in user-facing content