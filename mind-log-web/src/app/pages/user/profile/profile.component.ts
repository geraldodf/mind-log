import {Component, inject, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {CanComponentDeactivateGuard} from '../../../guards/can-component-deactivate.guard';
import {UnsavedChangesService} from '../../../services/unsaved-changes.service';
import {UserService} from '../../../services/user.service';
import {ToastrService} from 'ngx-toastr';
import {BtnComponent, CardComponent, FormInputComponent, LoadErrorComponent, PageHeaderComponent, SegmentedControlComponent, SegmentedOption, SkeletonComponent} from '../../../shared/ui';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ValidationService} from '../../../services/utils/validation.service';
import {User} from '../../../models/user/user.interface';
import {emailAvailableValidator} from '../../../validators/email-available.validator';
import {usernameAvailableValidator} from '../../../validators/username-available.validator';
import {emailPatternValidator} from '../../../validators/email-pattern.validator';
import {UsernameDirective} from '../../../directives/username.directive';
import {Router} from '@angular/router';
import {AuthService} from '../../../services/auth.service';
import {AuthenticationResponse} from '../../../models/auth/authentication-response.interface';
import {NgClass, NgIf} from '@angular/common';
import {I18nService, Lang} from '../../../services/i18n.service';
import {ConfirmationDialogService} from '../../../services/confirmation-dialog.service';
import {TranslatePipe} from '../../../pipes/translate.pipe';
import {AvatarPlaceholderComponent} from '../../../shared/ui/avatar/avatar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [LoadErrorComponent, SkeletonComponent, 
    CardComponent,
    BtnComponent,
    PageHeaderComponent,
    FormInputComponent,
    SegmentedControlComponent,
    ReactiveFormsModule,
    UsernameDirective,
    NgClass,
    NgIf,
    TranslatePipe,
    AvatarPlaceholderComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, CanComponentDeactivateGuard {

  private readonly service = inject(UserService);
  private readonly toast = inject(ToastrService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);
  readonly i18n = inject(I18nService);
  private readonly confirmationDialog = inject(ConfirmationDialogService);
  private readonly unsavedChanges = inject(UnsavedChangesService);
  protected readonly validation = inject(ValidationService);

  private me: User;

  readonly langOptions: SegmentedOption[] = [
    { value: 'en', label: 'English', icon: 'language' },
    { value: 'pt', label: 'Português', icon: 'language' },
  ];

  deleting = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    username:['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, emailPatternValidator()]],
  });

  loadingMe = true;
  loadError = false;
  saving = false;

  ngOnInit() {
    this.fetchContent();
  }

  /** Guarda de rota: alterações não salvas perguntam antes de sair. */
  canDeactivate(): Observable<boolean> | boolean {
    return this.form.dirty && !this.saving ? this.unsavedChanges.confirmDiscard() : true;
  }

  retry(): void {
    this.fetchContent();
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving) {
      if (this.form.invalid) this.toast.info(this.i18n.t('toast.fixFields'));
      return;
    }

    const user: User = {
      name: this.form.controls.name.value,
      email: this.form.controls.email.value,
      username: this.form.controls.username.value
    };

    this.saving = true;
    this.service.profileUpdate(this.me.id, user).subscribe({
      next: (response: AuthenticationResponse) => {
        this.authService.signInStoreToken(response);
      },
      error: err => {
        this.saving = false;
        if (!this.validation.applyApiError(this.form, err)) this.toast.error(err.error);
      },
      complete: () => {
        this.saving = false;
        this.form.markAsPristine();
        this.toast.success(this.i18n.t('toast.profileUpdated'));
        this.router.navigateByUrl('/')
      }
    });
  }

  navigateToUpdatePassword(): void {
    this.router.navigateByUrl(`/alterar-senha`);
  }

  setLang(lang: Lang): void {
    this.i18n.setLang(lang);
  }

  /** Ação irreversível: só segue depois do diálogo de confirmação. */
  deleteAccount(): void {
    this.confirmationDialog.confirm(this.me?.username, {
      title: this.i18n.t('profile.confirmDeleteTitle'),
      description: this.i18n.t('profile.confirmDeleteDesc'),
      confirmLabel: this.i18n.t('profile.confirmDeleteYesShort'),
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.deleting = true;
      this.service.deleteMe().subscribe({
        next: () => {
          this.authService.signOut();
          this.toast.success(this.i18n.t('toast.accountDeleted'));
        },
        error: () => {
          this.deleting = false;
          this.toast.error(this.i18n.t('toast.accountDeleteFailed'));
        }
      });
    });
  }

  private fetchContent(): void {
    this.loadingMe = true;
    this.loadError = false;
    this.service.getMe().subscribe({
      next: res => {
        this.me = res;
        this.form.controls.name.patchValue(res.name);
        this.form.controls.username.patchValue(res.username);
        this.form.controls.email.patchValue(res.email);

        this.form.controls.email.setAsyncValidators([emailAvailableValidator(res.email, this.service)]);
        this.form.controls.username.setAsyncValidators([usernameAvailableValidator(res.username, this.service)]);

        this.form.markAsPristine();
        this.loadingMe = false;
      },
      error: () => {
        this.loadingMe = false;
        this.loadError = true;
      }
    });
  }

}
