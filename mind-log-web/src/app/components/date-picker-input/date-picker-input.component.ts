import {NgClass} from '@angular/common';
import {Component, forwardRef, Input} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR} from '@angular/forms';
import {NgbDateStruct, NgbInputDatepicker} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-date-picker-input',
  standalone: true,
  imports: [FormsModule, NgbInputDatepicker, NgClass],
  templateUrl: './date-picker-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerInputComponent),
      multi: true
    }
  ]
})
export class DatePickerInputComponent implements ControlValueAccessor {
  @Input() id = '';
  @Input() placeholder = 'dd/mm/yyyy';
  @Input() invalid = false;

  value: NgbDateStruct | null = null;
  disabled = false;

  private onChange: (value: NgbDateStruct | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: NgbDateStruct | null): void {
    this.value = value;
  }

  registerOnChange(fn: (value: NgbDateStruct | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onModelChange(value: NgbDateStruct | null): void {
    this.value = value;
    this.onChange(value);
  }

  markTouched(): void {
    this.onTouched();
  }
}

