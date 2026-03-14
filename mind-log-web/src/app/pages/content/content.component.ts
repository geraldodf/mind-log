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

export type ContentTab = 'mediaTypes' | 'statuses';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, SystemNamePipe],
  templateUrl: './content.component.html',
})
export class ContentComponent implements OnInit {
  private readonly mediaTypeService = inject(MediaTypeService);
  private readonly statusService = inject(StatusService);
  private readonly toastr = inject(ToastrService);

  activeTab: ContentTab = 'mediaTypes';

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
      error: () => { this.toastr.error('Failed to load media types.'); this.mediaTypesLoading = false; }
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
        this.toastr.success('Media type created!');
      },
      error: () => { this.toastr.error('Failed to create.'); this.creatingMediaType = false; }
    });
  }

  deleteMediaType(id: number): void {
    if (!confirm('Delete this media type?')) return;
    this.mediaTypeService.delete(id).subscribe({
      next: () => { this.mediaTypes = this.mediaTypes.filter(t => t.id !== id); this.toastr.success('Deleted.'); },
      error: () => this.toastr.error('Failed to delete.')
    });
  }

  loadStatuses(): void {
    this.statusesLoading = true;
    this.statusService.getAll().subscribe({
      next: (items) => { this.statuses = items; this.statusesLoading = false; },
      error: () => { this.toastr.error('Failed to load statuses.'); this.statusesLoading = false; }
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
        this.toastr.success('Status created!');
      },
      error: () => { this.toastr.error('Failed to create.'); this.creatingStatus = false; }
    });
  }

  deleteStatus(id: number): void {
    if (!confirm('Delete this status?')) return;
    this.statusService.delete(id).subscribe({
      next: () => { this.statuses = this.statuses.filter(s => s.id !== id); this.toastr.success('Deleted.'); },
      error: () => this.toastr.error('Failed to delete.')
    });
  }
}
