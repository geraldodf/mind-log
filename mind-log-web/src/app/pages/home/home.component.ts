import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserMediaService } from '../../services/user-media.service';
import { NotificationService } from '../../services/notification.service';
import { UserMedia } from '../../models/media/user-media.interface';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SystemNamePipe } from '../../pipes/system-name.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, SystemNamePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private readonly userMediaService = inject(UserMediaService);
  private readonly notificationService = inject(NotificationService);

  recent: UserMedia[] = [];
  upcoming: UserMedia[] = [];
  unreadCount = 0;
  totalEntries = 0;
  loadingRecent = true;
  loadingUpcoming = true;

  ngOnInit(): void {
    this.userMediaService.getAll({ page: 0, size: 6, sort: 'updatedAt,desc' }).subscribe({
      next: (page) => {
        this.recent = page.content;
        this.totalEntries = page.totalElements;
        this.loadingRecent = false;
      },
      error: () => this.loadingRecent = false
    });

    this.userMediaService.getUpcoming().subscribe({
      next: (items) => { this.upcoming = items.slice(0, 4); this.loadingUpcoming = false; },
      error: () => this.loadingUpcoming = false
    });

    this.notificationService.getUnreadCount().subscribe(count => this.unreadCount = count);
  }

  getRatingStars(rating: number | null): string {
    if (!rating) return '';
    return '⭐'.repeat(rating);
  }
}
