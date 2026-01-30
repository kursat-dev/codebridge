/**
 * Mobile pagination - offset-based with total count
 */
export interface MobilePaginationParams {
  offset: number;
  limit: number;
}

export interface MobilePaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    offset: number;
    limit: number;
    hasMore: boolean;
  };
}

export function parseMobilePagination(query: any): MobilePaginationParams {
  return {
    offset: parseInt(query.offset) || 0,
    limit: Math.min(parseInt(query.limit) || 20, 100),
  };
}

export function wrapMobilePagination<T>(
  items: T[],
  total: number,
  offset: number,
  limit: number
): MobilePaginatedResponse<T> {
  return {
    data: items,
    pagination: {
      total,
      offset,
      limit,
      hasMore: offset + items.length < total,
    },
  };
}
