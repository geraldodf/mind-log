import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgClass} from '@angular/common';
import {resolveStatusVisual, TONE_SOFT_CLASSES} from '../tone';
import {IconComponent, IconName} from '../icon/icon.component';

@Component({
  selector: 'app-status-chip',
  standalone: true,
  imports: [IconComponent, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-center gap-2 px-2 py-1 rounded-chip text-xs font-medium" [ngClass]="toneClass">
      <app-icon [name]="icon"></app-icon>
      {{ name }}
    </span>
  `,
})
export class StatusChipComponent {
  @Input() name = '';

  get visual() {
    return resolveStatusVisual(this.name);
  }

  get toneClass(): string {
    return TONE_SOFT_CLASSES[this.visual.tone];
  }

  get icon(): IconName {
    return this.visual.icon;
  }
}
