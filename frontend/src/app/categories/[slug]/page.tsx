import { ProductGrid } from "@/components/store/product-grid";
import { FilterSidebar } from "@/components/store/filter-sidebar";
import { SectionHeading } from "@/components/ui/section-heading";
import { db } from "@/lib/db";
import { categoryService } from "@/lib/services";
import { productRepository } from "@/lib/repositories";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import type { CategoryDocument } from "@/lib/models";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateStaticParams() {
  try {
    await db.connect();
    const categories = await categoryService.getTopLevelCategories();
    return categories.map((category: any) => ({
      slug: String(category.slug || ""),
    }));
  } catch (error) {
    console.error("Failed to generate static params for categories:", error);
    return [];
  }
}

async function getCategoryBySlug(slug: string) {
  try {
    await db.connect();
    const category = await categoryService.getCategoryBySlug(slug);
    return category;
  } catch (error) {
    console.error("Failed to fetch category:", error);
    return null;
  }
}

async function getProductsByCategory(categoryId: string) {
  try {
    await db.connect();
    
    // Convert string ID to ObjectId for proper MongoDB query
    let objectId;
    if (mongoose.Types.ObjectId.isValid(categoryId)) {
      objectId = new mongoose.Types.ObjectId(categoryId);
    } else {
      console.error("Invalid category ID:", categoryId);
      return [];
    }
    
    // Use the repository method directly which handles ObjectId matching correctly
    const result = await productRepository.findByCategory(categoryId, {
      page: 1,
      limit: 100,
      sort: { createdAt: -1 },
    });
    
    console.log(`Found ${result.data?.length || 0} products for category ${categoryId}`);
    return result.data || [];
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const categoryWithId = category as any;
  const categoryId = categoryWithId._id 
    ? (typeof categoryWithId._id === 'object' ? categoryWithId._id.toString() : String(categoryWithId._id))
    : categoryWithId.id || "";

  const products = await getProductsByCategory(categoryId);

  // Fetch categories for the filter sidebar
  let categories: Array<{ _id: string; name: string; slug: string }> = [];
  try {
    await db.connect();
    const rawCategories = await categoryService.getTopLevelCategories();
    categories = rawCategories.map((cat: any) => ({
      _id: typeof cat._id === 'object' && cat._id?.toString ? cat._id.toString() : String(cat._id),
      name: String(cat.name || ''),
      slug: String(cat.slug || ''),
    }));
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }

  // Map products to the format expected by ProductGrid
  const mappedProducts = products.map((product: any) => {
    const variantPrices = product.variants?.map((v: any) => v.price || product.basePrice) || [];
    const minPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : product.basePrice;
    const salePrices = product.variants?.filter((v: any) => v.salePrice).map((v: any) => v.salePrice!) || [];
    const minSalePrice = salePrices.length > 0 ? Math.min(...salePrices) : undefined;

    return {
      id: product._id?.toString() || "",
      slug: product.slug || "",
      title: product.title,
      price: minPrice,
      salePrice: minSalePrice && minSalePrice < minPrice ? minSalePrice : undefined,
      image: product.heroImage || "/placeholder-product.jpg",
      badge: product.isBestSeller ? "Bestseller" : product.isFeatured ? "Featured" : undefined,
      weight: product.weight || 0,
      variants: product.variants?.map((v: any) => ({
        sku: v.sku,
        size: v.size,
        color: v.color,
      })) || [],
    };
  });

  return (
    <section className="section">
      <div className="container space-y-8">
        <SectionHeading
          eyebrow="Category"
          title={category.name || "Collection"}
          description={category.description || "Discover our curated collection."}
        />
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <FilterSidebar categories={categories} />
          <div className="space-y-6">
            {mappedProducts.length > 0 ? (
              <>
                <div className="text-sm text-[var(--muted)]">
                  Showing {mappedProducts.length} product{mappedProducts.length !== 1 ? 's' : ''}
                </div>
                <ProductGrid products={mappedProducts} />
              </>
            ) : (
              <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-12 text-center">
                <p className="text-lg font-semibold">No products found</p>
                <p className="text-sm text-[var(--muted)] mt-2">
                  This category doesn't have any products yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

