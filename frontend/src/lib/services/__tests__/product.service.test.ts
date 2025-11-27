import { describe, it, expect, beforeEach, vi } from "vitest";
import { productService } from "../product.service";
import { productRepository } from "@/lib/repositories";

// Mock the repository
vi.mock("@/lib/repositories", () => ({
  productRepository: {
    findBySlug: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("ProductService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a product with generated slug", async () => {
    const productData = {
      title: "Test Product",
      basePrice: 29.99,
      variants: [],
    };

    vi.mocked(productRepository.findBySlug).mockResolvedValue(null);
    vi.mocked(productRepository.create).mockResolvedValue({
      ...productData,
      slug: "test-product",
      _id: "123",
    } as any);

    const result = await productService.createProduct(productData);

    expect(result.slug).toBe("test-product");
    expect(productRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Test Product",
        slug: "test-product",
      })
    );
  });

  it("should throw error if slug already exists", async () => {
    const productData = {
      title: "Test Product",
      basePrice: 29.99,
      variants: [],
    };

    vi.mocked(productRepository.findBySlug).mockResolvedValue({
      _id: "123",
      slug: "test-product",
    } as any);

    await expect(productService.createProduct(productData)).rejects.toThrow(
      "Product with this slug already exists"
    );
  });

  it("should get product by slug", async () => {
    const mockProduct = {
      _id: "123",
      slug: "test-product",
      title: "Test Product",
    };

    vi.mocked(productRepository.findBySlug).mockResolvedValue(mockProduct as any);

    const result = await productService.getProductBySlug("test-product");

    expect(result).toEqual(mockProduct);
    expect(productRepository.findBySlug).toHaveBeenCalledWith("test-product");
  });

  it("should throw error if product not found", async () => {
    vi.mocked(productRepository.findBySlug).mockResolvedValue(null);

    await expect(productService.getProductBySlug("non-existent")).rejects.toThrow(
      "Product not found"
    );
  });
});










