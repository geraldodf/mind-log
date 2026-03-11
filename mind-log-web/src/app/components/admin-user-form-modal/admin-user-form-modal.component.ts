import {Component, inject, Input, OnInit} from '@angular/core';
import {CurrencyMaskModule} from 'ng2-currency-mask';
import {FormArray, FormBuilder, ReactiveFormsModule, Validators, AbstractControl} from '@angular/forms';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {Role} from '../../models/user/role.interface';
import {ValidationService} from '../../services/utils/validation.service';
import {RolesEnum} from '../../enums/roles.enum';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {UserRegisterDTO} from '../../dto/user-register-dto';
import {UserService} from '../../services/user.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-admin-user-form-modal',
  standalone: true,
  imports: [
    CurrencyMaskModule,
    ReactiveFormsModule
  ],
  templateUrl: './admin-user-form-modal.component.html',
  styleUrl: './admin-user-form-modal.component.scss'
})
export class AdminUserFormModalComponent implements OnInit {

  private loader = inject(NgxUiLoaderService);
  private activeModal = inject(NgbActiveModal);
  private toast = inject(ToastrService);
  private service = inject(UserService);
  private fb = inject(FormBuilder);
  protected validation = inject(ValidationService);

  @Input() roles: Role[] = [];

  title: string = 'Cadastrar Usuário';
  isEditMode: boolean = false;
  submitted = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    username:['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    roles: this.fb.array([])
  });

  roleLabels: Record<string, string> = {
    [RolesEnum.ADMIN]: 'Admin',
    [RolesEnum.USER]: 'User',
    [RolesEnum.MANAGER]: 'Manager',
  };

  ngOnInit() {

  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid){
      this.form.markAllAsTouched();
      this.toast.info("Preencha todos os campos corretamente!");
      return;
    }

    let roles: Role[] = [];
    this.rolesFormArray.controls.forEach((control) => {
      roles.push({ id: control.value });
    })

    const userData: UserRegisterDTO = {
      name: this.form.value.name!,
      username: this.form.value.username!,
      email: this.form.value.email!,
      password: this.form.value.password!,
      roles: roles
    };

    this.loader.start();
    this.service.createUser(userData).subscribe({
      error: error => {
        this.loader.stop();
        this.toast.error(error.error);
      },
      complete: () => {
        this.loader.stop();
        this.toast.success('Usuário cadastrado com sucesso!')
        this.activeModal.close(true);
      }
    });
  }

  onCancel(): void {
    this.activeModal.dismiss(false);
  }

  get rolesFormArray(): FormArray {
    return this.form.controls.roles as FormArray;
  }

  onCheckboxChange(event: any, permissionId: number) {
    if (event.target.checked) {
      this.rolesFormArray.push(this.fb.control(permissionId));
    } else {
      const index = this.rolesFormArray.controls.findIndex(x => x.value === permissionId);
      this.rolesFormArray.removeAt(index);
    }
  }

  shouldShowError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || this.submitted);
  }

}
