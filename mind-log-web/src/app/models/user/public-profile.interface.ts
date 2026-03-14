export interface PublicProfile {
  id: number;
  username: string;
  name: string;
  picture: string | null;
  followersCount: number;
  followingCount: number;
  publicMediaCount: number;
  createdAt: string;
}
