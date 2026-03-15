export interface Notification {
  id: number;
  userId: number;
  userMediaId: number | null;
  userMediaTitle: string | null;
  relatedUsername: string | null;
  relatedName: string | null;
  notificationType: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}
