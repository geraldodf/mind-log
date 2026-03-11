import {AfterContentChecked, Component, inject, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs/operators';
import {AuthService} from './services/auth.service';
import {ThemeService} from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, AfterContentChecked {

  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private router = inject(Router);

  isAuthenticated: boolean = false;
  username: string = '';
  isMobileNavOpen = false;

  constructor() {
    this.themeService.loadTheme();
    this.username = this.authService.getUsername();
  }


  ngOnInit() {
    // this.applyTheme();
    this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
      this.isAuthenticated = isAuthenticated;
      if (isAuthenticated) {
        this.username = this.authService.getUsername();
      }
    });
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.isMobileNavOpen = false);
  }

  ngAfterContentChecked() {
    if (this.authService.isLogged()) this.isAuthenticated = true;
  }

  signOut(): void {
    this.authService.signOut();
    this.isAuthenticated = false;
    this.isMobileNavOpen = false;
  }

  toggleMobileNav(): void {
    this.isMobileNavOpen = !this.isMobileNavOpen;
  }

  closeMobileNav(): void {
    this.isMobileNavOpen = false;
  }

}
