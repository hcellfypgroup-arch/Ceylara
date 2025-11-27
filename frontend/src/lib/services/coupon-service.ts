import {
  couponRepository,
  type QueryOptions,
} from "@/lib/repositories";
import type { CouponDocument } from "@/lib/models";
import type { PaginatedResult } from "./types";

type CouponListParams = {
  filters?: QueryOptions["projection"];
  page?: number;
  limit?: number;
  sort?: QueryOptions["sort"];
};

export const couponService = {
  list: async ({
    filters = {},
    page = 1,
    limit = 20,
    sort = { createdAt: -1 },
  }: CouponListParams): Promise<PaginatedResult<CouponDocument>> => {
    return couponRepository.findAll(filters ?? {}, { page, limit, sort });
  },
  getByCode: (code: string) =>
    couponRepository.findByCode(code),
  create: (payload: Partial<CouponDocument>) => couponRepository.create(payload),
  update: (id: string, payload: Partial<CouponDocument>) =>
    couponRepository.update(id, payload),
  delete: (id: string) => couponRepository.delete(id),
  markUsage: (code: string) => couponRepository.incrementUsage(code),
};

