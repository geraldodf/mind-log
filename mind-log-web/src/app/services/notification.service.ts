import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Notification } from '../models/media/notification.interface';
import { Pageable } from '../models/util/pageable.interface';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiPath}/v1/notifications`;

  getAll(page = 0, size = 20) {
    return this.http.get<Pageable<Notification>>(`${this.BASE}?page=${page}&size=${size}`);
  }

  getUnreadCount() {
    return this.http.get<number>(`${this.BASE}/unread-count`);
  }

  markAsRead(id: number) {
    return this.http.patch<void>(`${this.BASE}/${id}/read`, {});
  }

  markAllAsRead() {
    return this.http.patch<void>(`${this.BASE}/read-all`, {});
  }
}
