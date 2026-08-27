import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserMediaService } from '../../services/user-media.service';
import { UserMedia } from '../../models/media/user-media.interface';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SystemNamePipe } from '../../pipes/system-name.pipe';
import { I18nService } from '../../services/i18n.service';
import {
  BadgeComponent,
  BtnComponent,
  CardComponent,
  EmptyStateComponent,
  PageHeaderComponent,
  RatingStarsComponent,
  SkeletonComponent,
  StatusChipComponent,
} from '../../shared/ui';

// Ouro/prata/bronze dentro da paleta: warning-500 / neutral-400 / warning-700.
const RANK_CLASSES = [
  'bg-warning-100 dark:bg-warning-500/20 text-warning-600 dark:text-warning-400',
  'bg-neutral-100 dark:bg-neutral-500/20 text-neutral-500 dark:text-neutral-400',
  'bg-warning-50 dark:bg-warning-700/20 text-warning-700 dark:text-warning-600',
];
const RANK_DEFAULT = 'bg-surface-sunken text-ink-subtle';

const MEDAL_CLASSES = [
  'text-warning-500',
  'text-neutral-400',
  'text-warning-700',
];

@Component({
  selector: 'app-top10',
  standalone: true,
  imports: [
    CommonModule, RouterLink, TranslatePipe, SystemNamePipe,
    CardComponent, BtnComponent, BadgeComponent, StatusChipComponent, RatingStarsComponent,
    PageHeaderComponent, EmptyStateComponent, SkeletonComponent,
  ],
  templateUrl: './top10.component.html',
})
export class Top10Component implements OnInit {
  private readonly service = inject(UserMediaService);
  private readonly i18n = inject(I18nService);
  private readonly toastr = inject(ToastrService);

  items: UserMedia[] = [];
  loading = true;

  ngOnInit(): void {
    this.service.getFavorites().subscribe({
      next: (data) => { this.items = data.slice(0, 10); this.loading = false; },
      error: () => { this.toastr.error(this.i18n.t('toast.loadFailed')); this.loading = false; }
    });
  }

  rankClass(index: number): string {
    return RANK_CLASSES[index] ?? RANK_DEFAULT;
  }

  medalClass(index: number): string {
    return MEDAL_CLASSES[index] ?? '';
  }
}
