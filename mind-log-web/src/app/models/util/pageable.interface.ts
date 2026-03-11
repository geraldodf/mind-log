export interface Pageable<T> {
  first: boolean;
  last: boolean;
  totalPages: number;
  totalElements: number;
  pageNumber: number;
  size: number;
  content: T[];
}
