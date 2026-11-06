import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, forwardRef, inject, Input, Output} from '@angular/core';
import {NgClass, NgFor, NgIf} from '@angular/common';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

export interface SegmentedOption {
  value: any;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-segmented-control',
  standalone: true,
  imports: [NgFor, NgIf, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [':host { display: block; min-width: 0; }'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SegmentedControlComponent),
      multi: true,
    },
  ],
  // Rolável na horizontal: no mobile os segmentos não quebram de linha, a
  // barra rola. `flex-shrink-0` em cada botão impede que o texto seja espremido.
  template: `
    <!-- role=group + aria-pressed, e não tablist/tab: não há painel de aba
         associado — o controle filtra uma lista que já está na tela. -->
    <div
      class="flex items-center overflow-x-auto no-scrollbar"
      [ngClass]="variant === 'underline' ? 'gap-1 border-b border-hairline' : 'gap-1 pb-1'"
      role="group"
      [attr.aria-label]="ariaLabel || null"
    >
      <button
        *ngFor="let option of options; let i = index"
        type="button"
        [attr.aria-pressed]="isSelected(option)"
        [disabled]="disabled"
        [attr.data-index]="i"
        class="flex-shrink-0 inline-flex items-center justify-center gap-2 min-h-[44px] text-sm cursor-pointer
               transition-colors duration-base ease-inout disabled:opacity-40 disabled:cursor-not-allowed"
        [ngClass]="variant === 'underline'
          ? [
              'px-4 py-2 bg-transparent border-0 border-b-2 -mb-px',
              isSelected(option)
                ? 'border-primary-500 text-link font-semibold'
                : 'border-transparent text-ink-muted hover:text-ink font-medium'
            ]
          : [
              'px-4 py-2 rounded-control border-none',
              isSelected(option)
                ? 'bg-primary-700 text-ink-invert font-semibold'
                : 'bg-transparent text-ink-muted font-medium hover:bg-surface-sunken'
            ]"
        (click)="choose(option)"
        (keydown)="onKeydown($event, i)"
      >
        <i *ngIf="option.icon" [class]="option.icon + ' text-xs'" aria-hidden="true"></i>
        {{ option.label }}
      </button>
    </div>
  `,
})
export class SegmentedControlComponent implements ControlValueAccessor {
  @Input() options: SegmentedOption[] = [];
  @Input() value: any = null;
  /** `pill` (padrão) para filtros; `underline` para abas de página. */
  @Input() variant: 'pill' | 'underline' = 'pill';
  @Input() ariaLabel = '';
  @Output() selected = new EventEmitter<any>();

  disabled = false;

  private readonly cdr = inject(ChangeDetectorRef);

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  isSelected(option: SegmentedOption): boolean {
    return this.sameValue(option.value, this.value);
  }

  // Setas andam de segmento em segmento sem precisar de Tab a cada um.
  onKeydown(event: KeyboardEvent, index: number): void {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step || this.disabled || !this.options.length) return;

    event.preventDefault();
    const total = this.options.length;
    const next = (index + step + total) % total;
    const host = event.target as HTMLElement;
    const sibling = host.parentElement?.querySelector<HTMLElement>(`[data-index="${next}"]`);
    sibling?.focus();
  }

  choose(option: SegmentedOption): void {
    if (this.disabled || this.isSelected(option)) return;
    this.value = option.value;
    this.onChange(option.value);
    this.onTouched();
    this.selected.emit(option.value);
  }

  writeValue(value: any): void {
    this.value = value;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  // `null` e `undefined` são o mesmo "sem seleção" (ex.: a aba "Todos").
  private sameValue(a: any, b: any): boolean {
    if (a == null && b == null) return true;
    return a === b;
  }
}
