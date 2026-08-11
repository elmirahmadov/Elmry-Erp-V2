export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getPaginationOptions = (query: any): PaginationOptions => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  return { page: Math.max(1, page), limit: Math.max(1, Math.min(limit, 100)) };
};

export const paginate = <T>(
  data: T[],
  total: number,
  options: PaginationOptions,
): PaginatedResult<T> => {
  const { page, limit } = options;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = data.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    total,
    page,
    limit,
    totalPages,
  };
};
