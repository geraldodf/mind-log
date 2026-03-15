import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../../services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [],
  template: ''
})
export class AuthCallbackComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    // Tokens are sent in the URL fragment (#accessToken=...&refreshToken=...) by the
    // backend OAuth2SuccessHandler. Fragments are never forwarded to the server, so
    // they never appear in access logs — this is intentional for security.
    // ActivatedRoute.fragment emits the raw fragment string; we parse it manually.
    this.route.fragment.subscribe(fragment => {
      if (!fragment) {
        this.router.navigateByUrl('/login');
        return;
      }

      const params = new URLSearchParams(fragment);
      const accessToken = params.get('accessToken');
      const refreshToken = params.get('refreshToken');

      if (accessToken && refreshToken) {
        this.authService.signInStoreToken({ accessToken, refreshToken });
        this.router.navigateByUrl('/');
      } else {
        this.router.navigateByUrl('/login');
      }
    });
  }
}
