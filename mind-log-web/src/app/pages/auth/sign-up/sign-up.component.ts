import {Component, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../../services/auth.service';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {

  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isPasswordVisible = false;
  isConfirmPasswordVisible = false;
  errorMessage: string | null = null;
  success = false;
  googleAuthUrl = environment.apiPath + '/oauth2/authorization/google';

  form = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]],
    username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30), Validators.pattern(/^\S+$/)]],
    confirmPassword: ['', [Validators.required]],
  });

  constructor(private loader: NgxUiLoaderService) {}

  get passwordMismatch(): boolean {
    const {password, confirmPassword} = this.form.controls;
    return confirmPassword.touched && password.value !== confirmPassword.value;
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.passwordMismatch) return;

    this.loader.start();
    this.errorMessage = null;

    const {name, username, email, password} = this.form.value;

    this.authService.register(name!, username!, email!, password!).subscribe({
      next: () => {
        this.success = true;
        this.loader.stop();
        setTimeout(() => this.router.navigateByUrl('/login'), 2000);
      },
      error: err => {
        this.errorMessage = err?.error?.message ?? 'Erro ao criar conta. Tente novamente.';
        this.loader.stop();
      }
    });
  }

  setIsPasswordVisible(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  setIsConfirmPasswordVisible(): void {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }
}
