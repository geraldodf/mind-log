import {Component, inject, Input, ViewChild} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {Role} from '../../../../models/user/role.interface';
import {ValidationService} from '../../../../services/utils/validation.service';
import {RolesEnum} from '../../../../enums/roles.enum';
import {UserRegisterDTO} from '../../../../dto/user-register-dto';
import {UserService} from '../../../../services/user.service';
import {I18nService} from '../../../../services/i18n.service';
import {TranslatePipe} from '../../../../pipes/translate.pipe';
import {
  BtnComponent,
  CheckboxComponent,
  FieldGroupComponent,
  FormInputComponent,
  ModalComponent,
  ModalRef,
} from '../../../../shared/ui';

/** Cadastro de usuário pelo admin. Aberto pelo `ModalService`; devolve `true` quando cadastrou. */
@Component({
  selector: 'app-admin-user-form-modal',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, ModalComponent, FormInputComponent, CheckboxComponent, FieldGroupComponent, BtnComponent],
  templateUrl: './admin-user-form-modal.component.html',
})
export class AdminUserFormModalComponent {
  readonly modalRef = inject(ModalRef<boolean>);
  private readonly toast = inject(ToastrService);
  private readonly i18n = inject(I18nService);
  private readonly service = inject(UserService);
  private readonly fb = inject(FormBuilder);
  protected readonly validation = inject(ValidationService);

  @ViewChild(ModalComponent) private modal?: ModalComponent;

  @Input() roles: Role[] = [];

  titleKey = 'users.registerUser';
  submitted = false;
  saving = false;
  created = false;

  // Validação ao sair do campo (e de novo no envio): o erro não aparece enquanto se digita.
  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    roles: this.fb.array([])
  }, {updateOn: 'blur'});

  roleLabels: Record<string, string> = {
    [RolesEnum.ADMIN]: 'Admin',
    [RolesEnum.USER]: 'User',
    [RolesEnum.MANAGER]: 'Manager',
  };

  get rolesFormArray(): FormArray {
    return this.form.controls.roles as FormArray;
  }

  onSubmit(): void {
    if (this.saving) return;
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.info(this.i18n.t('toast.fixFields'));
      return;
    }

    const userData: UserRegisterDTO = {
      name: this.form.value.name!,
      username: this.form.value.username!,
      email: this.form.value.email!,
      password: this.form.value.password!,
      roles: this.rolesFormArray.controls.map(control => ({id: control.value}))
    };

    this.saving = true;
    this.service.createUser(userData).subscribe({
      error: error => {
        this.saving = false;
        if (!this.validation.applyApiError(this.form, error)) this.toast.error(error.error);
      },
      complete: () => {
        this.saving = false;
        this.created = true;
        this.toast.success(this.i18n.t('toast.userCreated'));
        this.modal?.close();
      }
    });
  }

  onCancel(): void {
    this.modal?.close();
  }

  onRoleChange(checked: boolean, roleId: number): void {
    if (checked) {
      this.rolesFormArray.push(this.fb.control(roleId));
      return;
    }
    const index = this.rolesFormArray.controls.findIndex(x => x.value === roleId);
    if (index >= 0) this.rolesFormArray.removeAt(index);
  }

  shouldShowError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || this.submitted);
  }
}
