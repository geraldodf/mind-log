import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {EmptyStateComponent} from '../empty-state/empty-state.component';
import {BtnComponent} from '../btn/btn.component';
import {TranslatePipe} from '../../../pipes/translate.pipe';

/**
 * Falha de carga. Nunca é estado vazio: diz que a busca falhou e oferece
 * nova tentativa, para ninguém achar que os próprios dados sumiram.
 */
@Component({
  selector: 'app-load-error',
  standalone: true,
  imports: [EmptyStateComponent, BtnComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-empty-state pose="error" [compact]="compact"
                     [title]="'state.loadErrorTitle' | translate"
                     [description]="'state.loadErrorText' | translate">
      <app-btn variant="secondary" icon="fa-solid fa-rotate-right" (click)="retry.emit()">
        {{ 'common.tryAgain' | translate }}
      </app-btn>
    </app-empty-state>
  `,
})
export class LoadErrorComponent {
  @Input() compact = false;
  @Output() retry = new EventEmitter<void>();
}
