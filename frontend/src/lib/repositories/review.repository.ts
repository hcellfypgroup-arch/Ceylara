import { ReviewModel, type ReviewDocument } from "@/lib/models";
import type { PaginationOptions, PaginatedResult } from "./_types";
import { paginate, buildFilter } from "./_utils";

export class ReviewRepository {
  async findById(id: string): Promise<ReviewDocument | null> {
    return ReviewModel.findById(id).populate("user").populate("product").lean() as Promise<ReviewDocument | null>;
  }

  async create(data: Partial<ReviewDocument>): Promise<ReviewDocument> {
    const review = await ReviewModel.create(data);
    return review.toObject();
  }

  async update(id: string, data: Partial<ReviewDocument>): Promise<ReviewDocument | null> {
    const review = await ReviewModel.findByIdAndUpdate(id, data, { new: true }).lean() as ReviewDocument | null;
    return review;
  }

  async delete(id: string): Promise<boolean> {
    const result = await ReviewModel.findByIdAndDelete(id);
    return !!result;
  }

  async findByProduct(
    productId: string,
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<ReviewDocument>> {
    const query = ReviewModel.find({ product: productId, status: "approved" });
    return paginate<ReviewDocument>(query, options);
  }

  async findAll(
    filters: Record<string, unknown> = {},
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<ReviewDocument>> {
    const filter = buildFilter(filters);
    const query = ReviewModel.find(filter);
    return paginate<ReviewDocument>(query, options);
  }

  async updateStatus(id: string, status: string): Promise<boolean> {
    const result = await ReviewModel.updateOne({ _id: id }, { $set: { status } });
    return result.modifiedCount > 0;
  }

  async getAverageRating(productId: string): Promise<{ rating: number; count: number }> {
    const result = await ReviewModel.aggregate([
      { $match: { product: productId, status: "approved" } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    if (result.length === 0) {
      return { rating: 0, count: 0 };
    }

    return {
      rating: Math.round(result[0].averageRating * 10) / 10,
      count: result[0].count,
    };
  }

  async findByUser(userId: string): Promise<ReviewDocument[]> {
    const result = await ReviewModel.find({ user: userId }).sort({ createdAt: -1 }).lean();
    return result as unknown as ReviewDocument[];
  }
}

export const reviewRepository = new ReviewRepository();


