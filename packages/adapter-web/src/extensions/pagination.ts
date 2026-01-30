/**
 * Web pagination - cursor-based for infinite scroll
 */
export interface WebPaginationParams {
  cursor?: string;
  limit: number;
}

export interface WebPaginatedResponse<T> {
  data: T[];
  pagination: {
    hasMore: boolean;
    nextCursor: string | null;
  };
}

export function parseWebPagination(query: any): WebPaginationParams {
  return {
    cursor: query.cursor as string | undefined,
    limit: Math.min(parseInt(query.limit) || 20, 100),
  };
}

export function wrapWebPagination<T>(
  items: T[],
  hasMore: boolean,
  getCursor: (item: T) => string
): WebPaginatedResponse<T> {
  return {
    data: items,
    pagination: {
      hasMore,
      nextCursor: hasMore && items.length > 0 ? getCursor(items[items.length - 1]) : null,
    },
  };
}
