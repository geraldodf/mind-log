import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgClass} from '@angular/common';

export type IconBtnVariant = 'neutral' | 'primary' | 'danger';
export type IconBtnSize = 'xs' | 'sm' | 'md' | 'lg';

const VARIANT_CLASSES: Record<IconBtnVariant, string> = {
  neutral: 'text-ink-muted hover:text-ink hover:bg-surface-sunken',
  primary: 'text-primary-400 hover:text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-500/15',
  danger: 'text-danger-500 hover:text-danger-600 hover:bg-danger-50 dark:text-danger-400 dark:hover:text-danger-300 dark:hover:bg-danger-500/10',
};

const SIZE_CLASSES: Record<IconBtnSize, string> = {
  xs: 'w-5 h-5 text-2xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
};

@Component({
  selector: 'app-icon-btn',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // `is-disabled` no host: sem ele o `disabled:pointer-events-none` do <button>
  // faz o clique atingir o host, e o (click) do consumidor dispara desabilitado.
  styles: [':host { display: inline-flex; } :host(.is-fill) { flex: 1 1 0%; } :host(.is-disabled) { pointer-events: none; }'],
  host: {'[class.is-fill]': 'fill', '[class.is-disabled]': 'disabled'},
  template: `
    <button
      [type]="type"
      [disabled]="disabled"
      [attr.aria-label]="ariaLabel || null"
      [attr.title]="ariaLabel || null"
      class="inline-flex items-center justify-center rounded-control border-none bg-transparent cursor-pointer
             transition-all duration-200 active:scale-95
             disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
      [ngClass]="[variantClass, sizeClass]"
    >
      <i [class]="icon"></i>
    </button>
  `,
})
export class IconBtnComponent {
  @Input() icon = '';
  @Input() variant: IconBtnVariant = 'neutral';
  @Input() size: IconBtnSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  /** Ocupa a largura toda do pai flex (ex.: barra de ações de um card). */
  @Input() fill = false;
  /** Obrigatório na prática: o botão não tem texto visível. */
  @Input() ariaLabel = '';

  get variantClass(): string {
    return VARIANT_CLASSES[this.variant];
  }

  get sizeClass(): string {
    const size = SIZE_CLASSES[this.size];
    return this.fill ? size.replace(/\bw-\d+\b/, 'w-full') : size;
  }
}
