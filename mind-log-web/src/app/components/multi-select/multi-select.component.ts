import {Component, forwardRef, Input} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {NgbDropdownModule} from '@ng-bootstrap/ng-bootstrap';

export interface MultiSelectOption {
  value: any;
  label: string;
}

@Component({
  selector: 'app-multi-select',
  standalone: true,
  imports: [CommonModule, NgbDropdownModule],
  templateUrl: './multi-select.component.html',
  styleUrl: './multi-select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true
    }
  ]
})
export class MultiSelectComponent implements ControlValueAccessor {
  @Input() options: MultiSelectOption[] = [];
  @Input() placeholder = 'Selecionar';

  selectedValues: any[] = [];
  disabled = false;

  private onChange: (value: any[]) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: any[]): void {
    this.selectedValues = value ?? [];
  }

  registerOnChange(fn: (value: any[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  get displayLabel(): string {
    if (!this.selectedValues.length) return '';
    return this.options
      .filter(o => this.selectedValues.includes(o.value))
      .map(o => o.label)
      .join(', ');
  }

  isSelected(value: any): boolean {
    return this.selectedValues.includes(value);
  }

  toggle(value: any): void {
    if (this.isSelected(value)) {
      this.selectedValues = this.selectedValues.filter(v => v !== value);
    } else {
      this.selectedValues = [...this.selectedValues, value];
    }
    this.onChange(this.selectedValues);
    this.onTouched();
  }

  clear(event: Event): void {
    event.stopPropagation();
    this.selectedValues = [];
    this.onChange(this.selectedValues);
    this.onTouched();
  }
}
