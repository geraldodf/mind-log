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
    <div
      class="flex items-center overflow-x-auto no-scrollbar"
      [ngClass]="variant === 'underline' ? 'gap-1 border-b border-hairline' : 'gap-1 pb-1'"
      role="tablist"
    >
      <button
        *ngFor="let option of options"
        type="button"
        role="tab"
        [attr.aria-selected]="isSelected(option)"
        [disabled]="disabled"
        class="flex-shrink-0 inline-flex items-center gap-2 text-sm cursor-pointer
               transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        [ngClass]="variant === 'underline'
          ? [
              'px-4 py-2.5 bg-transparent border-0 border-b-2 -mb-px',
              isSelected(option)
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-semibold'
                : 'border-transparent text-ink-muted hover:text-ink font-medium'
            ]
          : [
              'px-4 py-2 rounded-control border-none',
              isSelected(option)
                ? 'bg-primary-600 text-ink-invert font-semibold'
                : 'bg-transparent text-ink-muted font-medium hover:bg-surface-sunken'
            ]"
        (click)="choose(option)"
      >
        <i *ngIf="option.icon" [class]="option.icon + ' text-xs'"></i>
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
  @Output() selected = new EventEmitter<any>();

  disabled = false;

  private readonly cdr = inject(ChangeDetectorRef);

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  isSelected(option: SegmentedOption): boolean {
    return this.sameValue(option.value, this.value);
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
