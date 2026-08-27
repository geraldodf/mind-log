import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state-ios">
      <div class="w-14 h-14 rounded-full bg-grad-brand-soft flex items-center justify-center mb-4">
        <i [class]="icon + ' text-2xl text-primary-600 dark:text-primary-300'"></i>
      </div>
      <h3 class="font-display text-lg font-semibold text-ink mb-1">{{ title }}</h3>
      <p *ngIf="description" class="text-sm text-ink-muted max-w-sm mb-4">{{ description }}</p>
      <ng-content></ng-content>
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() icon = 'fa-solid fa-inbox';
  @Input() title = '';
  @Input() description?: string;
}
