import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgClass} from '@angular/common';

export type SpinnerSize = 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-4',
};

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [':host { display: inline-flex; }'],
  // `border-current` + `border-r-transparent` desenha o arco com a cor do texto;
  // `inherit` deixa o spinner assumir a cor do pai (ex.: dentro de um botão).
  template: `
    <span
      role="status"
      [attr.aria-label]="ariaLabel"
      class="inline-block rounded-full border-current border-r-transparent animate-spin"
      [ngClass]="[sizeClass, tone === 'primary' ? 'text-primary-600 dark:text-primary-400' : '']"
    ></span>
  `,
})
export class SpinnerComponent {
  @Input() size: SpinnerSize = 'md';
  @Input() tone: 'primary' | 'inherit' = 'primary';
  @Input() ariaLabel = 'Carregando';

  get sizeClass(): string {
    return SIZE_CLASSES[this.size];
  }
}
