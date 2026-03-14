import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/media/notification.interface';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './notifications.component.html',
})
export class NotificationsComponent implements OnInit {
  private readonly service = inject(NotificationService);
  private readonly toastr = inject(ToastrService);

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

  markAllAsRead(): void {
    this.service.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.isRead = true);
        this.unreadCount = 0;
        this.toastr.success('All notifications marked as read.');
      }
    });
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
