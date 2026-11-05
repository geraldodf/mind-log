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
      <p *ngIf="hint && !invalid" class="mt-1.5 text-xs text-ink-subtle">{{ hint }}</p>
      <p *ngIf="invalid && errorMessage" class="error-message">
        <i class="fa-solid fa-circle-exclamation"></i>{{ errorMessage }}
      </p>
    </div>
  `,
})
export class FormTextareaComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() rows = 4;
  @Input() size: 'md' | 'sm' = 'md';
  @Input() hint?: string;
  @Input() required = false;
  @Input() invalid = false;
  @Input() errorMessage = '';
  @Input() id = '';

  value = '';
  disabled = false;

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
