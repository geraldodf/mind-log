import {ChangeDetectionStrategy, Component, forwardRef, Input} from '@angular/core';
import {NgIf} from '@angular/common';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [NgIf],
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
      <label *ngIf="label" [for]="id" class="ios-label">
        {{ label }}<span *ngIf="required" class="text-danger-500">&nbsp;*</span>
      </label>
      <div class="relative">
        <i *ngIf="icon" [class]="icon + ' absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle text-sm'"></i>
        <input
          [id]="id"
          [type]="type"
          [placeholder]="placeholder"
          class="ios-input"
          [class.pl-10]="icon"
          [class.is-invalid]="invalid"
          [disabled]="disabled"
          [value]="value"
          (input)="onInput($event)"
          (blur)="onBlur()"
        >
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
  @Input() icon?: string;
  @Input() hint?: string;
  @Input() required = false;
  @Input() invalid = false;
  @Input() errorMessage = '';
  @Input() id = '';

  value = '';
  disabled = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
  }

  onBlur(): void {
    this.onTouched();
  }
}
