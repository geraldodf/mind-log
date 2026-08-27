import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgClass, NgIf} from '@angular/common';
import {CardComponent} from '../card/card.component';

const DELTA_TONE_CLASSES: Record<'positive' | 'negative' | 'neutral', string> = {
  positive: 'text-success-600 dark:text-success-400',
  negative: 'text-danger-600 dark:text-danger-400',
  neutral: 'text-ink-subtle',
};

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [NgClass, NgIf, CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // `height: 100%` aqui anularia o `align-items: stretch` do grid (a
  // porcentagem não resolve contra uma linha de altura automática).
  styles: [':host { display: block; }'],
  template: `
    <app-card class="h-full" padding="sm">
      <div class="flex items-center gap-4 min-h-[56px]">
        <div class="w-12 h-12 rounded-control bg-grad-brand-soft flex items-center justify-center flex-shrink-0">
          <i [class]="icon + ' text-lg text-primary-600 dark:text-primary-300'"></i>
        </div>
        <div class="min-w-0">
          <p class="font-display text-2xl font-bold text-ink tabular-nums leading-tight">{{ value }}</p>
          <p class="text-xs text-ink-subtle uppercase tracking-wide truncate">{{ label }}</p>
        </div>
      </div>
      <p *ngIf="delta" class="mt-3 text-xs font-medium" [ngClass]="deltaClass">{{ delta }}</p>
    </app-card>
  `,
})
export class StatCardComponent {
  @Input() icon = 'fa-solid fa-chart-simple';
  @Input() value: string | number = '';
  @Input() label = '';
  @Input() delta?: string;
  @Input() deltaTone: 'positive' | 'negative' | 'neutral' = 'neutral';

  get deltaClass(): string {
    return DELTA_TONE_CLASSES[this.deltaTone];
  }
}
