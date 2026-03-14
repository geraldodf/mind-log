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
            (click)="toggle()">
      <span class="text-xl">{{ selected || '😊' }}</span>
      <span class="text-slate-400 text-sm flex-1">
        {{ selected ? selected : ('feeling.pick' | translate) }}
      </span>
      <i class="fa-solid fa-chevron-down text-xs text-slate-400 transition-transform duration-200"
         [class.rotate-180]="isOpen"></i>
    </button>

    <ng-template #panelTpl>
      <div class="emoji-picker-panel">
        @for (cat of categories; track cat.labelKey) {
          <p class="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1.5 mt-2 first:mt-0">
            {{ cat.labelKey | translate }}
          </p>
          <div class="flex flex-wrap gap-1 mb-1">
            @for (emoji of cat.emojis; track emoji) {
              <button type="button"
                      (click)="select(emoji)"
                      class="w-9 h-9 rounded-xl flex items-center justify-center text-xl
                             transition-all duration-150 cursor-pointer border-none
                             hover:bg-indigo-50 hover:scale-110 active:scale-95"
                      [class.bg-indigo-50]="selected === emoji"
                      [class.ring-2]="selected === emoji"
                      [class.ring-indigo-400]="selected === emoji">
                {{ emoji }}
              </button>
            }
          </div>
        }
        @if (selected) {
          <div class="border-t border-slate-100 dark:border-white/[0.06] pt-2 mt-2">
            <button type="button" (click)="select(null)"
                    class="text-xs text-red-400 hover:text-red-500 cursor-pointer bg-transparent border-none w-full text-left">
              <i class="fa-solid fa-xmark mr-1"></i> {{ 'feeling.clear' | translate }}
            </button>
          </div>
        }
      </div>
    </ng-template>
  `
})
export class EmojiPickerComponent implements OnDestroy {
  @Input() selected: string | null = null;
  @Output() selectedChange = new EventEmitter<string | null>();

  @ViewChild('toggleBtn') toggleBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('panelTpl') panelTpl!: TemplateRef<void>;

  private overlay = inject(Overlay);
  private vcr = inject(ViewContainerRef);
  private overlayRef: OverlayRef | null = null;

  categories = EMOJI_CATEGORIES;
  isOpen = false;

  toggle(): void {
    this.isOpen ? this.close() : this.open();
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

  select(emoji: string | null): void {
    this.selected = emoji;
    this.selectedChange.emit(emoji);
    this.close();
  }

  ngOnDestroy(): void {
    this.close();
  }
}
