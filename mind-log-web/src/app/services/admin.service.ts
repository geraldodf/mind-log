import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface AdminMetrics {
  totalUsers: number;
  newUsersToday: number;
  activeUsersToday: number;
  totalMediaEntries: number;
  mediaCreatedToday: number;
  categoriesCreatedToday: number;
  totalFollows: number;
  totalNotifications: number;
  unreadNotifications: number;
  mostActiveUsers: { userId: number; username: string; picture: string | null; mediaCount: number }[];
}

export interface SystemEvent {
  id: number;
  eventType: string;
  username: string | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiPath}/v1/admin`;

  getMetrics() { return this.http.get<AdminMetrics>(`${this.BASE}/metrics`); }
  getSystemEvents(page = 0, size = 20) { return this.http.get<any>(`${this.BASE}/system-events?page=${page}&size=${size}`); }
}
