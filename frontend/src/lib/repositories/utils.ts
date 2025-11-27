import type { QueryWithHelpers } from "mongoose";
import type { PaginationOptions, QueryOptions } from "./types";

export const applyPagination = <T extends QueryWithHelpers<any, any, any, any>>(
  query: T,
  options?: PaginationOptions
): T => {
  if (!options) return query;
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.max(1, Math.min(100, options.limit ?? 20));
  return (query as any).skip((page - 1) * limit).limit(limit) as T;
};

export const applyQueryOptions = <
  T extends QueryWithHelpers<any, any, any, any>,
>(query: T, options?: QueryOptions): T => {
  if (!options) return query;
  const q = query as any;
  if (options.sort) {
    q.sort(options.sort);
  }
  if (options.projection) {
    q.select(options.projection);
  }
  return applyPagination(q, options);
};

export const withLean = <T>(
  query: QueryWithHelpers<T | null, any, any, any>,
  lean = true,
) => (lean ? (query.lean() as typeof query) : query);

