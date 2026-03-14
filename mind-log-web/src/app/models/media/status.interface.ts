export interface Status {
  id: number;
  name: string;
  isSystem: boolean;
  userId: number | null;
  createdAt: string;
}
