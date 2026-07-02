export interface PaginationAPIModel<T> {
  data: T;
  items: T[];
  currentPage: number;
  pageNumber: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  sortColumn: string | null;
  sortOrder: string | null;
  filterColumn: string | null;
  filterOrder: string | null;
}
