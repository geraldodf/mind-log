import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault} from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [NgSwitch, NgSwitchCase, NgSwitchDefault, NgFor],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container [ngSwitch]="variant">
      <div *ngSwitchCase="'text'" class="flex flex-col gap-2">
        <div *ngFor="let l of lineArray" class="skeleton-row"></div>
      </div>
      <div *ngSwitchCase="'circle'" class="skeleton rounded-full w-10 h-10"></div>
      <div *ngSwitchDefault class="skeleton rounded-card w-full h-32"></div>
    </ng-container>
  `,
})
export class SkeletonComponent {
  @Input() variant: 'text' | 'block' | 'circle' = 'text';
  @Input() lines = 1;

  get lineArray(): number[] {
    return Array.from({length: Math.max(1, this.lines)});
  }
}
