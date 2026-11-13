import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {IconComponent} from '../icon/icon.component';

/**
 * Rótulo de um grupo de controles que não é um campo só (estrelas, chips,
 * caixas de seleção). Usa `role="group"` ligado ao rótulo, em vez de um
 * `<label>` solto que não aponta para controle nenhum.
 */
@Component({
  selector: 'app-field-group',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div role="group" [attr.aria-labelledby]="labelId" [attr.aria-describedby]="describedBy">
      <p class="ios-label" [id]="labelId">
        {{ label }}@if (required) {<span class="text-danger-700 dark:text-danger-400" aria-hidden="true"> *</span>}
      </p>
      <ng-content></ng-content>
      @if (hint && !errorMessage) {
        <span class="ios-hint" [id]="labelId + '-hint'">{{ hint }}</span>
      }
      @if (errorMessage) {
        <p class="error-message" [id]="labelId + '-error'" role="alert">
          <app-icon name="circle-exclamation"></app-icon>{{ errorMessage }}
        </p>
      }
    </div>
  `,
})
export class FieldGroupComponent {
  private static nextId = 0;

  @Input({required: true}) label = '';
  @Input() required = false;
  @Input() hint?: string;
  @Input() errorMessage = '';
  /** Id do rótulo; quem precisa apontar para o grupo de fora pode fixá-lo. */
  @Input() labelId = `app-field-group-${FieldGroupComponent.nextId++}`;

  get describedBy(): string | null {
    if (this.errorMessage) return this.labelId + '-error';
    return this.hint ? this.labelId + '-hint' : null;
  }
}
