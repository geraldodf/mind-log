import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgClass, NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault} from '@angular/common';

export type SkeletonVariant = 'text' | 'title' | 'chip' | 'bar' | 'circle' | 'block';
export type SkeletonSize = 'sm' | 'md' | 'lg';

const CIRCLE_SIZES: Record<SkeletonSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
};

const BLOCK_SIZES: Record<SkeletonSize, string> = {
  sm: 'h-16',
  md: 'h-32',
  lg: 'h-48',
};

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [NgSwitch, NgSwitchCase, NgSwitchDefault, NgFor, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // `aria-hidden`: o esqueleto é forma, não conteúdo. Quem anuncia o
  // carregamento é a região viva da página, não dezenas de divs vazias.
  host: {'aria-hidden': 'true'},
  template: `
    <ng-container [ngSwitch]="variant">
      <div *ngSwitchCase="'text'" class="flex flex-col gap-2">
        <!-- Última linha mais curta: parágrafo real não termina na margem. -->
        <div *ngFor="let l of lineArray; let last = last"
             class="skeleton-row"
             [ngClass]="last && lines > 1 ? 'w-8/12' : 'w-full'"></div>
      </div>

      <div *ngSwitchCase="'title'" class="skeleton-row h-4 w-7/12"></div>

      <div *ngSwitchCase="'chip'" class="skeleton rounded-chip h-5 w-20"></div>

      <!-- A barra ocupa a largura que o pai der: serve para botão em linha. -->
      <div *ngSwitchCase="'bar'" class="skeleton rounded-chip h-8 w-full"></div>

      <div *ngSwitchCase="'circle'" class="skeleton rounded-full" [ngClass]="circleClass"></div>

      <div *ngSwitchDefault class="skeleton rounded-card w-full" [ngClass]="blockClass"></div>
    </ng-container>
  `,
})
export class SkeletonComponent {
  @Input() variant: SkeletonVariant = 'text';
  @Input() lines = 1;
  @Input() size: SkeletonSize = 'md';

  get lineArray(): number[] {
    return Array.from({length: Math.max(1, this.lines)});
  }

  get circleClass(): string {
    return CIRCLE_SIZES[this.size];
  }

  get blockClass(): string {
    return BLOCK_SIZES[this.size];
  }
}
