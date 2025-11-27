import type { FilterQuery, UpdateQuery } from "mongoose";
import { CouponModel, type CouponDocument } from "@/lib/models";
import { applyQueryOptions, withLean } from "./utils";
import type { QueryOptions } from "./types";

type CouponFilters = FilterQuery<CouponDocument>;

export const couponRepository = {
  findById: (id: string, options?: QueryOptions) => {
    const query = CouponModel.findById(id);
    applyQueryOptions(query, options);
    return withLean(query, options?.lean ?? true);
  },
  findByCode: (code: string, options?: QueryOptions) => {
    const query = CouponModel.findOne({ code });
    applyQueryOptions(query, options);
    return withLean(query, options?.lean ?? true);
  },
  search: (filters: CouponFilters = {}, options?: QueryOptions) => {
    const query = CouponModel.find(filters);
    applyQueryOptions(query, options);
    return withLean(query, options?.lean ?? true);
  },
  count: (filters: CouponFilters = {}) => CouponModel.countDocuments(filters),
  create: (payload: Partial<CouponDocument>) => CouponModel.create(payload),
  updateById: (id: string, payload: UpdateQuery<CouponDocument>) =>
    CouponModel.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).lean(),
  deleteById: (id: string) => CouponModel.findByIdAndDelete(id).lean(),
  incrementUsage: (id: string) =>
    CouponModel.findByIdAndUpdate(
      id,
      { $inc: { usedCount: 1 } },
      { new: true }
    ).lean(),
};

