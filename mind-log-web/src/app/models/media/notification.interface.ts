export interface Notification {
  id: number;
  userId: number;
  userMediaId: number;
  userMediaTitle: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
