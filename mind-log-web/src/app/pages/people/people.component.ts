import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../services/user.service';
import { FollowService } from '../../services/follow.service';
import { AuthService } from '../../services/auth.service';
import { UserSearchResult } from '../../models/user/user-search-result.interface';
import { AvatarPlaceholderComponent } from '../../components/avatar-placeholder/avatar-placeholder.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-people',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AvatarPlaceholderComponent, TranslatePipe],
  templateUrl: './people.component.html',
})
export class PeopleComponent implements OnInit, OnDestroy {
  private readonly userService = inject(UserService);
  private readonly followService = inject(FollowService);
  private readonly authService = inject(AuthService);
  private readonly toastr = inject(ToastrService);
  private readonly destroy$ = new Subject<void>();
  private readonly search$ = new Subject<string>();

  query = '';
  results: UserSearchResult[] = [];
  loading = false;
  searched = false;
  totalPages = 0;
  currentPage = 0;
  currentUsername = '';
  followLoading = new Set<number>();

  ngOnInit(): void {
    this.currentUsername = this.authService.getUsername();

    this.search$
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        switchMap(q => {
          const trimmed = q.trim();
          if (!trimmed) {
            this.results = [];
            this.searched = false;
            this.loading = false;
            return of(null);
          }
          this.loading = true;
          this.currentPage = 0;
          return this.userService.searchUsers(trimmed, 0);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: page => {
          if (page) {
            this.results = page.content;
            this.totalPages = page.totalPages;
            this.searched = true;
          }
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
  }

  onQueryChange(): void {
    this.search$.next(this.query);
  }

  loadPage(p: number): void {
    if (p < 0 || p >= this.totalPages || this.loading) return;
    this.loading = true;
    this.currentPage = p;
    this.userService.searchUsers(this.query.trim(), p).subscribe({
      next: page => { this.results = page.content; this.totalPages = page.totalPages; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  toggleFollow(user: UserSearchResult): void {
    if (this.followLoading.has(user.id)) return;
    this.followLoading.add(user.id);
    const obs = user.isFollowing
      ? this.followService.unfollow(user.username)
      : this.followService.follow(user.username);
    obs.subscribe({
      next: () => { user.isFollowing = !user.isFollowing; this.followLoading.delete(user.id); },
      error: () => { this.toastr.error('Action failed.'); this.followLoading.delete(user.id); }
    });
  }

  isOwnProfile(username: string): boolean {
    return username === this.currentUsername;
  }

  isFollowLoading(id: number): boolean {
    return this.followLoading.has(id);
  }

  pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
