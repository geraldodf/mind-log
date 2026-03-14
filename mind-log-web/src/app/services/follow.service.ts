import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface FollowStats { followersCount: number; followingCount: number; isFollowing: boolean; }
export interface FollowDTO { id: number; followerId: number; followerUsername: string; followerPicture: string | null; followingId: number; followingUsername: string; followingPicture: string | null; createdAt: string; }

@Injectable({ providedIn: 'root' })
export class FollowService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiPath}/v1/follows`;

  follow(username: string) { return this.http.post<void>(`${this.BASE}/${username}`, {}); }
  unfollow(username: string) { return this.http.delete<void>(`${this.BASE}/${username}`); }
  getStats(username: string) { return this.http.get<FollowStats>(`${this.BASE}/${username}/stats`); }
  getFollowers(username: string) { return this.http.get<FollowDTO[]>(`${this.BASE}/${username}/followers`); }
  getFollowing(username: string) { return this.http.get<FollowDTO[]>(`${this.BASE}/${username}/following`); }
}
