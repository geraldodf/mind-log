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
import { FilterDropdownComponent } from '../../../shared/ui/filter-dropdown/filter-dropdown.component';
import { SearchInputComponent } from '../../../shared/ui/search-input/search-input.component';
import { I18nService } from '../../../services/i18n.service';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog.service';
import {
  BadgeComponent,
  BtnComponent,
  CardComponent,
  EmptyStateComponent,
  PageHeaderComponent,
  RatingStarsComponent,
  RecommendationChipComponent,
  IconBtnComponent,
  PaginationComponent,
  SegmentedControlComponent,
  SegmentedOption,
  SelectComponent,
  SelectOption,
  SkeletonComponent,
  StatusChipComponent,
} from '../../../shared/ui';

@Component({
  selector: 'app-media-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule, TranslatePipe, SystemNamePipe, FilterDropdownComponent, SearchInputComponent,
    CardComponent, BtnComponent, BadgeComponent, StatusChipComponent, RecommendationChipComponent, RatingStarsComponent,
    PageHeaderComponent, EmptyStateComponent, SkeletonComponent, SelectComponent,
    IconBtnComponent, PaginationComponent, SegmentedControlComponent,
  ],
  providers: [SystemNamePipe],
  templateUrl: './media-list.component.html',
})
export class MediaListComponent implements OnInit {
  private readonly userMediaService = inject(UserMediaService);
  private readonly i18n = inject(I18nService);
  private readonly mediaTypeService = inject(MediaTypeService);
  private readonly statusService = inject(StatusService);
  private readonly toastr = inject(ToastrService);
  private readonly systemName = inject(SystemNamePipe);
  private readonly confirmationDialog = inject(ConfirmationDialogService);

  items: UserMedia[] = [];
  mediaTypes: MediaType[] = [];
  statuses: Status[] = [];

  /** Media types that actually have entries (used for tab list). */
  usedMediaTypes: MediaType[] = [];

  /** Tabs shown by the segmented control: "All" + used media types. */
  typeTabOptions: SegmentedOption[] = [];

  loading = false;
  totalPages = 0;
  totalElements = 0;
  currentPage = 0;
  pageSize = 12;

  /** null = All tab active */
  activeTabTypeId: number | null = null;

  filterStatusId?: number;
  filterRecommendation?: string;
  searchTitle?: string;

  get filterMediaTypeId(): number | undefined {
    return this.activeTabTypeId ?? undefined;
  }

  get statusFilterOptions(): SelectOption[] {
    return [
      { value: undefined, label: this.i18n.t('media.allStatuses') },
      ...this.statuses.map(s => ({ value: s.id, label: this.systemName.transform(s.name) })),
    ];
  }

  get recommendationFilterOptions(): SelectOption[] {
    return [
      { value: undefined, label: this.i18n.t('common.all'), icon: 'fa-solid fa-list' },
      { value: 'RECOMMEND', label: this.i18n.t('media.recommend'), icon: 'fa-solid fa-thumbs-up' },
      { value: 'NEUTRAL', label: this.i18n.t('media.neutral'), icon: 'fa-solid fa-minus' },
      { value: 'NOT_RECOMMEND', label: this.i18n.t('media.notRecommend'), icon: 'fa-solid fa-thumbs-down' },
    ];
  }

  get activeFilterCount(): number {
    let count = 0;
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
    this.loadUsedTypes();
  }

  /** As abas vêm do servidor: derivá-las da página carregada escondia tipos fora dela. */
  loadUsedTypes(): void {
    this.userMediaService.getUsedMediaTypes().subscribe({
      next: (types) => {
        this.usedMediaTypes = types;
        this.rebuildTypeTabs();
      },
      error: () => this.toastr.error(this.i18n.t('toast.loadFailed'))
    });
  }

  load(): void {
    this.loading = true;
    this.userMediaService.getAll({
      mediaTypeId: this.filterMediaTypeId,
      statusId: this.filterStatusId,
      recommendation: this.filterRecommendation,
      title: this.searchTitle,
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
        this.toastr.error(this.i18n.t('toast.loadFailed'));
        this.loading = false;
      }
    });
  }

  private rebuildTypeTabs(): void {
    this.typeTabOptions = [
      { value: null, label: this.i18n.t('common.all') },
      ...this.usedMediaTypes.map(t => ({ value: t.id, label: this.systemName.transform(t.name) })),
    ];
  }

  onSearchChange(value: string): void {
    this.searchTitle = value.trim() || undefined;
    this.currentPage = 0;
    this.load();
  }

  selectTab(typeId: number | null): void {
    this.activeTabTypeId = typeId;
    this.currentPage = 0;
    this.load();
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.load();
  }

  clearFilters(): void {
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

  delete(id: number, title: string): void {
    this.confirmationDialog.confirm(title).subscribe(confirmed => {
      if (!confirmed) return;
      this.userMediaService.delete(id).subscribe({
        next: () => {
          this.toastr.success(this.i18n.t('toast.entryDeleted'));
          this.load();
          this.loadUsedTypes(); // a última entrada de um tipo pode ter saído
        },
        error: () => this.toastr.error(this.i18n.t('toast.deleteFailed'))
      });
    });
  }

  recommendationLabelKey(r: Recommendation | null): string {
    switch (r) {
      case 'RECOMMEND': return 'media.recommend';
      case 'NOT_RECOMMEND': return 'media.notRecommend';
      default: return 'media.neutral';
    }
  }
}
