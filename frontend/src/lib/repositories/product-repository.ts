import type {
  FilterQuery,
  ProjectionType,
  UpdateQuery,
} from "mongoose";
import { ProductModel, type ProductDocument } from "@/lib/models";
import { applyQueryOptions, withLean } from "./utils";
import type { QueryOptions } from "./types";

export type ProductFilters = FilterQuery<ProductDocument>;

type UpdateOptions = {
  arrayFilters?: Record<string, unknown>[];
};

export const productRepository = {
  findById: (id: string, options?: QueryOptions) => {
    const query = ProductModel.findById(id);
    if (options?.projection) {
      query.select(options.projection as ProjectionType<ProductDocument>);
    }
    applyQueryOptions(query, options);
    return withLean(query, options?.lean ?? true);
  },
  findBySlug: (slug: string, options?: QueryOptions) => {
    const query = ProductModel.findOne({ slug });
    applyQueryOptions(query, options);
    return withLean(query, options?.lean ?? true);
  },
  search: (filters: ProductFilters, options?: QueryOptions) => {
    const query = ProductModel.find(filters);
    applyQueryOptions(query, options);
    return withLean(query, options?.lean ?? true);
  },
  count: (filters: ProductFilters = {}) => {
    return ProductModel.countDocuments(filters);
  },
  create: (payload: Partial<ProductDocument>) => {
    return ProductModel.create(payload);
  },
  updateById: (
    id: string,
    payload: UpdateQuery<ProductDocument>,
    options?: UpdateOptions
  ) => {
    return ProductModel.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
      ...options,
    }).lean();
  },
  deleteById: (id: string) => {
    return ProductModel.findByIdAndDelete(id).lean();
  },
};

