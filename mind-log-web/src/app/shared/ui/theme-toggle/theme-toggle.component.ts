import {ChangeDetectionStrategy, Component, inject, Input} from '@angular/core';
import {NgClass} from '@angular/common';
import {ThemeService} from '../../../services/theme.service';
import {IconBtnComponent} from '../icon-btn/icon-btn.component';
import {TranslatePipe} from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [TranslatePipe, IconBtnComponent, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-icon-btn [variant]="tone === 'sidebar' ? 'sidebar' : 'neutral'"
                  [icon]="theme.theme() === 'dark' ? 'sun' : 'moon'"
                  [ariaLabel]="(theme.theme() === 'dark' ? 'ui.themeLight' : 'ui.themeDark') | translate"
                  (click)="theme.toggleTheme()"></app-icon-btn>
  `,
})
export class ThemeToggleComponent {
  /** `sidebar` para uso sobre a sidebar, que é escura nos dois temas. */
  @Input() tone: 'default' | 'sidebar' = 'default';

  protected readonly theme = inject(ThemeService);
}
