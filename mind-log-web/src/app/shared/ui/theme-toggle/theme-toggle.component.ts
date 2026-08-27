import {ChangeDetectionStrategy, Component, inject, Input} from '@angular/core';
import {NgClass} from '@angular/common';
import {ThemeService} from '../../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      [ngClass]="tone === 'sidebar' ? 'btn-icon-sidebar' : 'btn-icon-ios'"
      (click)="theme.toggleTheme()"
      [attr.aria-label]="theme.theme() === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'"
    >
      <i class="fa-solid" [ngClass]="theme.theme() === 'dark' ? 'fa-sun' : 'fa-moon'"></i>
    </button>
  `,
})
export class ThemeToggleComponent {
  /** `sidebar` para uso sobre a sidebar, que é escura nos dois temas. */
  @Input() tone: 'default' | 'sidebar' = 'default';

  protected readonly theme = inject(ThemeService);
}
