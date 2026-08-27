import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgClass, NgIf} from '@angular/common';

const SIZE_CLASSES: Record<string, string> = {
  'avatar-sm': 'w-8 h-8 text-xs',
  'avatar-md': 'w-10 h-10 text-sm',
  'avatar-lg': 'w-14 h-14 text-lg',
};

@Component({
  selector: 'app-avatar-placeholder',
  standalone: true,
  imports: [NgClass, NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="rounded-full flex items-center justify-center font-semibold flex-shrink-0 select-none overflow-hidden bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300"
      [ngClass]="[sizeClass, ring ? 'ring-2 ring-surface-card' : '']"
    >
      <img *ngIf="pictureUrl" [src]="pictureUrl" [alt]="name" class="w-full h-full object-cover rounded-full" (error)="onImgError()">
      <span *ngIf="!pictureUrl">{{ initial }}</span>
    </div>
  `,
})
export class AvatarPlaceholderComponent {
  @Input() name = '';
  @Input() size: 'avatar-sm' | 'avatar-md' | 'avatar-lg' = 'avatar-sm';
  @Input() pictureUrl: string | null = null;
  @Input() ring = false;

  get initial(): string {
    return this.name.charAt(0).toUpperCase();
  }

  get sizeClass(): string {
    return SIZE_CLASSES[this.size] ?? SIZE_CLASSES['avatar-sm'];
  }

  onImgError(): void {
    this.pictureUrl = null;
  }
}
