import {TranslatePipe} from '../../../pipes/translate.pipe';
import {Component, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../../services/auth.service';
import {ValidationService} from '../../../services/utils/validation.service';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {BtnComponent, FormInputComponent} from '../../../shared/ui';
import {BrandMarkComponent} from '../../../shared/ui/brand-mark/brand-mark.component';
import {TextLinkComponent} from '../../../shared/ui/text-link/text-link.component';
import {AlertComponent} from '../../../shared/ui/alert/alert.component';
import {GoogleSignInComponent} from '../../../shared/ui/google-sign-in/google-sign-in.component';
import {IconComponent} from '../../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [GoogleSignInComponent, AlertComponent, TextLinkComponent, BrandMarkComponent, IconComponent, TranslatePipe, ReactiveFormsModule, RouterLink, CommonModule, BtnComponent, FormInputComponent],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {

  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly validation = inject(ValidationService);

  errorMessage: string | null = null;
  success = false;
  submitting = false;

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
        // E-mail ou usuário em uso aparecem no próprio campo; o resto, no alerta do formulário.
        if (!this.validation.applyApiError(this.form, err)) this.errorMessage = err?.error ?? null;
        this.submitting = false;
      }
    });
  }
}
