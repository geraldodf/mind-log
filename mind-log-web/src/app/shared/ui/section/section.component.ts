import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-section',
  standalone: true,
  imports: [NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mb-8">
      <div class="flex items-center justify-between mb-3" *ngIf="title">
        <div>
          <h2 class="font-display text-lg font-semibold text-ink">{{ title }}</h2>
          <p *ngIf="subtitle" class="text-xs text-ink-subtle mt-1">{{ subtitle }}</p>
        </div>
        <div class="flex items-center gap-2">
          <ng-content select="[sectionActions]"></ng-content>
        </div>
      </div>
      <ng-content></ng-content>
    </section>
  `,
})
export class SectionComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
}
