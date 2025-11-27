import type { FilterQuery, UpdateQuery } from "mongoose";
import { ReviewModel, type ReviewDocument } from "@/lib/models";
import { applyQueryOptions, withLean } from "./utils";
import type { QueryOptions } from "./types";

type ReviewFilters = FilterQuery<ReviewDocument>;

export const reviewRepository = {
  findById: (id: string, options?: QueryOptions) => {
    const query = ReviewModel.findById(id);
    applyQueryOptions(query, options);
    return withLean(query, options?.lean ?? true);
  },
  search: (filters: ReviewFilters = {}, options?: QueryOptions) => {
    const query = ReviewModel.find(filters);
    applyQueryOptions(query, options);
    return withLean(query, options?.lean ?? true);
  },
  count: (filters: ReviewFilters = {}) => ReviewModel.countDocuments(filters),
  create: (payload: Partial<ReviewDocument>) => ReviewModel.create(payload),
  updateById: (id: string, payload: UpdateQuery<ReviewDocument>) =>
    ReviewModel.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).lean(),
  deleteById: (id: string) => ReviewModel.findByIdAndDelete(id).lean(),
};

