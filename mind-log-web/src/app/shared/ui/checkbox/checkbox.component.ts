import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, forwardRef, inject, Input, Output} from '@angular/core';
import {NgClass, NgIf} from '@angular/common';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [NgClass, NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
  template: `
    <div class="w-full">
      <label [for]="id" class="flex items-start gap-3 text-sm text-ink-muted select-none"
             [ngClass]="disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'">
        <span class="relative mt-1 flex h-5 w-5 flex-shrink-0">
          <input
            [id]="id"
            type="checkbox"
            class="peer absolute inset-0 z-10 h-5 w-5 m-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
            [checked]="checked"
            [indeterminate]="indeterminate"
            [disabled]="disabled"
            [required]="required"
            [attr.aria-invalid]="invalid"
            [attr.aria-describedby]="invalid && errorMessage ? id + '-error' : null"
            (change)="onToggle($any($event.target).checked)"
            (blur)="onTouched()"
          >
          <span
            class="flex h-5 w-5 items-center justify-center rounded-chip border text-ink-invert
                   transition-[background-color,border-color] duration-200
                   peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500"
            [ngClass]="(checked || indeterminate)
              ? 'bg-primary-600 border-primary-600'
              : (invalid ? 'bg-surface-sunken border-danger-400' : 'bg-surface-sunken border-hairline-strong')"
            aria-hidden="true"
          >
            <i *ngIf="indeterminate" class="fa-solid fa-minus text-2xs"></i>
            <i *ngIf="!indeterminate && checked" class="fa-solid fa-check text-2xs"></i>
          </span>
        </span>
        <span *ngIf="label">{{ label }}<span *ngIf="required" class="text-danger-500">&nbsp;*</span></span>
        <ng-content></ng-content>
      </label>
      <p *ngIf="invalid && errorMessage" [id]="id + '-error'" class="error-message" role="alert">
        <i class="fa-solid fa-circle-exclamation"></i>{{ errorMessage }}
      </p>
    </div>
  `,
})
export class CheckboxComponent implements ControlValueAccessor {
  private static nextId = 0;

  @Input() id = `app-checkbox-${CheckboxComponent.nextId++}`;
  @Input() label = '';
  @Input() indeterminate = false;
  @Input() required = false;
  @Input() invalid = false;
  @Input() errorMessage = '';
  @Output() valueChange = new EventEmitter<boolean>();

  checked = false;
  disabled = false;

  private readonly cdr = inject(ChangeDetectorRef);

  private onChange: (value: boolean) => void = () => {};
  onTouched: () => void = () => {};

  onToggle(value: boolean): void {
    this.checked = value;
    this.indeterminate = false;
    this.onChange(value);
    this.onTouched();
    this.valueChange.emit(value);
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
