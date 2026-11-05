import {ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, inject, Input} from '@angular/core';
import {NgIf} from '@angular/common';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {IconBtnComponent} from '../icon-btn/icon-btn.component';
import {SpinnerComponent} from '../spinner/spinner.component';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [NgIf, IconBtnComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="w-full">
      <div *ngIf="label" class="flex items-baseline justify-between">
        <label [for]="id" class="ios-label">
          {{ label }}<span *ngIf="required" class="text-danger-500">&nbsp;*</span>
        </label>
        <ng-content select="[labelAction]"></ng-content>
      </div>
      <div class="relative">
        <span *ngIf="loading" class="absolute left-4 top-1/2 -translate-y-1/2 flex">
          <app-spinner size="sm"></app-spinner>
        </span>
        <i *ngIf="icon && !loading" [class]="icon + ' absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle text-sm'"></i>
        <input
          [id]="id"
          [type]="passwordToggle && passwordVisible ? 'text' : type"
          [placeholder]="placeholder"
          [attr.autocomplete]="autocomplete || null"
          [attr.min]="min"
          [attr.max]="max"
          [attr.spellcheck]="autocomplete === 'off' ? 'false' : null"
          class="ios-input"
          [class.ios-input-sm]="size === 'sm'"
          [class.pl-10]="icon || loading"
          [class.pr-10]="clearable || passwordToggle"
          [class.is-invalid]="invalid"
          [disabled]="disabled"
          [value]="value"
          (input)="onInput($event)"
          (blur)="onBlur()"
        >
        <app-icon-btn
          *ngIf="clearable && value !== ''"
          class="absolute right-1 top-1/2 -translate-y-1/2"
          size="sm"
          icon="fa-solid fa-xmark"
          ariaLabel="Limpar"
          (click)="clear()"
        ></app-icon-btn>
        <app-icon-btn
          *ngIf="passwordToggle"
          class="absolute right-1 top-1/2 -translate-y-1/2"
          size="sm"
          [icon]="passwordVisible ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"
          ariaLabel="Alternar visibilidade"
          (click)="passwordVisible = !passwordVisible"
        ></app-icon-btn>
      </div>
      <p *ngIf="hint && !invalid" class="mt-1.5 text-xs text-ink-subtle">{{ hint }}</p>
      <p *ngIf="invalid && errorMessage" class="error-message">
        <i class="fa-solid fa-circle-exclamation"></i>{{ errorMessage }}
      </p>
    </div>
  `,
})
export class FormInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() size: 'md' | 'sm' = 'md';
  @Input() icon?: string;
  @Input() hint?: string;
  @Input() required = false;
  @Input() invalid = false;
  @Input() errorMessage = '';
  @Input() id = '';
  @Input() autocomplete?: string;
  @Input() min?: number;
  @Input() max?: number;
  /** Troca o ícone à esquerda por um spinner (ex.: busca em andamento). */
  @Input() loading = false;
  /** Mostra um botão para limpar o campo quando há texto. */
  @Input() clearable = false;
  /** Com `type="password"`, mostra o botão de alternar visibilidade. */
  @Input() passwordToggle = false;

  value: string | number = '';
  disabled = false;
  passwordVisible = false;

  private readonly cdr = inject(ChangeDetectorRef);

  private onChange: (value: string | number | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | number | null): void {
    this.value = value ?? '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string | number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.value = raw;
    // Campo numérico entrega número (ou null quando vazio), como o NumberValueAccessor.
    this.onChange(this.type === 'number' ? (raw === '' ? null : Number(raw)) : raw);
  }

  onBlur(): void {
    this.onTouched();
  }

  clear(): void {
    this.value = '';
    this.onChange('');
  }
}
