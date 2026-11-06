import {ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, inject, Input} from '@angular/core';
import {NgIf} from '@angular/common';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'app-form-textarea',
  standalone: true,
  imports: [NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormTextareaComponent),
      multi: true,
    },
  ],
  template: `
    <div class="w-full">
      <label *ngIf="label" [for]="id" class="ios-label">
        {{ label }}<span *ngIf="required" class="text-danger-500">&nbsp;*</span>
      </label>
      <textarea
        [id]="id"
        [attr.required]="required || null"
        [attr.aria-invalid]="invalid"
        [attr.aria-describedby]="describedBy"
        [placeholder]="placeholder"
        [rows]="rows"
        class="ios-textarea"
        [class.ios-input-sm]="size === 'sm'"
        [class.is-invalid]="invalid"
        [disabled]="disabled"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onBlur()"
      ></textarea>
      <p *ngIf="hint && !invalid" [id]="id + '-hint'" class="ios-hint">{{ hint }}</p>
      <p *ngIf="invalid && errorMessage" [id]="id + '-error'" class="error-message" role="alert">
        <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>{{ errorMessage }}
      </p>
    </div>
  `,
})
export class FormTextareaComponent implements ControlValueAccessor {
  private static nextId = 0;

  @Input() label = '';
  @Input() placeholder = '';
  @Input() rows = 4;
  @Input() size: 'md' | 'sm' = 'md';
  @Input() hint?: string;
  @Input() required = false;
  @Input() invalid = false;
  @Input() errorMessage = '';
  // Gerado quando não vem de fora: sem id o `for` do <label> não aponta para nada.
  @Input() id = `app-textarea-${FormTextareaComponent.nextId++}`;

  value = '';
  disabled = false;

  get describedBy(): string | null {
    if (this.invalid && this.errorMessage) return `${this.id}-error`;
    if (this.hint) return `${this.id}-hint`;
    return null;
  }

  private readonly cdr = inject(ChangeDetectorRef);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value ?? '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string) => void): void {
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
    const value = (event.target as HTMLTextAreaElement).value;
    this.value = value;
    this.onChange(value);
  }

  onBlur(): void {
    this.onTouched();
  }
}
