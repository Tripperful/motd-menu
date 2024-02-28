export type SortDirection = 'asc' | 'desc';

export type PagedData<T> = {
  data: T[];
  total: number;
};
