import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Pageable } from '../models/util/pageable.interface';
import { environment } from '../../environments/environment';

export interface FollowStats { followersCount: number; followingCount: number; isFollowing: boolean; }
/** Espelha o FollowUserDTO da API. */
export interface FollowUser { userId: number; username: string; name: string; picture: string | null; followedAt: string; }

@Injectable({ providedIn: 'root' })
export class FollowService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiPath}/v1/follows`;

  follow(username: string) { return this.http.post<void>(`${this.BASE}/${username}`, {}); }
  unfollow(username: string) { return this.http.delete<void>(`${this.BASE}/${username}`); }
  getStats(username: string) { return this.http.get<FollowStats>(`${this.BASE}/${username}/stats`); }
  /** Paginado no servidor (20 por página, mais recentes primeiro). */
  getFollowers(username: string, page = 0, size = 20) {
    return this.http.get<Pageable<FollowUser>>(`${this.BASE}/${username}/followers`, { params: new HttpParams().set('page', page).set('size', size) });
  }

  getFollowing(username: string, page = 0, size = 20) {
    return this.http.get<Pageable<FollowUser>>(`${this.BASE}/${username}/following`, { params: new HttpParams().set('page', page).set('size', size) });
  }
}
