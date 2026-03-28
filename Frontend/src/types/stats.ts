

export interface PaginatedResponse<T> {
  totalRows: number;
  data: T[];
}