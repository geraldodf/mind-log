import {TranslatePipe} from '../../../pipes/translate.pipe';
import {Component, inject, OnInit} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {AuthService} from "../../../services/auth.service";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {PasswordDirective} from "../../../directives/password.directive";
import {CommonModule} from "@angular/common";
import {BtnComponent, FormInputComponent} from "../../../shared/ui";
import {BrandMarkComponent} from '../../../shared/ui/brand-mark/brand-mark.component';
import {TextLinkComponent} from '../../../shared/ui/text-link/text-link.component';
import {AlertComponent} from '../../../shared/ui/alert/alert.component';
import {GoogleSignInComponent} from '../../../shared/ui/google-sign-in/google-sign-in.component';
import {IconComponent} from '../../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [GoogleSignInComponent, AlertComponent, TextLinkComponent, BrandMarkComponent, IconComponent, TranslatePipe, ReactiveFormsModule, RouterLink, PasswordDirective, CommonModule, BtnComponent, FormInputComponent],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent implements OnInit {

  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  invalidLogin: boolean = false;
  /** Falha que não é credencial errada (rede, servidor): mensagem já traduzida. */
  loginError: string | null = null;
  submitting = false;


  form = this.formBuilder.group({
    username: ['', [Validators.required]],
    password: ['' , [Validators.required, Validators.minLength(5)]],
  });

  ngOnInit(): void {
    if (this.authService.isLogged()) {
      this.router.navigateByUrl('/');
    }
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.submitting) return;

    this.submitting = true;
    this.invalidLogin = false;
    this.loginError = null;
    this.authService.signIn(this.form.controls.username.value, this.form.controls.password.value).subscribe({
      next: data => {
        this.authService.signInStoreToken(data);
      },
      error: err => {
        this.submitting = false;
        if (err?.status === 401 || err?.status === 403) this.invalidLogin = true;
        else this.loginError = err?.error ?? null;
      },
      complete: () => {
        this.router.navigateByUrl("/");
      }
    });
  }
}
