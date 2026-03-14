import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface SuggestionDTO {
  id: number;
  userId: number | null;
  username: string;
  content: string;
  status: 'PENDING' | 'REVIEWED' | 'IMPLEMENTED' | 'REJECTED';
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class SuggestionService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiPath}/v1/suggestions`;

  submit(content: string) {
    return this.http.post<SuggestionDTO>(this.BASE, { content });
  }

  getAll(page = 0, size = 20) {
    return this.http.get<any>(`${this.BASE}?page=${page}&size=${size}`);
  }

  updateStatus(id: number, status: string) {
    return this.http.patch<SuggestionDTO>(`${this.BASE}/${id}/status?status=${status}`, {});
  }
}
