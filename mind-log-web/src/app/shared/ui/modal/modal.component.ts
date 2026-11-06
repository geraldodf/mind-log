import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import {NgClass, NgIf} from '@angular/common';
import {A11yModule} from '@angular/cdk/a11y';
import {TranslatePipe} from '../../../pipes/translate.pipe';

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
  sm: 'max-w-[380px]',
  md: 'max-w-[540px]',
  lg: 'max-w-[720px]',
  xl: 'max-w-[900px]',
};

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [NgIf, NgClass, A11yModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      *ngIf="open"
      class="fixed inset-0 z-[1040] flex items-center justify-center p-4"
      style="background-color: rgb(var(--ml-neutral-900) / 0.45); backdrop-filter: blur(8px);"
      (click)="onBackdropClick($event)"
    >
      <!-- cdkTrapFocus com autoCapture: o Tab não escapa para a página atrás e
           o foco volta para quem abriu o modal quando ele fecha. -->
      <div
        cdkTrapFocus
        [cdkTrapFocusAutoCapture]="true"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="title ? titleId : null"
        [attr.aria-label]="title ? null : ('ui.dialog' | translate)"
        class="w-full bg-surface-raised border border-hairline rounded-panel shadow-lg overflow-hidden flex flex-col animate-scale-in"
        [ngClass]="sizeClass"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-center justify-between gap-4 px-6 pt-6 pb-4 border-b border-hairline bg-surface-sunken/85" *ngIf="title">
          <h2 class="text-lg font-semibold tracking-tight text-ink" [id]="titleId">{{ title }}</h2>
          <button type="button" class="btn-icon-ios flex-shrink-0" (click)="close()"
                  [attr.aria-label]="'common.close' | translate">
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>
        <div class="p-6 flex-1 overflow-y-auto max-h-[70vh] text-ink-muted">
          <ng-content></ng-content>
        </div>
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-hairline bg-surface-sunken/85" *ngIf="hasFooter">
          <ng-content select="[modalFooter]"></ng-content>
        </div>
      </div>
    </div>
  `,
})
export class ModalComponent implements OnChanges, OnDestroy {
  private static nextId = 0;

  @Input() open = false;
  @Input() title = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() closeOnBackdrop = true;
  @Input() hasFooter = false;
  @Output() closed = new EventEmitter<void>();

  readonly titleId = `app-modal-${ModalComponent.nextId++}-title`;

  get sizeClass(): string {
    return SIZE_CLASSES[this.size];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']) this.lockScroll(this.open);
  }

  ngOnDestroy(): void {
    this.lockScroll(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) this.close();
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdrop) this.close();
  }

  close(): void {
    this.open = false;
    this.lockScroll(false);
    this.closed.emit();
  }

  // Sem isto a página de trás continua rolando sob o modal no celular.
  private lockScroll(locked: boolean): void {
    if (typeof document === 'undefined') return;
    document.body.classList.toggle('overflow-hidden', locked);
  }
}
