import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgClass, NgIf} from '@angular/common';
import {Tone, TONE_SOFT_CLASSES, TONE_SOLID_CLASSES} from '../tone';
import {IconComponent, IconName} from '../icon/icon.component';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [IconComponent, NgClass, NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-center gap-2 px-2 py-1 rounded-chip text-xs font-medium" [ngClass]="toneClass">
      <app-icon *ngIf="icon" [name]="icon"></app-icon>
      <ng-content></ng-content>
    </span>
  `,
})
export class BadgeComponent {
  @Input() tone: Tone = 'neutral';
  @Input() icon?: IconName;
  @Input() variant: 'soft' | 'solid' = 'soft';

  get toneClass(): string {
    return this.variant === 'solid' ? TONE_SOLID_CLASSES[this.tone] : TONE_SOFT_CLASSES[this.tone];
  }
}
