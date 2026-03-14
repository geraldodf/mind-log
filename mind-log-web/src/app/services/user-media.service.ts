import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { UserMedia, UserMediaCreateDTO, UserMediaUpdateDTO } from '../models/media/user-media.interface';
import { Pageable } from '../models/util/pageable.interface';

export interface UserMediaFilter {
  mediaTypeId?: number;
  statusId?: number;
  recommendation?: string;
  page?: number;
  size?: number;
  sort?: string;
}

@Injectable({ providedIn: 'root' })
export class UserMediaService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiPath}/v1/media`;

  getAll(filter: UserMediaFilter = {}) {
    let params = new HttpParams();
    if (filter.mediaTypeId) params = params.set('mediaTypeId', filter.mediaTypeId.toString());
    if (filter.statusId) params = params.set('statusId', filter.statusId.toString());
    if (filter.recommendation) params = params.set('recommendation', filter.recommendation);
    if (filter.page !== undefined) params = params.set('page', filter.page.toString());
    if (filter.size !== undefined) params = params.set('size', filter.size.toString());
    if (filter.sort) params = params.set('sort', filter.sort);
    return this.http.get<Pageable<UserMedia>>(this.BASE, { params });
  }

  getById(id: number) {
    return this.http.get<UserMedia>(`${this.BASE}/${id}`);
  }

  getUpcoming() {
    return this.http.get<UserMedia[]>(`${this.BASE}/upcoming`);
  }

  getFavorites() {
    return this.http.get<UserMedia[]>(`${this.BASE}/favorites`);
  }

  create(dto: UserMediaCreateDTO) {
    return this.http.post<UserMedia>(this.BASE, dto);
  }

  update(id: number, dto: UserMediaUpdateDTO) {
    return this.http.put<UserMedia>(`${this.BASE}/${id}`, dto);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }
}
