import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgIf} from '@angular/common';
import {EmptyStateComponent} from '../empty-state/empty-state.component';

// Casca do `.ios-table` (styles.scss). A altura fixa de linha (68px) e os
// paddings das células vêm de lá — não redefina aqui. O consumidor projeta o
// `<thead>` e o `<tbody>` inteiros; com `empty` a tabela é trocada pelo estado vazio.
@Component({
  selector: 'app-table',
  standalone: true,
  imports: [NgIf, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    ':host { display: block; min-width: 0; }',
    // `fill`: a tabela ocupa a altura do pai flex e rola por dentro, o que
    // mantém o `thead` sticky preso ao próprio contêiner de rolagem.
    ':host(.is-fill) { display: flex; flex-direction: column; flex: 1 1 0%; min-height: 0; }',
    // O `h-full` das telas só limita a altura se TODOS os ancestrais tiverem
    // altura definida — como não têm, o contêiner crescia junto com as linhas,
    // quem rolava era a página e o `thead` sticky subia junto até sumir.
    // O teto em viewport garante que a rolagem aconteça dentro do contêiner.
    ':host(.is-fill) .table-scroll { max-height: calc(100vh - 14rem); }',
  ],
  host: {'[class.is-fill]': 'fill'},
  template: `
    <div *ngIf="!empty" class="table-scroll" [class.flex-1]="fill" [class.min-h-0]="fill">
      <table class="ios-table">
        <ng-content select="thead"></ng-content>
        <ng-content select="tbody"></ng-content>
      </table>
    </div>
    <app-empty-state *ngIf="empty" [icon]="emptyIcon" [title]="emptyTitle" [description]="emptyDescription">
      <ng-content select="[tableEmpty]"></ng-content>
    </app-empty-state>
  `,
})
export class TableComponent {
  @Input() empty = false;
  @Input() fill = false;
  @Input() emptyIcon = 'fa-solid fa-inbox';
  @Input() emptyTitle = '';
  @Input() emptyDescription?: string;
}
