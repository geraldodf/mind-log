import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import {NgClass, NgFor, NgIf} from '@angular/common';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {IconComponent, IconName} from '../icon/icon.component';

export interface SegmentedOption {
  value: any;
  label: string;
  icon?: IconName;
}

@Component({
  selector: 'app-segmented-control',
  standalone: true,
  imports: [IconComponent, NgFor, NgIf, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [':host { display: block; min-width: 0; }'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SegmentedControlComponent),
      multi: true,
    },
  ],
  // Rolável na horizontal: no mobile os segmentos não quebram de linha, a
  // barra rola. `flex-shrink-0` em cada botão impede que o texto seja espremido.
  template: `
    <!-- role=group + aria-pressed, e não tablist/tab: não há painel de aba
         associado — o controle filtra uma lista que já está na tela.
         O preenchimento do selecionado é um indicador só, que desliza (mola)
         até o segmento novo; o texto troca de cor com transição. -->
    <div #track
      class="relative flex items-center overflow-x-auto no-scrollbar"
      [ngClass]="variant === 'underline' ? 'gap-1 border-b border-hairline' : 'gap-1 pb-1'"
      role="group"
      [attr.aria-label]="ariaLabel || null"
    >
      <span *ngIf="indicatorVisible" aria-hidden="true"
            class="absolute left-0 pointer-events-none"
            [ngClass]="indicatorClass"
            [style.width.px]="indicatorWidth"
            [style.transform]="'translateX(' + indicatorX + 'px)'"></span>
      <button
        *ngFor="let option of options; let i = index"
        type="button"
        [attr.aria-pressed]="isSelected(option)"
        [disabled]="disabled"
        [attr.data-index]="i"
        class="relative flex-shrink-0 inline-flex items-center justify-center gap-2 min-h-touch px-4 py-2 text-sm cursor-pointer
               bg-transparent border-none transition-[color,background-color] duration-base ease-inout
               disabled:opacity-40 disabled:cursor-not-allowed"
        [ngClass]="variant === 'underline'
          ? (isSelected(option) ? 'text-link font-semibold' : 'text-ink-muted hover:text-ink font-medium')
          : (isSelected(option) ? 'text-ink-invert font-semibold rounded-control' : 'text-ink-muted font-medium rounded-control hover:bg-surface-sunken')"
        (click)="choose(option)"
        (keydown)="onKeydown($event, i)"
      >
        <app-icon *ngIf="option.icon" [name]="option.icon" size="xs"></app-icon>
        {{ option.label }}
      </button>
    </div>
  `,
})
export class SegmentedControlComponent implements ControlValueAccessor, AfterViewInit, OnChanges, OnDestroy {
  @Input() options: SegmentedOption[] = [];
  @Input() value: any = null;
  /** `pill` (padrão) para filtros; `underline` para abas de página. */
  @Input() variant: 'pill' | 'underline' = 'pill';
  @Input() ariaLabel = '';
  @Output() selected = new EventEmitter<any>();

  disabled = false;

  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('track') private track?: ElementRef<HTMLElement>;
  private resizeObserver?: ResizeObserver;

  indicatorX = 0;
  indicatorWidth = 0;
  indicatorVisible = false;
  /** Falso na primeira medida: o indicador nasce no lugar, sem vir deslizando do zero. */
  animate = false;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  get indicatorClass(): string {
    const shape = this.variant === 'underline'
      ? 'bottom-0 h-0.5 bg-primary-600'
      : 'top-0 bottom-1 rounded-control bg-primary-700 shadow-sm';
    return this.animate ? shape + ' transition-[transform,width] duration-shared ease-spring' : shape;
  }

  ngAfterViewInit(): void {
    if (typeof ResizeObserver !== 'undefined' && this.track) {
      this.resizeObserver = new ResizeObserver(() => this.measure());
      this.resizeObserver.observe(this.track.nativeElement);
    }
    this.scheduleMeasure();
    requestAnimationFrame(() => requestAnimationFrame(() => { this.animate = true; this.cdr.markForCheck(); }));
  }

  ngOnChanges(): void {
    this.scheduleMeasure();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  isSelected(option: SegmentedOption): boolean {
    return this.sameValue(option.value, this.value);
  }

  // Setas andam de segmento em segmento sem precisar de Tab a cada um.
  onKeydown(event: KeyboardEvent, index: number): void {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step || this.disabled || !this.options.length) return;

    event.preventDefault();
    const total = this.options.length;
    const next = (index + step + total) % total;
    const host = event.target as HTMLElement;
    const sibling = host.parentElement?.querySelector<HTMLElement>(`[data-index="${next}"]`);
    sibling?.focus();
  }

  choose(option: SegmentedOption): void {
    if (this.disabled || this.isSelected(option)) return;
    this.value = option.value;
    this.onChange(option.value);
    this.onTouched();
    this.selected.emit(option.value);
    this.scheduleMeasure();
  }

  writeValue(value: any): void {
    this.value = value;
    this.cdr.markForCheck();
    this.scheduleMeasure();
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  /** Mede depois que o Angular aplicou o `aria-pressed` novo. */
  private scheduleMeasure(): void {
    if (typeof requestAnimationFrame === 'undefined') return;
    requestAnimationFrame(() => this.measure());
  }

  private measure(): void {
    const selected = this.track?.nativeElement.querySelector<HTMLElement>('button[aria-pressed="true"]');
    this.indicatorVisible = !!selected;
    if (selected) {
      this.indicatorX = selected.offsetLeft;
      this.indicatorWidth = selected.offsetWidth;
    }
    this.cdr.markForCheck();
  }

  // `null` e `undefined` são o mesmo "sem seleção" (ex.: a aba "Todos").
  private sameValue(a: any, b: any): boolean {
    if (a == null && b == null) return true;
    return a === b;
  }
}
