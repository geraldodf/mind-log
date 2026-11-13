import {TranslatePipe} from '../../../pipes/translate.pipe';
import {Component, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../../services/auth.service';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {environment} from '../../../../environments/environment';
import {BtnComponent, FormInputComponent} from '../../../shared/ui';
import {BrandMarkComponent} from '../../../shared/ui/brand-mark/brand-mark.component';
import {TextLinkComponent} from '../../../shared/ui/text-link/text-link.component';
import {AlertComponent} from '../../../shared/ui/alert/alert.component';
import {IconComponent} from '../../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [AlertComponent, TextLinkComponent, BrandMarkComponent, IconComponent, TranslatePipe, ReactiveFormsModule, RouterLink, CommonModule, BtnComponent, FormInputComponent],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {

  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  errorMessage: string | null = null;
  success = false;
  submitting = false;
  googleAuthUrl = environment.apiPath + '/oauth2/authorization/google';

  form = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]],
    username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30), Validators.pattern(/^\S+$/)]],
    confirmPassword: ['', [Validators.required]],
  });


  get passwordMismatch(): boolean {
    const {password, confirmPassword} = this.form.controls;
    return confirmPassword.touched && password.value !== confirmPassword.value;
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.passwordMismatch || this.submitting) return;

    this.submitting = true;
    this.errorMessage = null;

    const {name, username, email, password} = this.form.value;

    this.authService.register(name!, username!, email!, password!).subscribe({
      next: () => {
        this.success = true;
        this.submitting = false;
        setTimeout(() => this.router.navigateByUrl('/login'), 2000);
      },
      error: err => {
        // A mensagem da API diz o que corrigir (ex.: e-mail em uso); o interceptor já traduz rede e servidor.
        this.errorMessage = err?.error ?? null;
        this.submitting = false;
      }
    });
  }
}
