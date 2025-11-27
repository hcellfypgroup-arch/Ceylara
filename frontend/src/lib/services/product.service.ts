import { productRepository, reviewRepository } from "@/lib/repositories";
import type { ProductDocument } from "@/lib/models";
import { slugify } from "@/lib/utils";

export class ProductService {
  async createProduct(data: Partial<ProductDocument>) {
    if (!data.slug) {
      data.slug = slugify(data.title || "");
    }

    const existing = await productRepository.findBySlug(data.slug);
    if (existing) {
      throw new Error("Product with this slug already exists");
    }

    // Convert category and type string IDs to ObjectIds
    const mongoose = await import("mongoose");
    if (data.categories !== undefined) {
      if (Array.isArray(data.categories) && data.categories.length > 0) {
        data.categories = data.categories.map((cat: any) => {
          if (typeof cat === 'string' && mongoose.Types.ObjectId.isValid(cat)) {
            return new mongoose.Types.ObjectId(cat) as any;
          }
          return cat;
        });
      } else {
        data.categories = [];
      }
    }
    if (data.types !== undefined) {
      if (Array.isArray(data.types) && data.types.length > 0) {
        data.types = data.types.map((type: any) => {
          if (typeof type === 'string' && mongoose.Types.ObjectId.isValid(type)) {
            return new mongoose.Types.ObjectId(type) as any;
          }
          return type;
        });
      } else {
        data.types = [];
      }
    }

    return productRepository.create(data);
  }

  async updateProduct(id: string, data: Partial<ProductDocument>) {
    if (data.title && !data.slug) {
      data.slug = slugify(data.title);
    }

    if (data.slug) {
      const existing = await productRepository.findBySlug(data.slug);
      const existingId = (existing as any)?._id?.toString() || (existing as any)?.id;
      if (existing && existingId !== id) {
        throw new Error("Product with this slug already exists");
      }
    }

    // Convert category and type string IDs to ObjectIds
    const mongoose = await import("mongoose");
    if (data.categories !== undefined) {
      if (Array.isArray(data.categories) && data.categories.length > 0) {
        data.categories = data.categories.map((cat: any) => {
          if (typeof cat === 'string' && mongoose.Types.ObjectId.isValid(cat)) {
            return new mongoose.Types.ObjectId(cat) as any;
          }
          return cat;
        });
      } else {
        data.categories = [];
      }
    }
    if (data.types !== undefined) {
      if (Array.isArray(data.types) && data.types.length > 0) {
        data.types = data.types.map((type: any) => {
          if (typeof type === 'string' && mongoose.Types.ObjectId.isValid(type)) {
            return new mongoose.Types.ObjectId(type) as any;
          }
          return type;
        });
      } else {
        data.types = [];
      }
    }

    return productRepository.update(id, data);
  }

  async deleteProduct(id: string) {
    return productRepository.delete(id);
  }

  async getProductBySlug(slug: string) {
    const product = await productRepository.findBySlug(slug);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  }

  async getProductById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  }

  async searchProducts(query: string, limit = 12) {
    return productRepository.search(query, limit);
  }

  async getFeaturedProducts() {
    return productRepository.findFeatured();
  }

  async getBestSellers() {
    return productRepository.findBestSellers();
  }

  async updateProductRating(productId: string) {
    const { rating, count } = await reviewRepository.getAverageRating(productId);
    await productRepository.updateRating(productId, rating, count);
    return { rating, count };
  }

  async findAll(filters: Record<string, unknown> = {}, options: any = {}) {
    return productRepository.findAll(filters, options);
  }

  async list(params: {
    filters?: Record<string, unknown>;
    page?: number;
    limit?: number;
    sort?: Record<string, 1 | -1>;
  }) {
    const { filters = {}, page = 1, limit = 12, sort = { createdAt: -1 } } = params;
    return productRepository.findAll(filters, { page, limit, sort });
  }

  async checkStock(variantSku: string, quantity: number): Promise<boolean> {
    // Use MongoDB query to find product with matching variant SKU
    const { ProductModel } = await import("@/lib/models");
    const product = await ProductModel.findOne({ "variants.sku": variantSku }).lean();
    if (!product) return false;

    const productDoc = product as any;
    const variant = productDoc.variants?.find((v: any) => v.sku === variantSku);
    return variant && variant.stock >= quantity;
  }

  async reduceStock(variantSku: string, quantity: number) {
    return productRepository.updateStock(variantSku, -quantity);
  }

  async restoreStock(variantSku: string, quantity: number) {
    return productRepository.updateStock(variantSku, quantity);
  }

  async getRandomProducts(limit: number = 8, excludeId?: string) {
    return productRepository.findRandom(limit, excludeId);
  }
}

export const productService = new ProductService();

