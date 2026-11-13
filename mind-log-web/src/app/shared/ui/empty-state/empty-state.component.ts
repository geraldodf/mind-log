import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgIf} from '@angular/common';

/** Situação que o estado vazio comunica; vira a pose do mascote. */
export type EmptyStatePose = 'neutral' | 'empty' | 'search' | 'error' | 'celebrate';

const POSE_ICONS: Record<EmptyStatePose, string> = {
  neutral: 'fa-solid fa-hand',
  empty: 'fa-solid fa-inbox',
  search: 'fa-solid fa-magnifying-glass',
  error: 'fa-solid fa-plug-circle-xmark',
  celebrate: 'fa-solid fa-champagne-glasses',
};

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center text-center"
         [class.py-16]="!compact" [class.py-8]="compact"
         [attr.role]="pose === 'error' ? 'alert' : null">
      <div class="w-14 h-14 rounded-full bg-grad-brand-soft flex items-center justify-center mb-4">
        <i [class]="iconClass + ' text-2xl text-primary-700 dark:text-primary-300'" aria-hidden="true"></i>
      </div>
      <h3 class="font-display text-lg font-semibold text-ink mb-1">{{ title }}</h3>
      <p *ngIf="description" class="text-sm text-ink-muted max-w-sm mb-4">{{ description }}</p>
      <ng-content></ng-content>
    </div>
  `,
})
export class EmptyStateComponent {
  /** Primeiro uso vazio (`empty`), busca sem resultado (`search`), falha de carga (`error`). */
  @Input() pose: EmptyStatePose = 'empty';
  /** Ícone específico do contexto; sem ele, vale o ícone da pose. */
  @Input() icon?: string;
  @Input() title = '';
  @Input() description?: string;
  /** Versão baixa, para dentro de card ou seção. */
  @Input() compact = false;

  get iconClass(): string {
    return this.icon || POSE_ICONS[this.pose];
  }
}
