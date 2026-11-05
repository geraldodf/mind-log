import { MediaType } from './media-type.interface';
import { UserMedia } from './user-media.interface';

export interface PlannedGroup {
  mediaType: MediaType;
  items: UserMedia[];
}
