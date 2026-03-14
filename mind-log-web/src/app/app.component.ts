import {Component, inject, OnInit} from '@angular/core';
import {AuthService} from './services/auth.service';
import {ThemeService} from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  private authService = inject(AuthService);
  private themeService = inject(ThemeService);

  isAuthenticated: boolean = false;
  username: string = '';

  constructor() {
    this.themeService.loadTheme();
    this.username = this.authService.getUsername();
  }

  ngOnInit() {
    this.isAuthenticated = this.authService.isLogged();
    this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
      this.isAuthenticated = isAuthenticated;
      if (isAuthenticated) {
        this.username = this.authService.getUsername();
      }
    });
  }

  signOut(): void {
    this.authService.signOut();
    this.isAuthenticated = false;
  }

}
