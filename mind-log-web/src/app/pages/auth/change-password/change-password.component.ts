import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {PasswordDirective} from '../../../directives/password.directive';
import {CommonModule} from '@angular/common';
import {UtilsService} from '../../../services/utils/utils.service';
import {passwordValidateValidator} from '../../../validators/password-validate.validator';
import {ValidationService} from '../../../services/utils/validation.service';
import {NavbarComponent} from '../../../shared/navbar/navbar.component';
import {ChangePassword} from '../../../models/auth/change-password.interface';
import {AuthService} from '../../../services/auth.service';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {ToastrService} from 'ngx-toastr';
import {ConfirmationDialogService} from '../../../services/confirmation-dialog.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule, PasswordDirective, CommonModule, NavbarComponent],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent implements OnInit {

  private readonly loader = inject(NgxUiLoaderService);
  private readonly toast = inject(ToastrService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly formUtils = inject(UtilsService);
  private readonly router = inject(Router);
  private readonly confirmationDialog = inject(ConfirmationDialogService);
  protected readonly validation = inject(ValidationService);

  isCurrentPasswordVisible: boolean = false;
  isNewPasswordVisible: boolean = false;
  isConfirmNewPasswordVisible: boolean = false;
  invalidPassword: boolean = false;

  form = this.fb.group({
    currentPassword: ['', [Validators.required, Validators.minLength(3)]],
    newPassword: ['', [Validators.required, passwordValidateValidator()]],
    confirmNewPassword: ['', [Validators.required, this.formUtils.equalsTo('newPassword')]],
  });

  ngOnInit() {
    this.form.controls.newPassword.valueChanges.subscribe(value => {
      this.validateIfPasswordsAreTheSame()
    });
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.toast.info('Corrija os campos e tente novamente.');
      return;
    }

    this.confirmationDialog.confirm().subscribe(value => {
      if (value) {
        this.changePassword();
      }
    });
  }

  private changePassword() {
    const data: ChangePassword = {
      currentPassword: this.form.controls.currentPassword.value,
      newPassword: this.form.controls.newPassword.value
    }

    this.loader.start();
    this.authService.changePassword(data).subscribe({
      error: err => {
        this.loader.stop();
        this.toast.error(err.error);
      },
      complete: () => {
        this.loader.stop();
        this.toast.success('Sua senha foi alterada com sucesso!');
        this.router.navigateByUrl('/');
      }
    });
  }

  private validateIfPasswordsAreTheSame(): void {
    const currentPassword = this.form.controls.currentPassword.value;
    const newPassword = this.form.controls.newPassword.value;

    if (newPassword && currentPassword && newPassword === currentPassword) {
      this.form.controls.newPassword.setErrors({ sameAsCurrentPassword: true });
    } else {
      if (this.form.controls.newPassword.errors && this.form.controls.newPassword.errors['sameAsCurrentPassword']) {
        delete this.form.controls.newPassword.errors['sameAsCurrentPassword'];
        this.form.controls.newPassword.updateValueAndValidity({ emitEvent: false });
      }
    }
  }

}
