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
  ViewChild,
  inject,
} from '@angular/core';
import {NgClass, NgFor, NgIf} from '@angular/common';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {TranslatePipe} from '../../../pipes/translate.pipe';

export interface SelectOption {
  value: any;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, TranslatePipe],
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
    <label *ngIf="label" class="ios-label" [id]="labelId" [attr.for]="null">
      {{ label }}<span *ngIf="required" class="text-danger-500">&nbsp;*</span>
    </label>

    <button
      #trigger
      type="button"
      class="w-full flex items-center gap-2 bg-surface-sunken border rounded-control px-4 py-3 text-sm
             transition-[box-shadow,border-color] duration-base ease-inout cursor-pointer text-left
             disabled:opacity-40 disabled:cursor-not-allowed"
      [ngClass]="[
        showError ? 'border-danger-400' : (open ? 'border-primary-400 ring-2 ring-primary-400/20' : 'border-hairline hover:border-hairline-strong')
      ]"
      [disabled]="disabled"
      (click)="toggle()"
      (keydown)="onTriggerKeydown($event)"
      [attr.aria-expanded]="open"
      [attr.aria-controls]="listboxId"
      [attr.aria-labelledby]="label ? labelId : null"
      [attr.aria-label]="label ? null : ariaLabel || null"
      [attr.aria-invalid]="showError"
      [attr.aria-describedby]="describedBy"
      [attr.aria-activedescendant]="open && activeIndex >= 0 ? optionId(activeIndex) : null"
      aria-haspopup="listbox"
    >
      <i *ngIf="selectedOption?.icon" [class]="selectedOption!.icon + ' text-xs text-ink-subtle'" aria-hidden="true"></i>
      <span class="flex-1 truncate" [ngClass]="selectedOption ? 'text-ink' : 'text-ink-subtle'">
        {{ selectedOption ? selectedOption.label : (placeholder || ('ui.selectPlaceholder' | translate)) }}
      </span>
      <i class="fa-solid fa-chevron-down text-2xs text-ink-subtle transition-transform duration-base ease-inout flex-shrink-0"
         [class.rotate-180]="open" aria-hidden="true"></i>
    </button>

    <div
      *ngIf="open"
      #listbox
      class="absolute z-50 mt-1 w-full bg-surface-raised border border-hairline rounded-control shadow-lg
             max-h-64 overflow-y-auto p-1 animate-scale-in"
      role="listbox"
      [id]="listboxId"
      [attr.aria-labelledby]="label ? labelId : null"
    >
      <div
        *ngFor="let option of options; let i = index"
        role="option"
        [id]="optionId(i)"
        [attr.aria-selected]="isSelected(option)"
        class="w-full flex items-center gap-2 px-3 py-2 rounded-chip text-sm text-left cursor-pointer
               transition-colors duration-fast ease-inout"
        [ngClass]="isSelected(option)
          ? 'bg-primary-50 dark:bg-primary-500/15 text-primary-700 dark:text-primary-300 font-semibold'
          : (i === activeIndex ? 'bg-surface-sunken text-ink' : 'text-ink-muted')"
        (click)="choose(option)"
        (mouseenter)="activeIndex = i"
      >
        <i *ngIf="option.icon" [class]="option.icon + ' text-xs'" aria-hidden="true"></i>
        <span class="flex-1 truncate">{{ option.label }}</span>
        <i *ngIf="isSelected(option)" class="fa-solid fa-check text-2xs" aria-hidden="true"></i>
      </div>

      <p *ngIf="options.length === 0" class="px-3 py-2 text-sm text-ink-subtle">
        {{ emptyLabel || ('ui.noOptions' | translate) }}
      </p>
    </div>

    <p *ngIf="showError && errorMessage" [id]="errorId" class="error-message" role="alert">
      <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>{{ errorMessage }}
    </p>
    <p *ngIf="hint && !(showError && errorMessage)" [id]="hintId" class="ios-hint">{{ hint }}</p>
  `,
})
export class SelectComponent implements ControlValueAccessor {
  private static nextId = 0;

  @Input() options: SelectOption[] = [];
  /** Vazio cai no placeholder traduzido padrão. */
  @Input() placeholder = '';
  @Input() emptyLabel = '';
  @Input() invalid = false;
  /** Rótulo próprio do campo — dispensa `<label>` solto no template da página. */
  @Input() label = '';
  @Input() required = false;
  @Input() errorMessage = '';
  @Input() hint = '';
  @Input() ariaLabel = '';
  @Output() valueChange = new EventEmitter<any>();

  @ViewChild('trigger') private triggerEl?: ElementRef<HTMLButtonElement>;
  @ViewChild('listbox') private listboxEl?: ElementRef<HTMLElement>;

  readonly uid = SelectComponent.nextId++;
  readonly labelId = `app-select-${this.uid}-label`;
  readonly listboxId = `app-select-${this.uid}-listbox`;
  readonly errorId = `app-select-${this.uid}-error`;
  readonly hintId = `app-select-${this.uid}-hint`;

  open = false;
  value: any = null;
  disabled = false;
  activeIndex = -1;

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly cdr = inject(ChangeDetectorRef);

  private typeahead = '';
  private typeaheadTimer?: ReturnType<typeof setTimeout>;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  get selectedOption(): SelectOption | undefined {
    return this.options.find(o => this.sameValue(o.value, this.value));
  }

  get showError(): boolean {
    return this.invalid;
  }

  get describedBy(): string | null {
    if (this.showError && this.errorMessage) return this.errorId;
    if (this.hint) return this.hintId;
    return null;
  }

  optionId(index: number): string {
    return `app-select-${this.uid}-option-${index}`;
  }

  isSelected(option: SelectOption): boolean {
    return this.sameValue(option.value, this.value);
  }

  toggle(): void {
    if (this.disabled) return;
    this.open ? this.close() : this.openPanel();
  }

  choose(option: SelectOption): void {
    this.value = option.value;
    this.onChange(option.value);
    this.onTouched();
    this.valueChange.emit(option.value);
    this.close();
  }

  // Teclado de listbox: setas, Home/End, Enter/Espaço, Esc e busca por letra.
  onTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled) return;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        if (!this.open) {
          this.openPanel();
          return;
        }
        this.moveActive(event.key === 'ArrowDown' ? 1 : -1);
        return;
      }
      case 'Home':
      case 'End': {
        if (!this.open) return;
        event.preventDefault();
        this.setActive(event.key === 'Home' ? 0 : this.options.length - 1);
        return;
      }
      case 'Enter':
      case ' ': {
        event.preventDefault();
        if (!this.open) {
          this.openPanel();
          return;
        }
        const option = this.options[this.activeIndex];
        if (option) this.choose(option);
        return;
      }
      case 'Escape': {
        if (!this.open) return;
        event.preventDefault();
        this.close();
        return;
      }
      case 'Tab': {
        if (this.open) this.close(false);
        return;
      }
      default: {
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          this.onTypeahead(event.key);
        }
      }
    }
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
      this.close(false);
    }
  }

  private openPanel(): void {
    this.open = true;
    const selected = this.options.findIndex(o => this.isSelected(o));
    this.activeIndex = selected >= 0 ? selected : (this.options.length ? 0 : -1);
    this.cdr.markForCheck();
    // O painel só existe depois do próximo ciclo de render.
    setTimeout(() => this.scrollActiveIntoView());
  }

  private close(restoreFocus = true): void {
    if (!this.open) return;
    this.open = false;
    this.activeIndex = -1;
    this.onTouched();
    this.cdr.markForCheck();
    if (restoreFocus) this.triggerEl?.nativeElement.focus();
  }

  private moveActive(delta: number): void {
    if (!this.options.length) return;
    const total = this.options.length;
    const next = (this.activeIndex + delta + total) % total;
    this.setActive(next);
  }

  private setActive(index: number): void {
    if (!this.options.length) return;
    this.activeIndex = Math.max(0, Math.min(index, this.options.length - 1));
    this.cdr.markForCheck();
    this.scrollActiveIntoView();
  }

  private scrollActiveIntoView(): void {
    const panel = this.listboxEl?.nativeElement;
    if (!panel || this.activeIndex < 0) return;
    const el = panel.querySelector<HTMLElement>(`#${this.optionId(this.activeIndex)}`);
    el?.scrollIntoView({block: 'nearest'});
  }

  private onTypeahead(char: string): void {
    this.typeahead += char.toLowerCase();
    clearTimeout(this.typeaheadTimer);
    this.typeaheadTimer = setTimeout(() => (this.typeahead = ''), 600);

    const match = this.options.findIndex(o => o.label.toLowerCase().startsWith(this.typeahead));
    if (match < 0) return;
    if (!this.open) this.openPanel();
    this.setActive(match);
  }

  // `null` e `undefined` são o mesmo "sem seleção" para efeito de comparação —
  // os filtros usam `undefined` e os formulários reativos usam `null`.
  private sameValue(a: any, b: any): boolean {
    if (a == null && b == null) return true;
    return a === b;
  }
}
