import { MediaType } from './media-type.interface';
import { Status } from './status.interface';

export type Recommendation = 'RECOMMEND' | 'NEUTRAL' | 'NOT_RECOMMEND';
export type Visibility = 'PUBLIC' | 'PRIVATE';

export interface UserMedia {
  id: number;
  userId: number;
  title: string;
  mediaType: MediaType;
  status: Status;
  rating: number | null;
  feeling: string | null;
  recommendation: Recommendation | null;
  startDate: string | null;
  endDate: string | null;
  nextReleaseDate: string | null;
  notes: string | null;
  review: string | null;
  visibility: Visibility;
  createdAt: string;
  updatedAt: string;
}

export interface UserMediaCreateDTO {
  title: string;
  mediaTypeId: number;
  statusId: number;
  rating?: number | null;
  feeling?: string | null;
  recommendation?: Recommendation | null;
  startDate?: string | null;
  endDate?: string | null;
  nextReleaseDate?: string | null;
  notes?: string | null;
  review?: string | null;
  visibility?: Visibility;
}

export interface UserMediaUpdateDTO extends UserMediaCreateDTO {}
