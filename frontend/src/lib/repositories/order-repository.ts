import type { FilterQuery, UpdateQuery } from "mongoose";
import { OrderModel, type OrderDocument } from "@/lib/models";
import { applyQueryOptions, withLean } from "./utils";
import type { QueryOptions } from "./types";

type OrderFilters = FilterQuery<OrderDocument>;

export const orderRepository = {
  findById: (id: string, options?: QueryOptions) => {
    const query = OrderModel.findById(id);
    applyQueryOptions(query, options);
    return withLean(query, options?.lean ?? true);
  },
  search: (filters: OrderFilters = {}, options?: QueryOptions) => {
    const query = OrderModel.find(filters);
    applyQueryOptions(query, options);
    return withLean(query, options?.lean ?? true);
  },
  count: (filters: OrderFilters = {}) => OrderModel.countDocuments(filters),
  create: (payload: Partial<OrderDocument>) => OrderModel.create(payload),
  updateById: (id: string, payload: UpdateQuery<OrderDocument>) =>
    OrderModel.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).lean(),
};

