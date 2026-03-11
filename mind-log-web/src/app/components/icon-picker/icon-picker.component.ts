import {Component, forwardRef} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {NgClass} from '@angular/common';

export const CATEGORY_ICONS = [
  'fa-utensils', 'fa-car', 'fa-heart', 'fa-book', 'fa-gamepad',
  'fa-house', 'fa-cart-shopping', 'fa-briefcase', 'fa-plane', 'fa-dumbbell',
  'fa-music', 'fa-baby', 'fa-paw', 'fa-gift', 'fa-dollar-sign',
  'fa-chart-line', 'fa-mobile-screen', 'fa-shirt', 'fa-pills', 'fa-tag',
  'fa-bolt', 'fa-droplet', 'fa-graduation-cap', 'fa-building', 'fa-ellipsis',
];

@Component({
  selector: 'app-icon-picker',
  standalone: true,
  imports: [NgClass],
  templateUrl: './icon-picker.component.html',
  styleUrl: './icon-picker.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IconPickerComponent),
      multi: true
    }
  ]
})
export class IconPickerComponent implements ControlValueAccessor {
  readonly icons = CATEGORY_ICONS;

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

  select(icon: string): void {
    if (this.disabled) return;
    this.value = icon;
    this.onChange(icon);
    this.onTouched();
  }
}
