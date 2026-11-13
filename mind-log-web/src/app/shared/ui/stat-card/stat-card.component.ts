import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgClass, NgIf} from '@angular/common';
import {CardComponent} from '../card/card.component';
import {CountUpDirective} from '../count-up/count-up.directive';
import {IconComponent, IconName} from '../icon/icon.component';

export type StatCardTone = 'brand' | 'success' | 'warning';

const TONE_BOX: Record<StatCardTone, string> = {
  brand: 'bg-grad-brand-soft',
  success: 'bg-success-100 dark:bg-success-500/15',
  warning: 'bg-warning-100 dark:bg-warning-500/15',
};
const TONE_ICON: Record<StatCardTone, string> = {
  brand: 'text-primary-700 dark:text-primary-300',
  success: 'text-success-700 dark:text-success-400',
  warning: 'text-warning-700 dark:text-warning-400',
};

const DELTA_TONE_CLASSES: Record<'positive' | 'negative' | 'neutral', string> = {
  positive: 'text-success-700 dark:text-success-400',
  negative: 'text-danger-700 dark:text-danger-400',
  neutral: 'text-ink-subtle',
};

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [IconComponent, NgClass, NgIf, CardComponent, CountUpDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // `height: 100%` aqui anularia o `align-items: stretch` do grid (a
  // porcentagem não resolve contra uma linha de altura automática).
  styles: [':host { display: block; }'],
  template: `
    <app-card class="h-full" padding="sm">
      <div class="flex items-center gap-4 min-h-14">
        <div class="w-12 h-12 rounded-control flex items-center justify-center flex-shrink-0" [ngClass]="boxClass">
          <app-icon [name]="icon" size="lg" [ngClass]="iconClass"></app-icon>
        </div>
        <div class="min-w-0">
          <!-- Valor numérico conta; valor em texto é só escrito. As duas saídas
               são exclusivas porque a diretiva escreve o textContent e uma
               interpolação no mesmo elemento brigaria com ela.
               Sem acento grave neste comentário: o template é template literal. -->
          <p *ngIf="isNumeric" class="font-display text-2xl font-bold text-ink tabular-nums leading-tight"
             [appCountUp]="value" [countUpPrefix]="prefix"></p>
          <p *ngIf="!isNumeric" class="font-display text-2xl font-bold text-ink tabular-nums leading-tight">{{ value }}</p>
          <p class="text-xs text-ink-subtle uppercase tracking-wide truncate">{{ label }}</p>
        </div>
      </div>
      <p *ngIf="delta" class="mt-3 text-xs font-medium" [ngClass]="deltaClass">{{ delta }}</p>
    </app-card>
  `,
})
export class StatCardComponent {
  @Input() icon: IconName = 'chart-simple';
  @Input() value: string | number = '';
  @Input() label = '';
  /** Antes do número (ex.: "+" em "novos hoje"). */
  @Input() prefix = '';
  @Input() tone: StatCardTone = 'brand';
  @Input() delta?: string;
  @Input() deltaTone: 'positive' | 'negative' | 'neutral' = 'neutral';

  get boxClass(): string {
    return TONE_BOX[this.tone];
  }

  get iconClass(): string {
    return TONE_ICON[this.tone];
  }

  get deltaClass(): string {
    return DELTA_TONE_CLASSES[this.deltaTone];
  }

  get isNumeric(): boolean {
    return this.value !== '' && this.value !== null && Number.isFinite(Number(this.value));
  }
}
