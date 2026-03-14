import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { MediaType } from '../models/media/media-type.interface';

@Injectable({ providedIn: 'root' })
export class MediaTypeService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiPath}/v1/media-types`;

  getAll() {
    return this.http.get<MediaType[]>(this.BASE);
  }

  getMy() {
    return this.http.get<MediaType[]>(`${this.BASE}/my`);
  }

  create(name: string) {
    return this.http.post<MediaType>(this.BASE, { name });
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }
}
