export interface BackendErrorResponse {
  message?: string;
  statusCode?: number;
}

export const PAGINATION_ALL = {
  pageIndex: 0,
  pageSize: 999,
  filterColumn: null,
  filterQuery: null,
  sortColumn: "currencyCode",
  sortOrder: "asc",
};
