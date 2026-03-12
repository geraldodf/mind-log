import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TokenService} from '../../../services/token.service';
import {AuthService} from '../../../services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [],
  template: ''
})
export class AuthCallbackComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly tokenService = inject(TokenService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const accessToken = params['accessToken'];
      const refreshToken = params['refreshToken'];

      if (accessToken && refreshToken) {
        this.authService.signInStoreToken({accessToken, refreshToken});
        this.router.navigateByUrl('/');
      } else {
        this.router.navigateByUrl('/login');
      }
    });
  }
}
