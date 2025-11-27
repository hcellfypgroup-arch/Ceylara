import type { FilterQuery, UpdateQuery } from "mongoose";
import { CategoryModel, type CategoryDocument } from "@/lib/models";
import { applyQueryOptions, withLean } from "./utils";
import type { QueryOptions } from "./types";

type CategoryFilters = FilterQuery<CategoryDocument>;

export const categoryRepository = {
  findById: (id: string, options?: QueryOptions) => {
    const query = CategoryModel.findById(id);
    applyQueryOptions(query, options);
    return withLean(query, options?.lean ?? true);
  },
  findBySlug: (slug: string, options?: QueryOptions) => {
    const query = CategoryModel.findOne({ slug });
    applyQueryOptions(query, options);
    return withLean(query, options?.lean ?? true);
  },
  search: (filters: CategoryFilters = {}, options?: QueryOptions) => {
    const query = CategoryModel.find(filters);
    applyQueryOptions(query, options);
    return withLean(query, options?.lean ?? true);
  },
  count: (filters: CategoryFilters = {}) => CategoryModel.countDocuments(filters),
  create: (payload: Partial<CategoryDocument>) => CategoryModel.create(payload),
  updateById: (id: string, payload: UpdateQuery<CategoryDocument>) =>
    CategoryModel.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).lean(),
  deleteById: (id: string) => CategoryModel.findByIdAndDelete(id).lean(),
};

