import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  Input,
  Output,
  inject,
} from '@angular/core';
import {NgClass, NgFor, NgIf} from '@angular/common';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

export interface SelectOption {
  value: any;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [NgFor, NgIf, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [':host { display: block; position: relative; }'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  template: `
    <button
      type="button"
      class="w-full flex items-center gap-2 bg-surface-sunken border rounded-control px-4 py-3 text-sm
             transition-[box-shadow,border-color] duration-200 cursor-pointer text-left
             disabled:opacity-40 disabled:cursor-not-allowed"
      [ngClass]="[
        invalid ? 'border-danger-400' : (open ? 'border-primary-400 ring-2 ring-primary-400/20' : 'border-hairline hover:border-hairline-strong')
      ]"
      [disabled]="disabled"
      (click)="toggle()"
      [attr.aria-expanded]="open"
      aria-haspopup="listbox"
    >
      <i *ngIf="selectedOption?.icon" [class]="selectedOption!.icon + ' text-xs text-ink-subtle'"></i>
      <span class="flex-1 truncate" [ngClass]="selectedOption ? 'text-ink' : 'text-ink-subtle'">
        {{ selectedOption ? selectedOption.label : placeholder }}
      </span>
      <i class="fa-solid fa-chevron-down text-[10px] text-ink-subtle transition-transform duration-200 flex-shrink-0"
         [class.rotate-180]="open"></i>
    </button>

    <div
      *ngIf="open"
      class="absolute z-50 mt-1 w-full bg-surface-raised border border-hairline rounded-control shadow-lg
             max-h-64 overflow-y-auto p-1 animate-scale-in"
      role="listbox"
    >
      <button
        *ngFor="let option of options; let i = index"
        type="button"
        role="option"
        [attr.aria-selected]="isSelected(option)"
        class="w-full flex items-center gap-2 px-3 py-2 rounded-chip text-sm text-left cursor-pointer
               transition-colors duration-150 bg-transparent border-none"
        [ngClass]="isSelected(option)
          ? 'bg-primary-50 dark:bg-primary-500/15 text-primary-700 dark:text-primary-300 font-semibold'
          : 'text-ink-muted hover:bg-surface-sunken hover:text-ink'"
        (click)="choose(option)"
      >
        <i *ngIf="option.icon" [class]="option.icon + ' text-xs'"></i>
        <span class="flex-1 truncate">{{ option.label }}</span>
        <i *ngIf="isSelected(option)" class="fa-solid fa-check text-[10px]"></i>
      </button>

      <p *ngIf="options.length === 0" class="px-3 py-2 text-sm text-ink-subtle">{{ emptyLabel }}</p>
    </div>
  `,
})
export class SelectComponent implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() placeholder = 'Selecione...';
  @Input() emptyLabel = 'Nenhuma opção';
  @Input() invalid = false;
  @Output() valueChange = new EventEmitter<any>();

  open = false;
  value: any = null;
  disabled = false;

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly cdr = inject(ChangeDetectorRef);

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  get selectedOption(): SelectOption | undefined {
    return this.options.find(o => this.sameValue(o.value, this.value));
  }

  isSelected(option: SelectOption): boolean {
    return this.sameValue(option.value, this.value);
  }

  toggle(): void {
    if (this.disabled) return;
    this.open = !this.open;
    if (!this.open) this.onTouched();
  }

  choose(option: SelectOption): void {
    this.value = option.value;
    this.open = false;
    this.onChange(option.value);
    this.onTouched();
    this.valueChange.emit(option.value);
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.open) return;
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open = false;
      this.onTouched();
      this.cdr.markForCheck();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.open) return;
    this.open = false;
    this.cdr.markForCheck();
  }

  // `null` e `undefined` são o mesmo "sem seleção" para efeito de comparação —
  // os filtros usam `undefined` e os formulários reativos usam `null`.
  private sameValue(a: any, b: any): boolean {
    if (a == null && b == null) return true;
    return a === b;
  }
}
