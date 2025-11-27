import {
  reviewRepository,
  type QueryOptions,
} from "@/lib/repositories";
import type { ReviewDocument } from "@/lib/models";
import type { PaginatedResult } from "./types";

type ReviewListParams = {
  filters?: QueryOptions["projection"];
  page?: number;
  limit?: number;
  sort?: QueryOptions["sort"];
};

export const reviewService = {
  list: async ({
    filters = {},
    page = 1,
    limit = 20,
    sort = { createdAt: -1 },
  }: ReviewListParams): Promise<PaginatedResult<ReviewDocument>> => {
    return reviewRepository.findAll(filters ?? {}, { page, limit, sort });
  },
  create: (payload: Partial<ReviewDocument>) =>
    reviewRepository.create(payload),
  updateStatus: (
    reviewId: string,
    status: ReviewDocument["status"],
    adminReply?: string
  ) =>
    reviewRepository.update(reviewId, {
      status,
      adminReply: adminReply
        ? {
            message: adminReply,
            repliedAt: new Date(),
          }
        : undefined,
    }),
  delete: (reviewId: string) => reviewRepository.delete(reviewId),
};

