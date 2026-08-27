import {Injectable, signal} from '@angular/core';

type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  readonly theme = signal<Theme>('light');

  private readonly mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  private readonly onSystemThemeChange = (event: MediaQueryListEvent): void => {
    if (!localStorage.getItem('theme')) {
      this.applyTheme(event.matches ? 'dark' : 'light', false);
    }
  };

  loadTheme(): void {
    const saved = localStorage.getItem('theme');
    const initial: Theme = saved === 'dark' || saved === 'light' ? saved : (this.mediaQuery.matches ? 'dark' : 'light');
    this.applyTheme(initial, false);
    this.mediaQuery.addEventListener('change', this.onSystemThemeChange);
  }

  toggleTheme(): void {
    this.applyTheme(this.theme() === 'dark' ? 'light' : 'dark', true);
  }

  getTheme(): boolean {
    return this.theme() === 'dark';
  }

  private applyTheme(value: Theme, persist: boolean): void {
    this.theme.set(value);
    document.documentElement.classList.toggle('dark', value === 'dark');
    if (persist) {
      localStorage.setItem('theme', value);
    }
  }
}
