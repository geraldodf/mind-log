import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserMediaService } from '../../../services/user-media.service';
import { StatusService } from '../../../services/status.service';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog.service';
import { UserMedia, UserMediaUpdateDTO } from '../../../models/media/user-media.interface';
import { Status } from '../../../models/media/status.interface';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { SystemNamePipe } from '../../../pipes/system-name.pipe';
import { I18nService } from '../../../services/i18n.service';
import {
  BadgeComponent,
  BtnComponent,
  CardComponent,
  EmptyStateComponent,
  PageHeaderComponent,
  RatingStarsComponent,
  RecommendationChipComponent,
  SelectComponent,
  SelectOption,
  SkeletonComponent,
  StatusChipComponent,
} from '../../../shared/ui';

@Component({
  selector: 'app-media-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TranslatePipe, SystemNamePipe,
    CardComponent, BtnComponent, BadgeComponent, RecommendationChipComponent, RatingStarsComponent,
    PageHeaderComponent, EmptyStateComponent, SkeletonComponent, SelectComponent, StatusChipComponent,
  ],
  providers: [SystemNamePipe],
  templateUrl: './media-detail.component.html',
})
export class MediaDetailComponent implements OnInit {
  private readonly userMediaService = inject(UserMediaService);
  private readonly statusService = inject(StatusService);
  private readonly confirmationDialog = inject(ConfirmationDialogService);
  private readonly systemName = inject(SystemNamePipe);
  private readonly i18n = inject(I18nService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  media?: UserMedia;
  statuses: Status[] = [];
  loading = true;

  /** Uma ação inline por vez: dois cliques rápidos persistiriam snapshots diferentes. */
  saving = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.statusService.getAll().subscribe({
        next: (s) => this.statuses = s,
        error: () => this.toastr.error(this.i18n.t('toast.loadFailed'))
      });
      this.userMediaService.getById(+id).subscribe({
        next: (m) => { this.media = m; this.loading = false; },
        error: () => {
          this.toastr.error(this.i18n.t('toast.notFound'));
          this.router.navigate(['/media']);
        }
      });
    }
  }

  get statusOptions(): SelectOption[] {
    return this.statuses.map(s => ({ value: s.id, label: this.systemName.transform(s.name) }));
  }

  get hasText(): boolean {
    return !!(this.media?.review || this.media?.notes);
  }

  changeStatus(statusId: number): void {
    const media = this.media;
    const next = this.statuses.find(s => s.id === statusId);
    if (!media || !next || next.id === media.status.id || this.saving) return;
    const previous = media.status;
    media.status = next;
    this.save(() => media.status = previous, 'toast.statusUpdated');
  }

  changeRating(stars: number): void {
    const media = this.media;
    if (!media || this.saving) return;
    const previous = media.rating;
    media.rating = stars || null;
    this.save(() => media.rating = previous, 'toast.ratingUpdated');
  }

  toggleFavorite(): void {
    const media = this.media;
    if (!media || this.saving) return;
    const previous = { isFavorite: media.isFavorite, topRank: media.topRank };
    media.isFavorite = !media.isFavorite;
    if (!media.isFavorite) media.topRank = null;
    this.save(
      () => Object.assign(media, previous),
      media.isFavorite ? 'toast.favoriteAdded' : 'toast.favoriteRemoved',
    );
  }

  delete(): void {
    const media = this.media;
    if (!media) return;
    this.confirmationDialog.confirm(media.title).subscribe(confirmed => {
      if (!confirmed) return;
      this.userMediaService.delete(media.id).subscribe({
        next: () => {
          this.toastr.success(this.i18n.t('toast.entryDeleted'));
          this.router.navigate(['/media']);
        },
        error: () => this.toastr.error(this.i18n.t('toast.deleteFailed'))
      });
    });
  }

  recommendationLabelKey(r: string | null): string {
    switch (r) {
      case 'RECOMMEND': return 'media.recommend';
      case 'NOT_RECOMMEND': return 'media.notRecommend';
      default: return 'media.neutral';
    }
  }

  /**
   * O backend só expõe o PUT com o DTO completo: o estado já alterado na tela é
   * enviado inteiro e, se falhar, só o campo alterado volta ao valor anterior.
   */
  private save(revert: () => void, successKey: string): void {
    const media = this.media;
    if (!media) return;
    this.saving = true;
    this.userMediaService.update(media.id, this.toDto(media)).subscribe({
      next: (saved) => {
        this.saving = false;
        media.updatedAt = saved.updatedAt;
        this.toastr.success(this.i18n.t(successKey));
      },
      error: () => {
        this.saving = false;
        revert();
        this.toastr.error(this.i18n.t('toast.updateFailed'));
      }
    });
  }

  private toDto(media: UserMedia): UserMediaUpdateDTO {
    return {
      title: media.title,
      mediaTypeId: media.mediaType.id,
      statusId: media.status.id,
      rating: media.rating,
      feelings: media.feelings,
      recommendation: media.recommendation,
      startDate: media.startDate,
      endDate: media.endDate,
      nextReleaseDate: media.nextReleaseDate,
      notes: media.notes,
      review: media.review,
      visibility: media.visibility,
      isFavorite: media.isFavorite,
      topRank: media.topRank,
    };
  }
}
