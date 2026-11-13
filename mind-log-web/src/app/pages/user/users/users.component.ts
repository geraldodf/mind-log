import {Component, inject, OnInit} from '@angular/core';
import {UserService} from "../../../services/user.service";
import {User} from "../../../models/user/user.interface";
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {CommonModule, DatePipe, NgForOf} from "@angular/common";
import {ToastrService} from "ngx-toastr";
import {BadgeComponent, BtnComponent, CardComponent, EmptyStateComponent, LoadErrorComponent, PageHeaderComponent, SkeletonComponent, TableComponent} from '../../../shared/ui';
import {AvatarPlaceholderComponent} from '../../../shared/ui/avatar/avatar.component';
import {Role} from '../../../models/user/role.interface';
import {PaginationComponent} from '../../../shared/ui/pagination/pagination.component';
import {ModalService} from '../../../shared/ui/modal/modal.service';
import {AdminUserFormModalComponent} from './admin-user-form-modal/admin-user-form-modal.component';
import {RolesEnum} from '../../../enums/roles.enum';
import {ConfirmationDialogService} from '../../../services/confirmation-dialog.service';
import {MobileUsersListComponent} from './mobile-users-list/mobile-users-list.component';
import {I18nService} from '../../../services/i18n.service';
import {TranslatePipe} from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgForOf,
    DatePipe,
    CardComponent,
    BtnComponent,
    EmptyStateComponent,
    LoadErrorComponent,
    BadgeComponent,
    PageHeaderComponent,
    AvatarPlaceholderComponent,
    FormsModule,
    PaginationComponent,
    TableComponent,
    MobileUsersListComponent,
    SkeletonComponent,
    TranslatePipe,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {

  private modalService = inject(ModalService);
  private confirmationDialog = inject(ConfirmationDialogService);
  private service = inject(UserService);
  private toast = inject(ToastrService);
  private fb = inject(FormBuilder);
  readonly i18n = inject(I18nService);

  content: User[] | null = null;
  loadError = false;
  /** Usuário cuja ativação está sendo gravada (desabilita o botão da linha). */
  togglingId: number | null = null;
  pageSize: number = 10;
  pageNumber: number = 1;
  totalPages: number = 0;

  formResource: Role[] = [];

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    username:['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    roles: this.fb.array([] as Role[])
  });

  roleLabels: Record<string, string> = {
    [RolesEnum.ADMIN]: 'Admin',
    [RolesEnum.USER]: 'User',
    [RolesEnum.MANAGER]: 'Manager',
  };

  ngOnInit() {
    this.fetchData();
    this.fetchRoles();
  }

  onPageChange(page: number) {
    this.pageNumber = page;
    this.fetchData();
  }

  fetchData() {
    this.content = null;
    this.loadError = false;
    this.service.getAll(this.pageSize, this.pageNumber, '').subscribe({
      next: res => {
        this.content = res.content;
        this.totalPages = res.totalPages;
      },
      // Sem isto o esqueleto ficava girando para sempre quando a carga caía.
      error: () => this.loadError = true
    });
  }

  openUserModal(): void {
    this.modalService.open<AdminUserFormModalComponent, boolean>(AdminUserFormModalComponent, {roles: this.formResource})
      .closed.subscribe(created => { if (created) this.fetchData(); });
  }

  changeIsEnableStatus(user: User){
    this.confirmationDialog.confirm(user.username).subscribe(result => {
      if (result) this.updateEnabledStatus(user);
    });
  }

  private updateEnabledStatus(user: User): void {
    this.togglingId = user.id;
    this.service.updateEnabledStatus(user.id, !user.isEnabled).subscribe({
      error: (error) => {
        this.togglingId = null;
        this.toast.error(error.error);
      },
      complete: () => {
        this.togglingId = null;
        this.toast.success(this.i18n.t(!user.isEnabled ? 'toast.userEnabled' : 'toast.userDisabled'));
        this.fetchData();
      }
    });
  }

  private fetchRoles(): void{
    this.service.getRoles().subscribe({
      next: (roles) =>{
        this.formResource = roles;
      },
      error: err =>{
        this.toast.error(err.error);
      }
    });
  }

}
