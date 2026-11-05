import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MediaTypeService } from '../../services/media-type.service';
import { StatusService } from '../../services/status.service';
import { MediaType } from '../../models/media/media-type.interface';
import { Status } from '../../models/media/status.interface';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SystemNamePipe } from '../../pipes/system-name.pipe';
import {
  BadgeComponent, BtnComponent, CardComponent, EmptyStateComponent, FormInputComponent, IconBtnComponent, PageHeaderComponent,
  SegmentedControlComponent, SegmentedOption, SkeletonComponent,
} from '../../shared/ui';
import { I18nService } from '../../services/i18n.service';
import { ConfirmationDialogService } from '../../services/confirmation-dialog.service';

export type ContentTab = 'mediaTypes' | 'statuses';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TranslatePipe, SystemNamePipe,
    CardComponent, BtnComponent, BadgeComponent, PageHeaderComponent, EmptyStateComponent, SkeletonComponent,
    FormInputComponent, IconBtnComponent, SegmentedControlComponent,
  ],
  templateUrl: './content.component.html',
})
export class ContentComponent implements OnInit {
  private readonly mediaTypeService = inject(MediaTypeService);
  private readonly i18n = inject(I18nService);
  private readonly statusService = inject(StatusService);
  private readonly toastr = inject(ToastrService);
  private readonly confirmationDialog = inject(ConfirmationDialogService);

  activeTab: ContentTab = 'mediaTypes';
  // Getter, não propriedade: o rótulo precisa ser relido quando o idioma muda.
  get tabOptions(): SegmentedOption[] {
    return [
      { value: 'mediaTypes', label: this.i18n.t('nav.mediaTypes'), icon: 'fa-solid fa-tags' },
      { value: 'statuses', label: this.i18n.t('nav.statuses'), icon: 'fa-solid fa-list-check' },
    ];
  }

  mediaTypes: MediaType[] = [];
  mediaTypesLoading = false;
  newMediaTypeName = '';
  creatingMediaType = false;

  statuses: Status[] = [];
  statusesLoading = false;
  newStatusName = '';
  creatingStatus = false;

  ngOnInit(): void {
    this.loadMediaTypes();
    this.loadStatuses();
  }

  loadMediaTypes(): void {
    this.mediaTypesLoading = true;
    this.mediaTypeService.getAll().subscribe({
      next: (items) => { this.mediaTypes = items; this.mediaTypesLoading = false; },
      error: () => { this.toastr.error(this.i18n.t('toast.loadFailed')); this.mediaTypesLoading = false; }
    });
  }

  createMediaType(): void {
    if (!this.newMediaTypeName.trim()) return;
    this.creatingMediaType = true;
    this.mediaTypeService.create(this.newMediaTypeName.trim()).subscribe({
      next: (created) => {
        this.mediaTypes = [...this.mediaTypes, created];
        this.newMediaTypeName = '';
        this.creatingMediaType = false;
        this.toastr.success(this.i18n.t('toast.createSuccess'));
      },
      error: () => { this.toastr.error(this.i18n.t('toast.createFailed')); this.creatingMediaType = false; }
    });
  }

  deleteMediaType(id: number): void {
    this.confirmationDialog.confirm(this.mediaTypes.find(t => t.id === id)?.name).subscribe(confirmed => {
      if (!confirmed) return;
      this.mediaTypeService.delete(id).subscribe({
        next: () => { this.mediaTypes = this.mediaTypes.filter(t => t.id !== id); this.toastr.success(this.i18n.t('toast.deleteSuccess')); },
        error: () => this.toastr.error(this.i18n.t('toast.deleteFailed'))
      });
    });
  }

  loadStatuses(): void {
    this.statusesLoading = true;
    this.statusService.getAll().subscribe({
      next: (items) => { this.statuses = items; this.statusesLoading = false; },
      error: () => { this.toastr.error(this.i18n.t('toast.loadFailed')); this.statusesLoading = false; }
    });
  }

  createStatus(): void {
    if (!this.newStatusName.trim()) return;
    this.creatingStatus = true;
    this.statusService.create(this.newStatusName.trim()).subscribe({
      next: (created) => {
        this.statuses = [...this.statuses, created];
        this.newStatusName = '';
        this.creatingStatus = false;
        this.toastr.success(this.i18n.t('toast.createSuccess'));
      },
      error: () => { this.toastr.error(this.i18n.t('toast.createFailed')); this.creatingStatus = false; }
    });
  }

  deleteStatus(id: number): void {
    this.confirmationDialog.confirm(this.statuses.find(s => s.id === id)?.name).subscribe(confirmed => {
      if (!confirmed) return;
      this.statusService.delete(id).subscribe({
        next: () => { this.statuses = this.statuses.filter(s => s.id !== id); this.toastr.success(this.i18n.t('toast.deleteSuccess')); },
        error: () => this.toastr.error(this.i18n.t('toast.deleteFailed'))
      });
    });
  }
}
