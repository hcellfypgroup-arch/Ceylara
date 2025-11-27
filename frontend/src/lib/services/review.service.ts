import { reviewRepository, productRepository } from "@/lib/repositories";
import { productService } from "./product.service";
import type { ReviewDocument } from "@/lib/models";

export class ReviewService {
  async createReview(data: {
    productId: string;
    userId: string;
    rating: number;
    title: string;
    comment: string;
    images?: string[];
  }) {
    const product = await productRepository.findById(data.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const mongoose = await import("mongoose");
    const productId = new mongoose.default.Types.ObjectId(data.productId);
    const review = await reviewRepository.create({
      product: productId as any,
      user: data.userId ? new mongoose.default.Types.ObjectId(data.userId) : undefined as any,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      images: data.images || [],
      status: "pending",
    });

    // Update product rating
    await productService.updateProductRating(data.productId);

    return review;
  }

  async getReviewById(id: string) {
    const review = await reviewRepository.findById(id);
    if (!review) {
      throw new Error("Review not found");
    }
    return review;
  }

  async getProductReviews(productId: string, page = 1, limit = 10) {
    return reviewRepository.findByProduct(productId, { page, limit });
  }

  async getUserReviews(userId: string) {
    return reviewRepository.findByUser(userId);
  }

  async getAllReviews(filters: Record<string, unknown> = {}, page = 1, limit = 10) {
    return reviewRepository.findAll(filters, { page, limit });
  }

  async approveReview(id: string) {
    const review = await reviewRepository.findById(id);
    if (!review) {
      throw new Error("Review not found");
    }

    await reviewRepository.updateStatus(id, "approved");
    
    // Update product rating
    await productService.updateProductRating(review.product.toString());

    return reviewRepository.findById(id);
  }

  async rejectReview(id: string) {
    return reviewRepository.updateStatus(id, "blocked");
  }

  async updateReview(id: string, data: Partial<ReviewDocument>) {
    return reviewRepository.update(id, data);
  }

  async deleteReview(id: string) {
    const review = await reviewRepository.findById(id);
    if (!review) {
      throw new Error("Review not found");
    }

    const productId = review.product.toString();
    await reviewRepository.delete(id);

    // Update product rating
    await productService.updateProductRating(productId);
  }
}

export const reviewService = new ReviewService();


