import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [NgIf, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
      <div class="flex items-center gap-3 min-w-0">
        <a *ngIf="backLink" [routerLink]="backLink" class="btn-icon-ios" aria-label="Voltar">
          <i class="fa-solid fa-arrow-left"></i>
        </a>
        <div class="min-w-0">
          <h1 class="font-display text-2xl md:text-3xl font-bold text-ink truncate">{{ title }}</h1>
          <p *ngIf="subtitle" class="text-sm text-ink-muted mt-1">{{ subtitle }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0">
        <ng-content select="[headerActions]"></ng-content>
      </div>
    </div>
  `,
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() backLink?: string | any[];
}
