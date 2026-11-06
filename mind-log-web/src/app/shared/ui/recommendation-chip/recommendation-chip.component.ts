import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgClass} from '@angular/common';
import {Recommendation, resolveRecommendationVisual, TONE_SOFT_CLASSES} from '../tone';

@Component({
  selector: 'app-recommendation-chip',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-center gap-2 px-2 py-1 rounded-chip text-xs font-medium" [ngClass]="toneClass">
      <i [class]="icon" aria-hidden="true"></i>
      <ng-content></ng-content>
    </span>
  `,
})
export class RecommendationChipComponent {
  @Input() value: Recommendation | null = null;

  get visual() {
    return resolveRecommendationVisual(this.value);
  }

  get toneClass(): string {
    return TONE_SOFT_CLASSES[this.visual.tone];
  }

  get icon(): string {
    return this.visual.icon;
  }
}
