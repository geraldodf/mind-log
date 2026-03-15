import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/media/notification.interface';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './notifications.component.html',
})
export class NotificationsComponent implements OnInit {
  private readonly service = inject(NotificationService);
  private readonly toastr = inject(ToastrService);
  private readonly i18n = inject(I18nService);

  notifications: Notification[] = [];
  loading = false;
  totalPages = 0;
  currentPage = 0;
  unreadCount = 0;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.service.getAll(this.currentPage).subscribe({
      next: (page) => {
        this.notifications = page.content;
        this.totalPages = page.totalPages;
        this.loading = false;
      },
      error: () => { this.toastr.error('Failed to load notifications.'); this.loading = false; }
    });
    this.service.getUnreadCount().subscribe(count => this.unreadCount = count);
  }

  markAsRead(id: number): void {
    this.service.markAsRead(id).subscribe({
      next: () => {
        const n = this.notifications.find(x => x.id === id);
        if (n) { n.isRead = true; this.unreadCount = Math.max(0, this.unreadCount - 1); }
      }
    });
  }

  // Called when the user clicks the profile/media link on an unread notification —
  // marks it read automatically so they don't have to press the check button separately.
  markAsReadIfUnread(n: Notification): void {
    if (!n.isRead) {
      this.markAsRead(n.id);
    }
  }

  markAllAsRead(): void {
    this.service.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.isRead = true);
        this.unreadCount = 0;
        this.toastr.success(this.i18n.t('notifications.markedAllRead'));
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

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.load();
    }
  }

  pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
}
