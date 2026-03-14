import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { PublicProfile } from '../models/user/public-profile.interface';
import { UserMedia } from '../models/media/user-media.interface';
import { Pageable } from '../models/util/pageable.interface';

@Injectable({ providedIn: 'root' })
export class PublicProfileService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiPath}/v1/profiles`;

  getProfile(username: string) { return this.http.get<PublicProfile>(`${this.BASE}/${username}`); }

  getPublicMedia(username: string, mediaTypeId?: number, statusId?: number, page = 0, size = 12) {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (mediaTypeId) params = params.set('mediaTypeId', mediaTypeId.toString());
    if (statusId) params = params.set('statusId', statusId.toString());
    return this.http.get<Pageable<UserMedia>>(`${this.BASE}/${username}/media`, { params });
  }
}
