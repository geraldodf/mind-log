import {
  ChangeDetectorRef, Component, ElementRef, forwardRef, inject, Input,
  OnDestroy, TemplateRef, ViewChild, ViewContainerRef
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgClass } from '@angular/common';
import { NgbDatepicker, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '../../../pipes/translate.pipe';
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
    <!-- O botão de limpar é irmão do gatilho, não um <i> dentro dele: aninhado
         não recebia foco e era inalcançável por teclado. -->
    <div class="relative w-full">
      <button
        #trigger
        type="button"
        (click)="toggle()"
        [disabled]="isDisabled"
        [attr.aria-expanded]="isOpen"
        aria-haspopup="dialog"
        [attr.aria-label]="ariaLabel || ('ui.openCalendar' | translate)"
        class="ios-input text-left flex items-center gap-2 w-full cursor-pointer select-none"
        [class.pr-12]="!!ngbValue">
        <i class="fa-regular fa-calendar text-primary-500 text-sm flex-shrink-0" aria-hidden="true"></i>
        <span class="flex-1 text-sm truncate"
              [ngClass]="ngbValue ? 'text-ink' : 'text-ink-subtle'">
          {{ ngbValue ? display : ('datepicker.placeholder' | translate) }}
        </span>
        @if (!ngbValue) {
          <i class="fa-solid fa-chevron-down text-xs text-ink-subtle" aria-hidden="true"></i>
        }
      </button>

      @if (ngbValue) {
        <button type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center
                       rounded-full text-ink-subtle hover:text-danger-500 hover:bg-surface-sunken transition-colors"
                [attr.aria-label]="'ui.clearDate' | translate"
                (click)="clear($event)">
          <i class="fa-solid fa-xmark text-xs" aria-hidden="true"></i>
        </button>
      }
    </div>

    <ng-template #calendarTpl>
      <div class="bg-surface-raised border border-hairline rounded-control shadow-lg overflow-hidden"
           role="dialog" aria-modal="true" [attr.aria-label]="'ui.openCalendar' | translate">
        <ngb-datepicker
          [(ngModel)]="ngbValue"
          (dateSelect)="onSelect($event)">
        </ngb-datepicker>

        <!-- Atalhos rápidos, como no date picker do Money Matters -->
        <div class="flex items-center gap-2 px-3 py-2 border-t border-hairline bg-surface-sunken">
          <button type="button" class="datepicker-shortcut" (click)="selectToday()">
            <i class="fa-regular fa-calendar-check text-2xs" aria-hidden="true"></i>
            {{ 'datepicker.today' | translate }}
          </button>
          <div class="flex-1"></div>
          <button type="button" class="datepicker-shortcut datepicker-shortcut-muted" (click)="clear($event)">
            {{ 'datepicker.clear' | translate }}
          </button>
        </div>
      </div>
    </ng-template>
  `
})
export class DatePickerInputComponent implements ControlValueAccessor, OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);

  @ViewChild('trigger') triggerEl!: ElementRef<HTMLElement>;
  @ViewChild('calendarTpl') calendarTpl!: TemplateRef<any>;

  @Input() ariaLabel = '';

  ngbValue: NgbDateStruct | null = null;
  isDisabled = false;
  isOpen = false;

  private readonly cdr = inject(ChangeDetectorRef);

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
    this.isOpen = true;
    this.cdr.markForCheck();
  }

  close(): void {
    const wasOpen = !!this.overlayRef?.hasAttached();
    this.overlayRef?.detach();
    this.isOpen = false;
    this._onTouched();
    this.cdr.markForCheck();
    // Fechou por Esc ou backdrop: o foco tem de voltar ao gatilho.
    if (wasOpen) this.triggerEl?.nativeElement.focus();
  }

  onSelect(date: NgbDateStruct): void {
    this.ngbValue = date;
    this._onChange(`${date.year}-${pad(date.month)}-${pad(date.day)}`);
    this._onTouched();
    this.close();
  }

  selectToday(): void {
    const now = new Date();
    this.onSelect({ year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() });
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
