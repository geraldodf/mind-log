import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {NgClass, NgFor} from '@angular/common';

@Component({
  selector: 'app-rating-stars',
  standalone: true,
  imports: [NgFor, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="inline-flex items-center gap-1" [attr.aria-label]="'Avaliação: ' + value + ' de 5'">
      <button
        *ngFor="let star of stars"
        type="button"
        class="p-0.5 leading-none bg-transparent border-none transition-transform duration-150"
        [ngClass]="readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'"
        [disabled]="readonly"
        [attr.aria-label]="star + ' de 5'"
        (click)="select(star)"
        (mouseenter)="hover(star)"
        (mouseleave)="hover(0)"
      >
        <!-- fa-star precisa estar SEMPRE presente: é o nome do glifo. O que
             alterna entre cheia e vazia é fa-solid / fa-regular. -->
        <i
          class="fa-star"
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
}
