import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Status } from '../models/media/status.interface';

@Injectable({ providedIn: 'root' })
export class StatusService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiPath}/v1/statuses`;

  getAll() {
    return this.http.get<Status[]>(this.BASE);
  }

  getMy() {
    return this.http.get<Status[]>(`${this.BASE}/my`);
  }

  create(name: string) {
    return this.http.post<Status>(this.BASE, { name });
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }
}
