import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserMediaService } from '../../../services/user-media.service';
import { UserMedia } from '../../../models/media/user-media.interface';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { SystemNamePipe } from '../../../pipes/system-name.pipe';
import { I18nService } from '../../../services/i18n.service';
import {
  BadgeComponent,
  BtnComponent,
  CardComponent,
  RatingStarsComponent,
  RecommendationChipComponent,
  StatusChipComponent,
} from '../../../shared/ui';

@Component({
  selector: 'app-media-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink, TranslatePipe, SystemNamePipe,
    CardComponent, BtnComponent, BadgeComponent, StatusChipComponent, RecommendationChipComponent, RatingStarsComponent,
  ],
  templateUrl: './media-detail.component.html',
})
export class MediaDetailComponent implements OnInit {
  private readonly userMediaService = inject(UserMediaService);
  private readonly i18n = inject(I18nService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  media?: UserMedia;
  loading = true;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userMediaService.getById(+id).subscribe({
        next: (m) => { this.media = m; this.loading = false; },
        error: () => {
          this.toastr.error(this.i18n.t('toast.notFound'));
          this.router.navigate(['/media']);
        }
      });
    }
  }

  delete(): void {
    if (!this.media || !confirm('Delete this entry?')) return;
    this.userMediaService.delete(this.media.id).subscribe({
      next: () => {
        this.toastr.success(this.i18n.t('toast.entryDeleted'));
        this.router.navigate(['/media']);
      },
      error: () => this.toastr.error(this.i18n.t('toast.deleteFailed'))
    });
  }

  recommendationLabelKey(r: string | null): string {
    switch (r) {
      case 'RECOMMEND': return 'media.recommend';
      case 'NOT_RECOMMEND': return 'media.notRecommend';
      default: return 'media.neutral';
    }
  }
}
