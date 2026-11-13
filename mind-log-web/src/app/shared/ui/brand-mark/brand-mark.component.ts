import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgClass} from '@angular/common';

export type BrandMarkSize = 'sm' | 'md' | 'lg';

const BOX: Record<BrandMarkSize, string> = {
  sm: 'w-7 h-7 rounded-control',
  md: 'w-8 h-8 rounded-control',
  lg: 'w-16 h-16 rounded-card shadow-md',
};
const GLYPH: Record<BrandMarkSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-8 h-8',
};

/**
 * Logo do MindLog: o nó (a mente) com as três linhas de registro, sobre o
 * gradiente da marca. Mesmo desenho do `favicon.svg`. Decorativo: o nome
 * "MindLog" vem sempre em texto ao lado.
 */
@Component({
  selector: 'app-brand-mark',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [':host { display: inline-flex; flex-shrink: 0; }'],
  template: `
    <span class="bg-grad-brand flex items-center justify-center text-ink-invert shadow-sm" [ngClass]="box">
      <svg viewBox="0 0 64 64" [ngClass]="glyph" fill="none" stroke="currentColor" stroke-linecap="round"
           stroke-linejoin="round" aria-hidden="true">
        <circle cx="22" cy="32" r="8.5" stroke-width="5"/>
        <circle cx="22" cy="32" r="2.5" fill="currentColor" stroke="none"/>
        <path d="M35 24h14M35 32h11M35 40h14" stroke-width="5"/>
      </svg>
    </span>
  `,
})
export class BrandMarkComponent {
  @Input() size: BrandMarkSize = 'md';

  get box(): string {
    return BOX[this.size];
  }

  get glyph(): string {
    return GLYPH[this.size];
  }
}
