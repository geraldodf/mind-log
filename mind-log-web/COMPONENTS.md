# Componentes do MindLog

Biblioteca única em `src/app/shared/ui/` (barrel `index.ts`). Telas só compõem estes componentes; um `<button>`,
`<input>`, `<select>`, `<textarea>`, `<img>` ou `<label>` direto numa tela é defeito. Padrão transversal em
`D:\dev\_padrao\componentes.md`; regras visuais do projeto no `CLAUDE.md` ("Design System").

## Regras

1. **Componente antes de HTML cru.** Faltou algo? Estenda o componente, não contorne com Tailwind solto na tela.
2. **Variante por prop.** `class` no host só para espaço e posição (`mt-4`, `w-40`, `col-span-2`), nunca cor nem tamanho.
3. **Padrão que aparece pela segunda vez vira componente** no mesmo commit, e ganha linha aqui.
4. **Ícone só pelo `app-icon`** (mapa fechado em `icon/icon.component.ts`). Ícone novo entra no mapa primeiro.
5. **Diálogo só pelo `app-modal`** (folha no celular, central a partir de `sm`). Aberto por código: `ModalService.open()`.
6. **Vazio e erro de carga pelo `app-empty-state` / `app-load-error`**, com o mascote em pose. Administração usa
   `[mascot]="false"`.
7. **Texto visível pelo i18n** (`translate`), inclusive `ariaLabel`.
8. Classes globais que ainda existem (`ios-input`, `ios-label`, `ios-hint`, `error-message`, `icon-btn-touch`,
   `sidebar-nav-link`, `btn-icon-ios`) são **internas** da biblioteca e da casca; tela nenhuma as usa.

## Estados dos controles

| Estado | Como | Onde |
|---|---|---|
| Hover | sobe 1 px + um nível de sombra, só em aparelho com hover (`hoverOnlyWhenSupported`) | `app-btn`, `app-card [interactive]` |
| Pressionado | `active:scale-press` (0,97) | `app-btn`, `app-icon-btn`, `app-bottom-nav-item`, FAB |
| Foco | anel `ring-2` primário com offset, só no teclado (`focus-visible`) | global + `app-btn` |
| Selecionado | um indicador desliza (mola) até o item; o texto troca de cor | `app-segmented-control`, sidebar |
| Desabilitado | opacidade 40%, sem eventos | `app-btn`, `app-icon-btn`, campos |
| Pendente | spinner no lugar do ícone, `aria-busy`, não aceita segundo clique | `app-btn [loading]` |

## Catálogo

### Ações

| Componente | Props principais | Exemplo |
|---|---|---|
| `app-btn` | `variant` (`primary`, `secondary`, `danger`, `danger-solid`, `gradient`, `sidebar`), `size` (`sm`/`md`/`lg`), `icon`, `iconPosition`, `loading`, `disabled`, `fullWidth`, `type`, `routerLink` (vira `<a>`), `pressed`, `ariaLabel` | `<app-btn variant="secondary" icon="pen" [routerLink]="['/media', id, 'edit']">Editar</app-btn>` |
| `app-icon-btn` | `icon` (obrigatório), `ariaLabel` (obrigatório na prática), `variant` (`neutral`, `primary`, `danger`, `sidebar`), `size` (`xs`–`lg`), `routerLink`, `fill`; 44 px no toque | `<app-icon-btn icon="xmark" [ariaLabel]="'common.close' \| translate" (click)="close()"></app-icon-btn>` |
| `app-text-link` | `link`, `size` (`xs`/`sm`/`base`), `icon` (depois do texto) | `<app-text-link link="/media" size="xs" icon="arrow-right">Ver todos</app-text-link>` |
| `app-google-sign-in` | `label` | `<app-google-sign-in [label]="'auth.signInWithGoogle' \| translate"></app-google-sign-in>` |

### Formulários

| Componente | Props principais | Exemplo |
|---|---|---|
| `app-form-input` | `label`, `ariaLabel` (sem rótulo visível), `type`, `icon`, `required` (mostra `*`), `invalid`, `errorMessage`, `hint`, `size`, `autocomplete`, `inputmode`, `clearable`, `passwordToggle`, `loading`; 16 px no celular | `<app-form-input formControlName="email" type="email" [label]="..." [required]="true" [invalid]="..." [errorMessage]="..."></app-form-input>` |
| `app-form-textarea` | `label`, `rows`, `size`, `required`, `invalid`, `errorMessage`, `hint` | `<app-form-textarea formControlName="notes" [rows]="3" [label]="..."></app-form-textarea>` |
| `app-select` | `options` (`{value, label, icon?}`), `label`, `placeholder`, `required`, `invalid`, `errorMessage`, `hint`, `ariaLabel`; listbox com teclado completo | `<app-select [(ngModel)]="statusId" [options]="opts" [label]="'media.status' \| translate"></app-select>` |
| `app-date-picker-input` | `label`, `required`, `id`, `ariaLabel` | `<app-date-picker-input formControlName="startDate" [label]="..."></app-date-picker-input>` |
| `app-file-input` | `label`, `file` (arquivo escolhido, do consumidor), `accept`, `hint`, `required`, `invalid`, `errorMessage`, `disabled`, `(fileChange)` (`File` ou `null` ao remover); clique ou arrastar, teclado e leitor de tela pelo `<input type="file">` nativo; tamanho e tipo validados por quem usa | `<app-file-input [label]="..." accept=".csv" [file]="file" [invalid]="!!error" [errorMessage]="error" (fileChange)="pick($event)"></app-file-input>` |
| `app-checkbox` | `label`, `required`, `invalid`, `errorMessage`, `(valueChange)` | `<app-checkbox [label]="role" (valueChange)="toggle($event)"></app-checkbox>` |
| `app-toggle` | `label`/`ariaLabel`, `(valueChange)`; `role="switch"` | `<app-toggle formControlName="isFavorite" [ariaLabel]="..."></app-toggle>` |
| `app-segmented-control` | `options` (`{value, label, icon?}`), `value`, `variant` (`pill`/`underline`), `ariaLabel`, `(selected)`; indicador desliza | `<app-segmented-control [options]="tabs" [value]="tab" (selected)="selectTab($event)"></app-segmented-control>` |
| `app-field-group` | `label`, `required`, `hint`, `errorMessage`, `labelId`; `role="group"` para grupo de controles | `<app-field-group [label]="'media.rating' \| translate"><app-rating-stars ...></app-rating-stars></app-field-group>` |
| `app-rating-stars` | `value`, `readonly`, `size`, `ariaLabel`, `(valueChange)` | `<app-rating-stars [value]="r" [readonly]="true"></app-rating-stars>` |
| `app-emoji-picker` | `selected`, `ariaLabelledby`, `(selectedChange)`; emoji é dado do usuário | `<app-emoji-picker [selected]="feelings" (selectedChange)="..."></app-emoji-picker>` |
| `app-search-input` | `placeholder`, `ariaLabel`, `(searchChange)` (debounce 350 ms); `clear()` | `<app-search-input (searchChange)="onSearch($event)"></app-search-input>` |
| `app-filter-dropdown` | `activeCount`, `(applied)`, `(cleared)`; filtros projetados | `<app-filter-dropdown [activeCount]="n" (applied)="apply()" (cleared)="clear()">...</app-filter-dropdown>` |
| `app-password-requirements` | `value` | `<app-password-requirements [value]="pwd"></app-password-requirements>` |

### Estrutura e navegação

| Componente | Props principais | Exemplo |
|---|---|---|
| `app-page-header` | `title` (único `<h1>`), `subtitle`, `backLink`; ações em `[headerActions]` | `<app-page-header [title]="..."><app-btn headerActions ...></app-btn></app-page-header>` |
| `app-card` | `padding` (`none`/`sm`/`md`/`lg`), `interactive`, `clip`, `tone` (`default`/`danger`) | `<app-card padding="sm" [interactive]="true">...</app-card>` |
| `app-section` | `title`, `subtitle`; ações em `[sectionActions]` | `<app-section [title]="...">...</app-section>` |
| `app-modal` | `open`, `title`, `ariaLabel`, `size` (`sm`–`xl`), `hasFooter` (`[modalFooter]`), `closeOnBackdrop`, `canClose` (`boolean` ou `Observable<boolean>`), `(closed)`; métodos `close()` | `<app-modal [open]="open" [title]="..." [hasFooter]="true" (closed)="open = false">...</app-modal>` |
| `ModalService` | `open(Component, inputs) → ModalRef` (`closed`, `close(result)`), `closeAll()` | `this.modal.open(AdminUserFormModalComponent, {roles}).closed.subscribe(...)` |
| `app-confirmation-dialog` | aberto pelo `ConfirmationDialogService.confirm(target, {title, description, confirmLabel})` | `this.confirm.confirm(item.title).subscribe(ok => ...)` |
| `app-bottom-nav-item` | `link`, `icon`, `label`, `exact`, `expanded`, `(activated)` | `<app-bottom-nav-item link="/media" icon="layer-group" [label]="..."></app-bottom-nav-item>` |
| `app-sheet-tile` | `icon`, `label`, `link`, `tone` (`primary`/`danger`), `(activated)` | `<app-sheet-tile link="/top10" icon="star" [label]="..."></app-sheet-tile>` |
| `app-brand-mark` | `size` (`sm`/`md`/`lg`) | `<app-brand-mark size="lg"></app-brand-mark>` |
| `app-theme-toggle` | `tone` (`default`/`sidebar`) | `<app-theme-toggle tone="sidebar"></app-theme-toggle>` |
| `app-step-dots` | `count`, `current`, `ariaLabel`, `(currentChange)` | `<app-step-dots [count]="5" [current]="i" (currentChange)="i = $event"></app-step-dots>` |
| `app-story-progress` | `count`, `index` (a partir de 0); só indicação visual, `aria-hidden`: quem anuncia "tela 3 de 8" é a tela | `<app-story-progress [count]="slides.length" [index]="index"></app-story-progress>` |
| `app-pagination` | `pageNumber` (1-based), `totalPages`, `(pageChanged)`; some com 1 página | `<app-pagination [pageNumber]="p + 1" [totalPages]="n" (pageChanged)="go($event - 1)"></app-pagination>` |

### Dados e estados

| Componente | Props principais | Exemplo |
|---|---|---|
| `app-table` | `ariaLabel`, `fill`, `empty`, `emptyIcon`, `emptyTitle`, `emptyDescription` | `<app-table [ariaLabel]="..."><thead>...</thead><tbody>...</tbody></app-table>` |
| `app-skeleton` | `variant` (`text`, `title`, `chip`, `circle`, `bar`...), `lines`, `size`; mesma forma do conteúdo | `<app-skeleton variant="bar"></app-skeleton>` |
| `app-empty-state` | `pose` (`empty`, `search`, `error`, `celebrate`, `neutral`), `mascot` (padrão `true`), `icon` (sem mascote), `title`, `description`, `compact`; ações projetadas | `<app-empty-state pose="search" [title]="..."><app-btn ...>Limpar filtros</app-btn></app-empty-state>` |
| `app-load-error` | `compact`, `mascot`, `(retry)`; nunca é estado vazio | `<app-load-error (retry)="load()"></app-load-error>` |
| `app-alert` | `variant` (`error`, `success`, `warning`, `info`), `title`; erro é `role="alert"` | `<app-alert *ngIf="invalidLogin">{{ 'auth.invalidCredentials' \| translate }}</app-alert>` |
| `app-stat-card` | `icon`, `value` (número conta com `appCountUp`), `label`, `prefix`, `tone` (`brand`/`success`/`warning`), `delta`, `deltaTone` | `<app-stat-card icon="users" [value]="total" [label]="..."></app-stat-card>` |
| `app-count-badge` | `count` (some com 0, "9+" acima de 9; troca com `tick-in`) | `<app-count-badge [count]="unread"></app-count-badge>` |
| `app-badge` | `tone` (`neutral`, `primary`, `success`, `warning`, `danger`), `variant` (`soft`/`solid`), `icon` | `<app-badge tone="primary" icon="forward-step">Próximo</app-badge>` |
| `app-status-chip` / `app-recommendation-chip` | `name` / `value`; mapa semântico de `tone.ts` | `<app-status-chip [name]="m.status.name"></app-status-chip>` |
| `app-avatar-placeholder` | `name`, `pictureUrl`, `size`, `ring` | `<app-avatar-placeholder [name]="u.username" size="avatar-sm"></app-avatar-placeholder>` |
| `app-spinner` | `size`, `tone`, `ariaLabel`; só dentro de controle | `<app-spinner size="sm"></app-spinner>` |
| `[appCountUp]` | `value`, `countUpPrefix`, `countUpSuffix`; só quantidade, nunca ordinal | `<p class="tabular-nums" [appCountUp]="n"></p>` |
| `app-icon` | `name` (mapa fechado), `size` (`2xs`–`3xl`), `spin`; sempre `aria-hidden` | `<app-icon name="calendar-days" size="sm"></app-icon>` |
| `app-mascot` | `pose` (`wave`, `empty`, `error`, `celebrate`, `search`), `size`, `headOnly`, `label`, `alive` (padrão `true`) | `<app-mascot pose="wave" [size]="112"></app-mascot>`; vivo pelo `mascot-life.ts` (pisca, dorme no vazio, susto no erro, para após ~30 s parado); `[alive]="false"` desliga |

O mascote vem de `brand/mascot/` (ver `brand/mascot/README.md`); `mascot-art.generated.ts` é gerado, não se edita à mão.
