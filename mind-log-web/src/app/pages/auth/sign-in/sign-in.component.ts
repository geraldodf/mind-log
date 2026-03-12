import {Component, inject, OnInit} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {TokenService} from "../../../services/token.service";
import {AuthService} from "../../../services/auth.service";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {PasswordDirective} from "../../../directives/password.directive";
import {CommonModule} from "@angular/common";
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PasswordDirective, CommonModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent implements OnInit {

  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);

  public isPasswordVisible: boolean = false;
  invalidLogin: boolean = false;
  googleAuthUrl = environment.apiPath + '/oauth2/authorization/google';

  constructor(private loader: NgxUiLoaderService) {}

  form = this.formBuilder.group({
    username: ['', [Validators.required]],
    password: ['' , [Validators.required, Validators.minLength(5)]],
  });

  ngOnInit(): void {
    let token = this.tokenService.getAccessToken()
    if (token !== null || token !== 'undefined') {
      this.router.navigateByUrl("/");
    }
  }

  onSubmit(): void {
    this.loader.start();
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.loader.stop();
      return;
    }

    this.authService.signIn(this.form.controls.username.value, this.form.controls.password.value).subscribe({
      next: data => {
        this.authService.signInStoreToken(data);
      },
      error: err => {
        this.invalidLogin = true;
      },
      complete: () => {
        this.router.navigateByUrl("/");
      }
    });
    this.loader.stop();
  }

  setIsPasswordVisible() {
    this.isPasswordVisible = !this.isPasswordVisible
  }
}
