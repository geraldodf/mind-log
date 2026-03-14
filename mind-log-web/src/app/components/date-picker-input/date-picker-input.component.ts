import {
  Component, ElementRef, forwardRef, inject,
  OnDestroy, TemplateRef, ViewChild, ViewContainerRef
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgClass } from '@angular/common';
import { NgbDatepicker, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

@Component({
  selector: 'app-date-picker-input',
  standalone: true,
  imports: [NgClass, FormsModule, NgbDatepicker, TranslatePipe],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DatePickerInputComponent),
    multi: true
  }],
  template: `
    <button
      #trigger
      type="button"
      (click)="toggle()"
      [disabled]="isDisabled"
      class="ios-input text-left flex items-center gap-2 w-full cursor-pointer select-none">
      <i class="fa-regular fa-calendar text-indigo-400 text-sm flex-shrink-0"></i>
      <span class="flex-1 text-sm"
            [ngClass]="ngbValue ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'">
        {{ ngbValue ? display : ('datepicker.placeholder' | translate) }}
      </span>
      @if (ngbValue) {
        <i class="fa-solid fa-xmark text-xs text-slate-400 hover:text-red-400 cursor-pointer transition-colors"
           (click)="clear($event)"></i>
      } @else {
        <i class="fa-solid fa-chevron-down text-xs text-slate-400"></i>
      }
    </button>

    <ng-template #calendarTpl>
      <ngb-datepicker
        [(ngModel)]="ngbValue"
        (dateSelect)="onSelect($event)">
      </ngb-datepicker>
    </ng-template>
  `
})
export class DatePickerInputComponent implements ControlValueAccessor, OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);

  @ViewChild('trigger') triggerEl!: ElementRef<HTMLElement>;
  @ViewChild('calendarTpl') calendarTpl!: TemplateRef<any>;

  ngbValue: NgbDateStruct | null = null;
  isDisabled = false;

  private overlayRef?: OverlayRef;
  private _onChange: (v: string | null) => void = () => {};
  private _onTouched: () => void = () => {};

  ngOnDestroy(): void {
    this.overlayRef?.dispose();
  }

  writeValue(value: string | null): void {
    if (value) {
      const [y, m, d] = value.split('-').map(Number);
      this.ngbValue = { year: y, month: m, day: d };
    } else {
      this.ngbValue = null;
    }
  }

  registerOnChange(fn: any): void { this._onChange = fn; }
  registerOnTouched(fn: any): void { this._onTouched = fn; }
  setDisabledState(d: boolean): void { this.isDisabled = d; }

  toggle(): void {
    this.overlayRef?.hasAttached() ? this.close() : this.open();
  }

  private open(): void {
    const posStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.triggerEl)
      .withPositions([
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top',    offsetY: 4 },
        { originX: 'start', originY: 'top',    overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy: posStrategy,
      scrollStrategy: this.overlay.scrollStrategies.close(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    });

    this.overlayRef.backdropClick().subscribe(() => this.close());
    this.overlayRef.keydownEvents().subscribe(e => {
      if (e.key === 'Escape') this.close();
    });

    this.overlayRef.attach(new TemplatePortal(this.calendarTpl, this.vcr));
  }

  close(): void {
    this.overlayRef?.detach();
    this._onTouched();
  }

  onSelect(date: NgbDateStruct): void {
    this.ngbValue = date;
    this._onChange(`${date.year}-${pad(date.month)}-${pad(date.day)}`);
    this._onTouched();
    this.close();
  }

  clear(e: Event): void {
    e.stopPropagation();
    this.ngbValue = null;
    this._onChange(null);
    this._onTouched();
    this.close();
  }

  get display(): string {
    if (!this.ngbValue) return '';
    return `${MONTHS[this.ngbValue.month - 1]} ${this.ngbValue.day}, ${this.ngbValue.year}`;
  }
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}
