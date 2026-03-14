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
import { AvatarPlaceholderComponent } from '../../components/avatar-placeholder/avatar-placeholder.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, AvatarPlaceholderComponent, FormsModule, TranslatePipe, SystemNamePipe],
  templateUrl: './public-profile.component.html',
})
export class PublicProfileComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly profileService = inject(PublicProfileService);
  private readonly followService = inject(FollowService);
  private readonly mediaTypeService = inject(MediaTypeService);
  private readonly statusService = inject(StatusService);
  private readonly authService = inject(AuthService);
  private readonly toastr = inject(ToastrService);

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
      error: () => { this.toastr.error('Profile not found.'); this.loading = false; }
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
      error: () => { this.toastr.error('Action failed.'); this.followLoading = false; }
    });
  }

  applyFilters(): void { this.currentPage = 0; this.loadMedia(); }
  clearFilters(): void { this.filterMediaTypeId = undefined; this.filterStatusId = undefined; this.currentPage = 0; this.loadMedia(); }
  goToPage(p: number): void { if (p >= 0 && p < this.totalPages) { this.currentPage = p; this.loadMedia(); } }
  pages(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i); }
  getRatingStars(r: number | null): string { return r ? '⭐'.repeat(r) : ''; }
}
