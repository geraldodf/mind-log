import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgIf} from '@angular/common';
import {TranslatePipe} from '../../../pipes/translate.pipe';
import {RouterLink} from '@angular/router';
import {IconBtnComponent} from '../icon-btn/icon-btn.component';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [IconBtnComponent, NgIf, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- só vira linha em lg: no md as ações (busca + filtro + botão) comem a
         largura toda e esmagam o título até 0 -->
    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-6 md:mb-8">
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <app-icon-btn *ngIf="backLink" [routerLink]="backLink" icon="arrow-left" [ariaLabel]="'common.back' | translate"></app-icon-btn>
        <div class="min-w-0">
          <h1 class="font-display text-2xl md:text-3xl font-bold text-ink truncate">{{ title }}</h1>
          <p *ngIf="subtitle" class="text-sm text-ink-muted mt-1">{{ subtitle }}</p>
        </div>
      </div>
      <!-- as ações podem quebrar: fixá-las esmagava o título em telas médias -->
      <div class="flex items-center gap-2 flex-wrap lg:justify-end">
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
