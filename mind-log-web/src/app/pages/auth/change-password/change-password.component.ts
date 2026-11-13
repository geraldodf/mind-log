import {TranslatePipe} from '../../../pipes/translate.pipe';
import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {PasswordDirective} from '../../../directives/password.directive';
import {CommonModule} from '@angular/common';
import {UtilsService} from '../../../services/utils/utils.service';
import {passwordValidateValidator} from '../../../validators/password-validate.validator';
import {ValidationService} from '../../../services/utils/validation.service';
import {BtnComponent, CardComponent, FormInputComponent, PageHeaderComponent, PasswordRequirementsComponent} from '../../../shared/ui';
import {AlertComponent} from '../../../shared/ui/alert/alert.component';
import {ChangePassword} from '../../../models/auth/change-password.interface';
import {AuthService} from '../../../services/auth.service';
import {ToastrService} from 'ngx-toastr';
import {I18nService} from '../../../services/i18n.service';
import {ConfirmationDialogService} from '../../../services/confirmation-dialog.service';
import {Router} from '@angular/router';
import {IconComponent} from '../../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [AlertComponent, IconComponent, TranslatePipe, ReactiveFormsModule, PasswordDirective, CommonModule, CardComponent, BtnComponent, PageHeaderComponent, FormInputComponent, PasswordRequirementsComponent],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent implements OnInit {

  private readonly toast = inject(ToastrService);
  private readonly i18n = inject(I18nService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly formUtils = inject(UtilsService);
  private readonly router = inject(Router);
  private readonly confirmationDialog = inject(ConfirmationDialogService);
  protected readonly validation = inject(ValidationService);

  submitting = false;

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
      this.toast.info(this.i18n.t('toast.fixFields'));
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

    this.submitting = true;
    this.authService.changePassword(data).subscribe({
      error: err => {
        this.submitting = false;
        this.toast.error(err.error);
      },
      complete: () => {
        this.submitting = false;
        this.toast.success(this.i18n.t('toast.passwordChanged'));
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
