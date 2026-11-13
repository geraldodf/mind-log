import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgClass} from '@angular/common';
import {RouterLink} from '@angular/router';
import {IconComponent, IconName} from '../icon/icon.component';

export type TextLinkSize = 'xs' | 'sm' | 'base';

const SIZE_CLASSES: Record<TextLinkSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
};

/**
 * Link de texto, sem corpo de botão ("Ver todos", "Criar conta"). Cor pelo
 * token `link`, que passa de 4,5:1 nos dois temas. Seta e afins são ícone,
 * nunca caractere solto no texto.
 */
@Component({
  selector: 'app-text-link',
  standalone: true,
  imports: [NgClass, RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [':host { display: inline-flex; }'],
  template: `
    <a [routerLink]="link"
       class="inline-flex items-center gap-1 font-semibold text-link hover:text-link-hover no-underline rounded-chip
              transition-[color] duration-fast ease-inout"
       [ngClass]="sizeClass">
      <ng-content></ng-content>
      @if (icon) {
        <app-icon [name]="icon" size="2xs" class="transition-transform duration-fast ease-inout"></app-icon>
      }
    </a>
  `,
})
export class TextLinkComponent {
  @Input({required: true}) link!: string | any[];
  @Input() size: TextLinkSize = 'sm';
  /** Ícone depois do texto (ex.: `arrow-right` em "Ver todos"). */
  @Input() icon?: IconName;

  get sizeClass(): string {
    return SIZE_CLASSES[this.size];
  }
}
