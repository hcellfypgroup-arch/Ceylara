import { ProductModel, type ProductDocument } from "@/lib/models";
import type { PaginationOptions, PaginatedResult } from "./_types";
import { paginate, buildFilter } from "./_utils";

export class ProductRepository {
  async findById(id: string): Promise<ProductDocument | null> {
    return ProductModel.findById(id).populate("categories").populate("types").lean() as Promise<ProductDocument | null>;
  }

  async findBySlug(slug: string): Promise<ProductDocument | null> {
    return ProductModel.findOne({ slug }).populate("categories").populate("types").lean() as Promise<ProductDocument | null>;
  }

  async create(data: Partial<ProductDocument>): Promise<ProductDocument> {
    const product = await ProductModel.create(data);
    return product.toObject();
  }

  async update(id: string, data: Partial<ProductDocument>): Promise<ProductDocument | null> {
    const product = await ProductModel.findByIdAndUpdate(id, data, { new: true }).lean() as ProductDocument | null;
    return product;
  }

  async delete(id: string): Promise<boolean> {
    const result = await ProductModel.findByIdAndDelete(id);
    return !!result;
  }

  async findAll(
    filters: Record<string, unknown> = {},
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<ProductDocument>> {
    const filter = buildFilter(filters);
    const query = ProductModel.find(filter).populate("categories").populate("types");
    return paginate<ProductDocument>(query, options);
  }

  async search(query: string, limit = 12): Promise<ProductDocument[]> {
    const result = await ProductModel.find({ $text: { $search: query } })
      .limit(limit)
      .lean();
    return result as unknown as ProductDocument[];
  }

  async findFeatured(): Promise<ProductDocument[]> {
    const result = await ProductModel.find({ isFeatured: true })
      .populate("categories")
      .populate("types")
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();
    return result as unknown as ProductDocument[];
  }

  async findBestSellers(): Promise<ProductDocument[]> {
    const result = await ProductModel.find({ isBestSeller: true })
      .populate("categories")
      .populate("types")
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();
    return result as unknown as ProductDocument[];
  }

  async updateStock(variantSku: string, quantity: number): Promise<boolean> {
    const result = await ProductModel.updateOne(
      { "variants.sku": variantSku },
      { $inc: { "variants.$.stock": quantity } }
    );
    return result.modifiedCount > 0;
  }

  async findByCategory(
    categoryId: string,
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<ProductDocument>> {
    // Convert string ID to ObjectId if needed, and use $in since categories is an array
    const mongoose = await import("mongoose");
    let objectId;
    if (mongoose.Types.ObjectId.isValid(categoryId)) {
      objectId = new mongoose.Types.ObjectId(categoryId);
    } else {
      objectId = categoryId;
    }
    // Use $in operator to match products where categories array contains this category
    const query = ProductModel.find({ categories: { $in: [objectId] } });
    return paginate<ProductDocument>(query, options);
  }

  async countByCategory(categoryId: string): Promise<number> {
    // Convert string ID to ObjectId if needed, and use $in since categories is an array
    const mongoose = await import("mongoose");
    let objectId;
    if (mongoose.Types.ObjectId.isValid(categoryId)) {
      objectId = new mongoose.Types.ObjectId(categoryId);
    } else {
      objectId = categoryId;
    }
    // Use $in operator to match products where categories array contains this category
    return ProductModel.countDocuments({ categories: { $in: [objectId] } });
  }

  async updateRating(productId: string, rating: number, ratingCount: number): Promise<boolean> {
    const result = await ProductModel.updateOne(
      { _id: productId },
      { $set: { rating, ratingCount } }
    );
    return result.modifiedCount > 0;
  }

  async findRandom(limit: number = 8, excludeId?: string): Promise<ProductDocument[]> {
    const filter: any = {};
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    
    // Get total count
    const total = await ProductModel.countDocuments(filter);
    if (total === 0) return [];
    
    // Get random products using skip with random offset
    const randomSkip = Math.floor(Math.random() * Math.max(0, total - limit));
    const products = await ProductModel.find(filter)
      .populate("categories")
      .skip(randomSkip)
      .limit(limit * 2) // Get more than needed for better randomization
      .lean();
    
    // Shuffle and return limited amount
    const typedProducts = products as unknown as ProductDocument[];
    const shuffled = [...typedProducts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  }
}

export const productRepository = new ProductRepository();

