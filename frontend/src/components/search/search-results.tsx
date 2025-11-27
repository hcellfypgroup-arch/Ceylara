"use client";

import Link from "next/link";
import Image from "next/image";
import { ProductGrid } from "@/components/store/product-grid";
import { Button } from "@/components/ui/button";

type SearchResultsProps = {
  products: Array<{
    _id: string;
    slug: string;
    title: string;
    basePrice: number;
    heroImage?: string;
    variants?: Array<{
      sku: string;
      size?: string;
      color?: string;
      price: number;
      salePrice?: number;
    }>;
  }>;
  categories: Array<{
    _id: string;
    name: string;
    slug: string;
    heroImage?: string;
  }>;
  query: string;
};

export const SearchResults = ({
  products,
  categories,
  query,
}: SearchResultsProps) => {
  // Format products for ProductGrid
  const formattedProducts = products.map((product) => {
    const variantPrices =
      product.variants?.map((v) => v.price || product.basePrice) || [];
    const minPrice =
      variantPrices.length > 0
        ? Math.min(...variantPrices)
        : product.basePrice;
    const salePrices = product.variants
      ?.filter((v) => v.salePrice)
      .map((v) => v.salePrice!) || [];
    const minSalePrice =
      salePrices.length > 0 ? Math.min(...salePrices) : undefined;

    return {
      id: product._id?.toString() || "",
      slug: product.slug || "",
      title: product.title,
      price: minPrice,
      salePrice: minSalePrice && minSalePrice < minPrice ? minSalePrice : undefined,
      image: product.heroImage || "/placeholder-product.jpg",
      weight: (product as any).weight || 0,
      variants: product.variants?.map((v) => ({
        sku: v.sku,
        size: v.size,
        color: v.color,
      })) || [],
    };
  });

  return (
    <section className="section border-t border-[var(--border)] bg-white">
      <div className="container space-y-8">
        {/* Categories Section */}
        {categories.length > 0 && (
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                Categories
              </p>
              <h2 className="text-2xl font-semibold">
                {categories.length} categor{categories.length === 1 ? "y" : "ies"} found
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Link
                  key={category._id}
                  href={`/categories/${category.slug}`}
                  className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white transition hover:shadow-md"
                >
                  {category.heroImage && (
                    <Image
                      src={category.heroImage}
                      alt={category.name}
                      width={400}
                      height={300}
                      className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
                      unoptimized={category.heroImage.startsWith("http")}
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold">{category.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Products Section */}
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Products
            </p>
            <h2 className="text-2xl font-semibold">
              {formattedProducts.length} product{formattedProducts.length !== 1 ? "s" : ""} found
              {query && ` for "${query}"`}
            </h2>
          </div>
          {formattedProducts.length > 0 ? (
            <ProductGrid products={formattedProducts} />
          ) : (
            <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-12 text-center">
              <p className="text-lg font-semibold">No products found</p>
              <p className="text-sm text-[var(--muted)] mt-2">
                Try searching with different keywords or browse our categories.
              </p>
              <Button asChild className="mt-6">
                <Link href="/shop">Browse All Products</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
