import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MediaTypeService } from '../../services/media-type.service';
import { MediaType } from '../../models/media/media-type.interface';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SystemNamePipe } from '../../pipes/system-name.pipe';
import { BadgeComponent, BtnComponent, CardComponent, EmptyStateComponent, FormInputComponent, IconBtnComponent, PageHeaderComponent, SkeletonComponent } from '../../shared/ui';
import { I18nService } from '../../services/i18n.service';
import { ConfirmationDialogService } from '../../services/confirmation-dialog.service';

@Component({
  selector: 'app-media-types',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TranslatePipe, SystemNamePipe,
    CardComponent, BtnComponent, BadgeComponent, PageHeaderComponent, EmptyStateComponent, SkeletonComponent,
    FormInputComponent, IconBtnComponent,
  ],
  templateUrl: './media-types.component.html',
})
export class MediaTypesComponent implements OnInit {
  private readonly service = inject(MediaTypeService);
  private readonly i18n = inject(I18nService);
  private readonly toastr = inject(ToastrService);
  private readonly confirmationDialog = inject(ConfirmationDialogService);

  all: MediaType[] = [];
  loading = false;
  newName = '';
  creating = false;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.service.getAll().subscribe({
      next: (items) => { this.all = items; this.loading = false; },
      error: () => { this.toastr.error(this.i18n.t('toast.loadFailed')); this.loading = false; }
    });
  }

  create(): void {
    if (!this.newName.trim()) return;
    this.creating = true;
    this.service.create(this.newName.trim()).subscribe({
      next: (created) => {
        this.all = [...this.all, created];
        this.newName = '';
        this.creating = false;
        this.toastr.success(this.i18n.t('toast.createSuccess'));
      },
      error: () => { this.toastr.error(this.i18n.t('toast.createFailed')); this.creating = false; }
    });
  }

  delete(id: number): void {
    this.confirmationDialog.confirm(this.all.find(t => t.id === id)?.name).subscribe(confirmed => {
      if (!confirmed) return;
      this.service.delete(id).subscribe({
        next: () => {
          this.all = this.all.filter(t => t.id !== id);
          this.toastr.success(this.i18n.t('toast.deleteSuccess'));
        },
        error: () => this.toastr.error(this.i18n.t('toast.deleteFailed'))
      });
    });
  }
}
