import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, forwardRef, inject, Input, Output} from '@angular/core';
import {NgClass, NgIf} from '@angular/common';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'app-toggle',
  standalone: true,
  imports: [NgClass, NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [':host { display: inline-block; }'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleComponent),
      multi: true,
    },
  ],
  template: `
    <label class="inline-flex items-center gap-3 select-none" [ngClass]="disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'">
      <button
        type="button"
        role="switch"
        [id]="id"
        [attr.aria-checked]="checked"
        [attr.aria-label]="label ? null : ariaLabel"
        [disabled]="disabled"
        class="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full border-none
               transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed"
        [ngClass]="checked ? 'bg-primary-600' : 'bg-hairline-strong'"
        (click)="toggle()"
        (blur)="onTouched()"
      >
        <span
          class="inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200"
          [ngClass]="checked ? 'translate-x-5' : 'translate-x-1'"
        ></span>
      </button>
      <span *ngIf="label" class="text-sm text-ink-muted">{{ label }}</span>
    </label>
  `,
})
export class ToggleComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() ariaLabel = '';
  @Input() id = '';
  @Output() valueChange = new EventEmitter<boolean>();

  checked = false;
  disabled = false;

  private readonly cdr = inject(ChangeDetectorRef);

  private onChange: (value: boolean) => void = () => {};
  onTouched: () => void = () => {};

  toggle(): void {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.onChange(this.checked);
    this.valueChange.emit(this.checked);
  }

  writeValue(value: boolean): void {
    this.checked = !!value;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }
}
