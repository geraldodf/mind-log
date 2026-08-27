import {ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {NgClass, NgIf} from '@angular/common';

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
  sm: 'max-w-[380px]',
  md: 'max-w-[540px]',
  lg: 'max-w-[720px]',
  xl: 'max-w-[900px]',
};

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [NgIf, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      *ngIf="open"
      class="fixed inset-0 z-[1040] flex items-center justify-center p-4"
      style="background-color: rgb(var(--ml-neutral-900) / 0.45); backdrop-filter: blur(8px);"
      (click)="onBackdropClick($event)"
    >
      <div
        class="w-full bg-surface-raised border border-hairline rounded-panel shadow-lg overflow-hidden flex flex-col animate-scale-in"
        [ngClass]="sizeClass"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-center justify-between px-7 pt-6 pb-5 border-b border-hairline bg-surface-sunken/85" *ngIf="title">
          <h2 class="text-lg font-semibold tracking-tight text-ink">{{ title }}</h2>
          <button type="button" class="btn-icon-ios" (click)="close()" aria-label="Fechar">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="p-7 flex-1 overflow-y-auto max-h-[70vh] text-ink-muted">
          <ng-content></ng-content>
        </div>
        <div class="flex items-center justify-end gap-3 px-7 py-5 border-t border-hairline bg-surface-sunken/85" *ngIf="hasFooter">
          <ng-content select="[modalFooter]"></ng-content>
        </div>
      </div>
    </div>
  `,
})
export class ModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() closeOnBackdrop = true;
  @Input() hasFooter = false;
  @Output() closed = new EventEmitter<void>();

  get sizeClass(): string {
    return SIZE_CLASSES[this.size];
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
    this.closed.emit();
  }
}
