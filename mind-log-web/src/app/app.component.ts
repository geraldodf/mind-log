import {Component, computed, inject, OnInit} from '@angular/core';
import {AuthService} from './services/auth.service';
import {ThemeService} from './services/theme.service';
import {ModalService} from './shared/ui/modal/modal.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private modalService = inject(ModalService);

  /** Derivado do sinal do AuthService: o template nunca lê um campo que muda no meio da checagem. */
  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly username = computed(() => this.isAuthenticated() ? this.authService.getUsername() : '');

  constructor() {
    this.themeService.loadTheme();
  }

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
      // Diálogo vive no <body>, fora do router-outlet: sem isto ficaria aberto sobre o login.
      if (!isAuthenticated) this.modalService.closeAll();
    });
  }

  signOut(): void {
    this.authService.signOut();
  }

}
