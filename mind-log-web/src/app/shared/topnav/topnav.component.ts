import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvatarPlaceholderComponent } from '../../components/avatar-placeholder/avatar-placeholder.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { RolesEnum } from '../../enums/roles.enum';
import { NotificationService } from '../../services/notification.service';
import { SuggestionService } from '../../services/suggestion.service';
import { ToastrService } from 'ngx-toastr';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Notification } from '../../models/media/notification.interface';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-topnav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AvatarPlaceholderComponent, NgbModule, NgClass, FormsModule, TranslatePipe, DatePipe],
  templateUrl: './topnav.component.html',
})
export class TopNavComponent implements OnInit {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private notificationService = inject(NotificationService);
  private suggestionService = inject(SuggestionService);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  private i18n = inject(I18nService);

  @Input() username: string = '';
  @Output() signOutEmitter = new EventEmitter<void>();

  isDarkMode = false;
  unreadCount = 0;
  recentNotifications: Notification[] = [];
  notifLoading = false;
  notifLoaded = false;
  isMobileMenuOpen = false;

  feedbackOpen = false;
  feedbackText = '';
  feedbackSubmitting = false;

  get picture(): string | null {
    return this.authService.getPicture();
  }

  get isAdminRouteActive(): boolean {
    return this.router.url.startsWith('/admin') || this.router.url.startsWith('/usuarios');
  }

  get isMoreRouteActive(): boolean {
    return this.router.url.startsWith('/media-types') || this.router.url.startsWith('/statuses');
  }

  hasAdminRole(): boolean {
    return this.authService.hasRole(RolesEnum.ADMIN);
  }

  ngOnInit(): void {
    this.isDarkMode = this.themeService.getTheme();
    this.notificationService.getUnreadCount().subscribe(count => this.unreadCount = count);
  }

  openNotifications(): void {
    if (this.notifLoaded) return;
    this.notifLoading = true;
    this.notificationService.getAll(0, 5).subscribe({
      next: (page) => {
        this.recentNotifications = page.content;
        this.notifLoading = false;
        this.notifLoaded = true;
      },
      error: () => { this.notifLoading = false; this.notifLoaded = true; }
    });
  }

  markAsReadIfUnread(n: Notification): void {
    if (!n.isRead) {
      this.markAsRead(n.id, new MouseEvent('click'));
    }
  }

  markAllAsRead(event: MouseEvent): void {
    event.stopPropagation();
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.recentNotifications.forEach(n => n.isRead = true);
        this.unreadCount = 0;
      }
    });
  }

  notifMsg(n: Notification): string {
    switch (n.notificationType) {
      case 'FOLLOW':
        return `${n.relatedName || n.relatedUsername} ${this.i18n.t('notifications.followedYou')}`;
      case 'MEDIA_RELEASE_TODAY':
        return `${this.i18n.t('notifications.mediaTodayMsg')} "${n.userMediaTitle}"! 🎉`;
      case 'MEDIA_RELEASE_SOON':
        return `${this.i18n.t('notifications.mediaSoonMsg')} "${n.userMediaTitle}" 📅`;
      default:
        return n.message;
    }
  }

  markAsRead(id: number, event: MouseEvent): void {
    event.stopPropagation();
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        const n = this.recentNotifications.find(x => x.id === id);
        if (n) { n.isRead = true; this.unreadCount = Math.max(0, this.unreadCount - 1); }
      }
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.getTheme();
  }

  signOut(): void {
    this.signOutEmitter.emit();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  openFeedback(): void {
    this.feedbackOpen = true;
    this.feedbackText = '';
    this.isMobileMenuOpen = false;
  }

  closeFeedback(): void {
    this.feedbackOpen = false;
  }

  submitFeedback(): void {
    if (!this.feedbackText.trim()) return;
    this.feedbackSubmitting = true;
    this.suggestionService.submit(this.feedbackText.trim()).subscribe({
      next: () => {
        this.toastr.success('Thank you for your feedback!');
        this.feedbackOpen = false;
        this.feedbackText = '';
        this.feedbackSubmitting = false;
      },
      error: () => {
        this.toastr.error('Failed to send feedback.');
        this.feedbackSubmitting = false;
      }
    });
  }
}
