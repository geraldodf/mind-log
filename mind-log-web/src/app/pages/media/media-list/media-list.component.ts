import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserMediaService } from '../../../services/user-media.service';
import { MediaTypeService } from '../../../services/media-type.service';
import { StatusService } from '../../../services/status.service';
import { UserMedia, Recommendation } from '../../../models/media/user-media.interface';
import { MediaType } from '../../../models/media/media-type.interface';
import { Status } from '../../../models/media/status.interface';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { SystemNamePipe } from '../../../pipes/system-name.pipe';
import { FilterDropdownComponent } from '../../../components/filter-dropdown/filter-dropdown.component';

@Component({
  selector: 'app-media-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe, SystemNamePipe, FilterDropdownComponent],
  templateUrl: './media-list.component.html',
})
export class MediaListComponent implements OnInit {
  private readonly userMediaService = inject(UserMediaService);
  private readonly mediaTypeService = inject(MediaTypeService);
  private readonly statusService = inject(StatusService);
  private readonly toastr = inject(ToastrService);

  items: UserMedia[] = [];
  mediaTypes: MediaType[] = [];
  statuses: Status[] = [];

  loading = false;
  totalPages = 0;
  totalElements = 0;
  currentPage = 0;
  pageSize = 12;

  filterMediaTypeId?: number;
  filterStatusId?: number;
  filterRecommendation?: string;

  get activeFilterCount(): number {
    let count = 0;
    if (this.filterMediaTypeId !== undefined) count++;
    if (this.filterStatusId !== undefined) count++;
    if (this.filterRecommendation !== undefined) count++;
    return count;
  }

  ngOnInit(): void {
    this.loadFilters();
    this.load();
  }

  loadFilters(): void {
    this.mediaTypeService.getAll().subscribe(types => this.mediaTypes = types);
    this.statusService.getAll().subscribe(statuses => this.statuses = statuses);
  }

  load(): void {
    this.loading = true;
    this.userMediaService.getAll({
      mediaTypeId: this.filterMediaTypeId,
      statusId: this.filterStatusId,
      recommendation: this.filterRecommendation,
      page: this.currentPage,
      size: this.pageSize,
      sort: 'updatedAt,desc',
    }).subscribe({
      next: (page) => {
        this.items = page.content;
        this.totalPages = page.totalPages;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: () => {
        this.toastr.error('Failed to load media list.');
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.load();
  }

  clearFilters(): void {
    this.filterMediaTypeId = undefined;
    this.filterStatusId = undefined;
    this.filterRecommendation = undefined;
    this.currentPage = 0;
    this.load();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.load();
    }
  }

  delete(id: number): void {
    if (!confirm('Delete this entry?')) return;
    this.userMediaService.delete(id).subscribe({
      next: () => {
        this.toastr.success('Entry deleted.');
        this.load();
      },
      error: () => this.toastr.error('Failed to delete.')
    });
  }

  getRatingStars(rating: number | null): string {
    if (!rating) return '';
    return '⭐'.repeat(rating);
  }

  getRecommendationLabel(r: Recommendation | null): { labelKey: string; css: string } {
    switch (r) {
      case 'RECOMMEND': return { labelKey: 'media.recommend', css: 'badge-success' };
      case 'NOT_RECOMMEND': return { labelKey: 'media.notRecommend', css: 'badge-danger' };
      default: return { labelKey: 'media.neutral', css: 'badge-secondary' };
    }
  }

  pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
}
