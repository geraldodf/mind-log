import {
  Component, ElementRef, EventEmitter, inject,
  Input, OnDestroy, Output, TemplateRef,
  ViewChild, ViewContainerRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { TranslatePipe } from '../../pipes/translate.pipe';

const EMOJI_CATEGORIES = [
  { labelKey: 'feeling.love', emojis: ['😍', '❤️', '🥰', '💕', '💖', '🫶'] },
  { labelKey: 'feeling.hype', emojis: ['🔥', '🤯', '💥', '⚡', '🎯', '🏆'] },
  { labelKey: 'feeling.good', emojis: ['😊', '🙂', '👍', '👏', '🌟', '✨'] },
  { labelKey: 'feeling.meh',  emojis: ['😐', '🤔', '😶', '😑', '🫤', '🙃'] },
  { labelKey: 'feeling.bad',  emojis: ['😢', '😭', '💀', '😴', '😩', '🤢'] },
  { labelKey: 'feeling.more', emojis: ['⭐', '🎬', '📚', '🎮', '🎵', '🎙️'] },
];

@Component({
  selector: 'app-emoji-picker',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <button #toggleBtn type="button"
            class="ios-input text-left flex items-center gap-2"
            [attr.aria-expanded]="isOpen"
            aria-haspopup="dialog"
            [attr.aria-labelledby]="ariaLabelledby || null"
            (click)="toggle()">
      @if (selected.length > 0) {
        <span class="flex gap-1 text-xl leading-none">
          @for (e of selected; track e) { <span>{{ e }}</span> }
        </span>
      } @else {
        <span class="text-xl opacity-40" aria-hidden="true">😊</span>
      }
      <span class="text-ink-subtle text-sm flex-1 truncate">
        {{ selected.length > 0 ? (selected.length + ' ' + ('feeling.selected' | translate)) : ('feeling.pick' | translate) }}
      </span>
      <i class="fa-solid fa-chevron-down text-xs text-ink-subtle transition-transform duration-base ease-inout flex-shrink-0"
         [class.rotate-180]="isOpen" aria-hidden="true"></i>
    </button>

    <ng-template #panelTpl>
      <div class="emoji-picker-panel" role="dialog" [attr.aria-labelledby]="ariaLabelledby || null">
        @for (cat of categories; track cat.labelKey) {
          <p class="text-2xs font-bold tracking-widest uppercase text-ink-subtle mb-2 mt-3 first:mt-0"
             [id]="'emoji-cat-' + cat.labelKey">
            {{ cat.labelKey | translate }}
          </p>
          <div class="flex flex-wrap gap-1 mb-1" role="group" [attr.aria-labelledby]="'emoji-cat-' + cat.labelKey">
            @for (emoji of cat.emojis; track emoji) {
              <button type="button"
                      (click)="toggle(emoji); $event.stopPropagation()"
                      [attr.aria-pressed]="isSelected(emoji)"
                      class="w-9 h-9 min-w-touch min-h-touch rounded-control flex items-center justify-center text-xl
                             transition-[background-color,transform] duration-fast ease-inout cursor-pointer border-none
                             hover:bg-primary-50 dark:hover:bg-primary-500/10 motion-safe:hover:scale-110 active:scale-95"
                      [class.bg-primary-50]="isSelected(emoji)"
                      [class.ring-2]="isSelected(emoji)"
                      [class.ring-primary-400]="isSelected(emoji)">
                {{ emoji }}
              </button>
            }
          </div>
        }
        @if (selected.length > 0) {
          <div class="border-t border-hairline pt-2 mt-2">
            <button type="button" (click)="clearAll(); $event.stopPropagation()"
                    class="text-xs text-danger-500 hover:text-danger-600 cursor-pointer bg-transparent border-none w-full text-left">
              <i class="fa-solid fa-xmark mr-1" aria-hidden="true"></i> {{ 'feeling.clear' | translate }}
            </button>
          </div>
        }
      </div>
    </ng-template>
  `
})
export class EmojiPickerComponent implements OnDestroy {
  @Input() selected: string[] = [];
  @Input() ariaLabelledby = '';
  @Output() selectedChange = new EventEmitter<string[]>();

  @ViewChild('toggleBtn') toggleBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('panelTpl') panelTpl!: TemplateRef<void>;

  private overlay = inject(Overlay);
  private vcr = inject(ViewContainerRef);
  private overlayRef: OverlayRef | null = null;

  categories = EMOJI_CATEGORIES;
  isOpen = false;

  /** Toggle the panel open/closed (called without args), or toggle an emoji selection (called with an emoji). */
  toggle(emoji?: string): void {
    if (emoji === undefined) {
      this.isOpen ? this.close() : this.open();
      return;
    }
    const next = this.isSelected(emoji)
      ? this.selected.filter(e => e !== emoji)
      : [...this.selected, emoji];
    this.selected = next;
    this.selectedChange.emit(next);
  }

  isSelected(emoji: string): boolean {
    return this.selected.includes(emoji);
  }

  clearAll(): void {
    this.selected = [];
    this.selectedChange.emit([]);
    this.close();
  }

  open(): void {
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.toggleBtn)
      .withPositions([
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top',    offsetY: 4  },
        { originX: 'start', originY: 'top',    overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
      ])
      .withFlexibleDimensions(false)
      .withPush(false);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      minWidth: 280,
    });

    this.overlayRef.backdropClick().subscribe(() => this.close());
    this.overlayRef.attach(new TemplatePortal(this.panelTpl, this.vcr));
    this.isOpen = true;
  }

  close(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.isOpen = false;
  }

  ngOnDestroy(): void {
    this.close();
  }
}
