import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {NgClass, NgFor, NgIf} from '@angular/common';
import {TranslatePipe} from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-rating-stars',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Só leitura não é um controle: cinco botões desabilitados poluem a
         navegação por teclado e o leitor de tela. Vira uma imagem com rótulo. -->
    <div *ngIf="readonly"
         class="inline-flex items-center gap-1"
         role="img"
         [attr.aria-label]="(ariaLabel || ('ui.rating' | translate)) + ': ' + value + '/5'">
      <i *ngFor="let star of stars"
         class="fa-star"
         aria-hidden="true"
         [ngClass]="[star <= value ? 'fa-solid text-warning-400' : 'fa-regular text-ink-subtle', sizeClass]"></i>
    </div>

    <div *ngIf="!readonly"
         class="inline-flex items-center gap-1"
         role="radiogroup"
         [attr.aria-label]="ariaLabel || ('ui.rating' | translate)">
      <button
        *ngFor="let star of stars"
        type="button"
        role="radio"
        [attr.aria-checked]="star === value"
        class="w-8 h-8 inline-flex items-center justify-center leading-none bg-transparent border-none
               rounded-full cursor-pointer transition-transform duration-fast ease-inout motion-safe:hover:scale-110
               icon-btn-touch"
        [attr.aria-label]="('ui.rating' | translate) + ' ' + star + '/5'"
        (click)="select(star)"
        (keydown)="onKeydown($event, star)"
        (mouseenter)="hover(star)"
        (mouseleave)="hover(0)"
      >
        <!-- fa-star precisa estar SEMPRE presente: é o nome do glifo. O que
             alterna entre cheia e vazia é fa-solid / fa-regular. -->
        <i
          class="fa-star"
          aria-hidden="true"
          [ngClass]="[
            star <= displayValue ? 'fa-solid text-warning-400' : 'fa-regular text-ink-subtle',
            sizeClass
          ]"
        ></i>
      </button>
    </div>
  `,
})
export class RatingStarsComponent {
  @Input() value = 0;
  @Input() readonly = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() ariaLabel = '';
  @Output() valueChange = new EventEmitter<number>();

  readonly stars = [1, 2, 3, 4, 5];

  private hovered = 0;

  private readonly sizeMap: Record<string, string> = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  get sizeClass(): string {
    return this.sizeMap[this.size] ?? this.sizeMap['md'];
  }

  /** Durante o hover mostra a prévia da nota sob o cursor. */
  get displayValue(): number {
    return this.hovered || this.value;
  }

  hover(star: number): void {
    if (this.readonly) return;
    this.hovered = star;
  }

  select(star: number): void {
    if (this.readonly) return;
    // Clicar na estrela já selecionada limpa a nota.
    const next = this.value === star ? 0 : star;
    this.value = next;
    this.valueChange.emit(next);
  }

  // Setas dão nota sem precisar tabular estrela por estrela; Delete/Backspace limpa.
  onKeydown(event: KeyboardEvent, star: number): void {
    if (this.readonly) return;

    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.apply(Math.min(5, (this.value || star) + 1));
      return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.apply(Math.max(0, (this.value || star) - 1));
      return;
    }
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      this.apply(0);
    }
  }

  private apply(next: number): void {
    this.value = next;
    this.valueChange.emit(next);
  }
}
