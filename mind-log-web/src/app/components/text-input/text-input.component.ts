import {Component, forwardRef, Input} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR} from '@angular/forms';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './text-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextInputComponent),
      multi: true
    }
  ]
})
export class TextInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
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

  onInput(value: string): void {
    this.value = value;
    this.onChange(value);
  }

  onBlur(): void {
    this.onTouched();
  }
}
