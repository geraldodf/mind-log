import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgClass} from '@angular/common';
import {IconComponent, IconName} from '../icon/icon.component';

export type AlertVariant = 'error' | 'success' | 'warning' | 'info';

const VARIANT: Record<AlertVariant, {box: string; icon: IconName; role: 'alert' | 'status'}> = {
  error: {box: 'bg-danger-50 text-danger-700 dark:bg-danger-500/10 dark:text-danger-300', icon: 'circle-exclamation', role: 'alert'},
  success: {box: 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300', icon: 'circle-check', role: 'status'},
  warning: {box: 'bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-300', icon: 'triangle-exclamation', role: 'status'},
  info: {box: 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300', icon: 'circle-exclamation', role: 'status'},
};

/**
 * Mensagem junto da ação que falhou (ou do resultado que importa ler ali
 * mesmo). Erro usa `role="alert"` e é anunciado na hora. Sem conteúdo
 * projetado não deve ser usado: quem decide se aparece é o \`@if\` de fora.
 */
@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [NgClass, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-start gap-2 p-3 rounded-control text-sm animate-fade-in"
         [ngClass]="visual.box" [attr.role]="visual.role">
      <app-icon [name]="visual.icon" class="flex-shrink-0"></app-icon>
      <div class="min-w-0">
        @if (title) {<p class="font-semibold">{{ title }}</p>}
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class AlertComponent {
  @Input() variant: AlertVariant = 'error';
  @Input() title = '';

  get visual() {
    return VARIANT[this.variant];
  }
}
