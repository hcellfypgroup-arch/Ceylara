import type { PaginationOptions, PaginatedResult } from "./_types";

export const paginate = async <T>(
  query: any,
  options: PaginationOptions = {}
): Promise<PaginatedResult<T>> => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 12;
  const sort = options.sort ?? { createdAt: -1 };

  const [data, total] = await Promise.all([
    query.clone().sort(sort).skip((page - 1) * limit).limit(limit).lean().exec(),
    query.countDocuments(),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const buildFilter = (filters: Record<string, unknown>) => {
  const filter: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") continue;

    if (Array.isArray(value)) {
      if (value.length > 0) {
        filter[key] = { $in: value };
      }
    } else if (typeof value === "object" && value !== null) {
      // Handle MongoDB operators like $in, $gte, etc.
      filter[key] = value;
    } else {
      filter[key] = value;
    }
  }

  return filter;
};


