import type { UpdateQuery } from "mongoose";
import { productRepository } from "@/lib/repositories";
import type { ProductFilters } from "@/lib/repositories/product-repository";
import type { QueryOptions } from "@/lib/repositories/types";
import type { ProductDocument } from "@/lib/models";
import type { PaginatedResult, ServiceResult } from "./types";

export type ProductListParams = {
  filters?: ProductFilters;
  page?: number;
  limit?: number;
  sort?: QueryOptions["sort"];
};

export const productService = {
  list: async ({
    filters = {},
    page = 1,
    limit = 12,
    sort = { createdAt: -1 },
  }: ProductListParams): Promise<PaginatedResult<ProductDocument>> => {
    return productRepository.findAll(filters as any, { page, limit, sort });
  },
  getById: (id: string, options?: QueryOptions) =>
    productRepository.findById(id),
  getBySlug: (slug: string, options?: QueryOptions) =>
    productRepository.findBySlug(slug),
  create: async (
    payload: Partial<ProductDocument>
  ): Promise<ServiceResult<ProductDocument>> => {
    const document = await productRepository.create(payload);
    return { data: document };
  },
  update: (id: string, payload: UpdateQuery<ProductDocument>) =>
    productRepository.update(id, payload),
  remove: (id: string) => productRepository.delete(id),
  setInventory: (productId: string, sku: string, stock: number) =>
    productRepository.update(
      productId,
      {
        $set: {
          "variants.$[variant].stock": stock,
        },
      } as UpdateQuery<ProductDocument>
    ),
};

