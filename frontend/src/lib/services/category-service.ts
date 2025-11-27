import slugify from "slugify";
import {
  categoryRepository,
  type QueryOptions,
} from "@/lib/repositories";
import type { CategoryDocument } from "@/lib/models";
import type { PaginatedResult, ServiceResult } from "./types";

type CategoryListParams = {
  page?: number;
  limit?: number;
  sort?: QueryOptions["sort"];
};

const toSlug = (value: string) =>
  slugify(value, { lower: true, strict: true });

export const categoryService = {
  list: async ({
    page = 1,
    limit = 20,
    sort = { position: 1 },
  }: CategoryListParams): Promise<PaginatedResult<CategoryDocument>> => {
    return categoryRepository.findAll({ page, limit, sort });
  },
  getById: (id: string, options?: QueryOptions) =>
    categoryRepository.findById(id),
  getBySlug: (slug: string, options?: QueryOptions) =>
    categoryRepository.findBySlug(slug),
  create: async (
    payload: Partial<CategoryDocument>
  ): Promise<ServiceResult<CategoryDocument>> => {
    const doc = await categoryRepository.create({
      ...payload,
      slug: payload.slug ?? (payload.name ? toSlug(payload.name) : undefined),
    });
    return { data: doc };
  },
  update: (id: string, payload: Partial<CategoryDocument>) => {
    const nextPayload = { ...payload };
    if (payload.name && !payload.slug) {
      nextPayload.slug = toSlug(payload.name);
    }
    return categoryRepository.update(id, nextPayload);
  },
  remove: (id: string) => categoryRepository.delete(id),
};

