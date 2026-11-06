import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SystemNamePipe } from '../../pipes/system-name.pipe';
import { ToastrService } from 'ngx-toastr';
import { PublicProfileService } from '../../services/public-profile.service';
import { FollowService } from '../../services/follow.service';
import { MediaTypeService } from '../../services/media-type.service';
import { StatusService } from '../../services/status.service';
import { AuthService } from '../../services/auth.service';
import { PublicProfile } from '../../models/user/public-profile.interface';
import { UserMedia } from '../../models/media/user-media.interface';
import { MediaType } from '../../models/media/media-type.interface';
import { Status } from '../../models/media/status.interface';
import { AvatarPlaceholderComponent } from '../../shared/ui/avatar/avatar.component';
import {
  BadgeComponent,
  BtnComponent,
  CardComponent,
  EmptyStateComponent,
  PaginationComponent,
  RatingStarsComponent,
  RecommendationChipComponent,
  SelectComponent,
  SelectOption,
  SkeletonComponent,

  StatusChipComponent,
} from '../../shared/ui';
import { FormsModule } from '@angular/forms';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [
    CommonModule, RouterLink, AvatarPlaceholderComponent, FormsModule, TranslatePipe, SystemNamePipe,
    CardComponent, BtnComponent, BadgeComponent, StatusChipComponent, RecommendationChipComponent, RatingStarsComponent,
    EmptyStateComponent, SkeletonComponent, SelectComponent, PaginationComponent,
  ],
  providers: [SystemNamePipe],
  templateUrl: './public-profile.component.html',
})
export class PublicProfileComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly i18n = inject(I18nService);
  private readonly profileService = inject(PublicProfileService);
  private readonly followService = inject(FollowService);
  private readonly mediaTypeService = inject(MediaTypeService);
  private readonly statusService = inject(StatusService);
  private readonly authService = inject(AuthService);
  private readonly toastr = inject(ToastrService);
  private readonly systemName = inject(SystemNamePipe);

  profile?: PublicProfile;
  media: UserMedia[] = [];
  mediaTypes: MediaType[] = [];
  statuses: Status[] = [];
  loading = true;
  loadingMedia = true;
  isFollowing = false;
  followLoading = false;
  totalPages = 0;
  currentPage = 0;
  filterMediaTypeId?: number;
  filterStatusId?: number;
  username = '';
  isOwnProfile = false;

  ngOnInit(): void {
    this.username = this.route.snapshot.paramMap.get('username') || '';
    this.isOwnProfile = this.authService.getUsername() === this.username;
    this.mediaTypeService.getAll().subscribe(t => this.mediaTypes = t);
    this.statusService.getAll().subscribe(s => this.statuses = s);
    this.loadProfile();
  }

  loadProfile(): void {
    this.profileService.getProfile(this.username).subscribe({
      next: (p) => {
        this.profile = p;
        this.loading = false;
        this.loadFollowStats();
        this.loadMedia();
      },
      error: () => { this.toastr.error(this.i18n.t('toast.profileNotFound')); this.loading = false; }
    });
  }

  loadFollowStats(): void {
    this.followService.getStats(this.username).subscribe({
      next: (s) => { this.isFollowing = s.isFollowing; }
    });
  }

  loadMedia(): void {
    this.loadingMedia = true;
    this.profileService.getPublicMedia(this.username, this.filterMediaTypeId, this.filterStatusId, this.currentPage).subscribe({
      next: (page) => { this.media = page.content; this.totalPages = page.totalPages; this.loadingMedia = false; }
    });
  }

  toggleFollow(): void {
    if (this.followLoading) return;
    this.followLoading = true;
    const obs = this.isFollowing ? this.followService.unfollow(this.username) : this.followService.follow(this.username);
    obs.subscribe({
      next: () => {
        this.isFollowing = !this.isFollowing;
        if (this.profile) {
          this.profile = { ...this.profile, followersCount: this.profile.followersCount + (this.isFollowing ? 1 : -1) };
        }
        this.followLoading = false;
      },
      error: () => { this.toastr.error(this.i18n.t('toast.actionFailed')); this.followLoading = false; }
    });
  }

  applyFilters(): void { this.currentPage = 0; this.loadMedia(); }
  clearFilters(): void { this.filterMediaTypeId = undefined; this.filterStatusId = undefined; this.currentPage = 0; this.loadMedia(); }
  goToPage(p: number): void { if (p >= 0 && p < this.totalPages) { this.currentPage = p; this.loadMedia(); } }

  get mediaTypeFilterOptions(): SelectOption[] {
    return [
      { value: undefined, label: this.i18n.t('media.allTypes') },
      ...this.mediaTypes.map(t => ({ value: t.id, label: this.systemName.transform(t.name) })),
    ];
  }

  get statusFilterOptions(): SelectOption[] {
    return [
      { value: undefined, label: this.i18n.t('media.allStatuses') },
      ...this.statuses.map(s => ({ value: s.id, label: this.systemName.transform(s.name) })),
    ];
  }
}
