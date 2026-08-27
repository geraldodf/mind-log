import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgClass} from '@angular/common';
import {resolveStatusVisual, TONE_SOFT_CLASSES} from '../tone';

@Component({
  selector: 'app-status-chip',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-chip text-xs font-medium" [ngClass]="toneClass">
      <i [class]="icon"></i>
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

  get icon(): string {
    return this.visual.icon;
  }
}
