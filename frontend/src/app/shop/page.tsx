import { FilterSidebar } from "@/components/store/filter-sidebar";
import { SortBar } from "@/components/store/sort-bar";
import { ProductGrid } from "@/components/store/product-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { db } from "@/lib/db";
import { categoryService } from "@/lib/services";
import type { ProductDocument } from "@/lib/models";

type ProductResponse = {
  data: ProductDocument[];
  total: number;
  page: number;
  limit: number;
};

const fetchProducts = async (
  searchParams: Promise<Record<string, string | string[] | undefined>>
): Promise<ProductResponse> => {
  const resolvedParams = await searchParams;
  const params = new URLSearchParams();
  
  Object.entries(resolvedParams).forEach(([key, value]) => {
    if (!value) return;
    if (Array.isArray(value)) {
      // For arrays, join with comma or append multiple times
      if (value.length > 0) {
        params.set(key, value.join(","));
      }
    } else {
      params.set(key, String(value));
    }
  });

  // Use relative URL for server-side fetching
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = `${baseUrl}/api/products${params.toString() ? `?${params.toString()}` : ""}`;
  
  try {
    const response = await fetch(url, {
      next: { revalidate: 60 },
      cache: "no-store",
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      throw new Error(`Failed to load products: ${response.status}`);
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  let products: ProductResponse["data"] = [];
  let total = 0;
  let currentPage = 1;
  let limit = 12;
  
  try {
    const payload = await fetchProducts(searchParams);
    products = payload.data || [];
    total = payload.total || 0;
    currentPage = payload.page || 1;
    limit = payload.limit || 12;
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }

  // Fetch categories and types for the filter sidebar
  let categories: Array<{ _id: string; name: string; slug: string }> = [];
  let types: Array<{ _id: string; name: string; slug: string }> = [];
  try {
    await db.connect();
    
    // Fetch top-level categories
    const rawCategories = await categoryService.getTopLevelCategories();
    categories = rawCategories.map((cat: any) => {
      const catId = typeof cat._id === 'object' && cat._id?.toString ? cat._id.toString() : String(cat._id);
      return {
        _id: catId,
        name: String(cat.name || ''),
        slug: String(cat.slug || ''),
      };
    });
    
    // Fetch independent types
    const { typeService } = await import("@/lib/services");
    const rawTypes = await typeService.getAllTypes();
    // Remove duplicates by name (case-insensitive) and keep only unique types
    const uniqueTypesMap = new Map<string, { _id: string; name: string; slug: string }>();
    rawTypes.forEach((type: any) => {
      const typeId = typeof type._id === 'object' && type._id?.toString ? type._id.toString() : String(type._id);
      const typeName = String(type.name || '').trim();
      const normalizedName = typeName.toLowerCase();
      
      // Only add if we haven't seen this name before (case-insensitive)
      if (!uniqueTypesMap.has(normalizedName)) {
        uniqueTypesMap.set(normalizedName, {
          _id: typeId,
          name: typeName,
          slug: String(type.slug || ''),
        });
      }
    });
    
    types = Array.from(uniqueTypesMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );
  } catch (error) {
    console.error("Failed to fetch categories and types:", error);
  }

  const mappedProducts = products.map((product) => {
    // Get the minimum price from variants
    const variantPrices = product.variants?.map((v) => v.price || product.basePrice) || [];
    const minPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : product.basePrice;
    
    // Get the minimum sale price if any variant has a sale
    const salePrices = product.variants?.filter((v) => v.salePrice).map((v) => v.salePrice!) || [];
    const minSalePrice = salePrices.length > 0 ? Math.min(...salePrices) : undefined;
    
    return {
      id: (product as any)._id?.toString() || "",
      slug: product.slug || "",
      title: product.title,
      price: minPrice,
      salePrice: minSalePrice && minSalePrice < minPrice ? minSalePrice : undefined,
      image: product.heroImage || "/placeholder-product.jpg",
      badge: product.isBestSeller ? "Bestseller" : product.isFeatured ? "Featured" : undefined,
      weight: product.weight || 0,
      variants: product.variants?.map((v) => ({
        sku: v.sku,
        size: v.size,
        color: v.color,
      })) || [],
    };
  });

  const totalPages = Math.ceil(total / limit);
  const resolvedParams = await searchParams;
  
  // Build pagination URLs preserving current filters
  const buildPaginationUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(resolvedParams).forEach(([key, value]) => {
      if (key === "page") return; // Skip page param, we'll set it
      if (!value) return;
      if (Array.isArray(value)) {
        value.forEach((item) => params.append(key, String(item)));
      } else {
        params.set(key, String(value));
      }
    });
    params.set("page", String(page));
    return `/shop?${params.toString()}`;
  };

  return (
    <section className="section">
      <div className="container space-y-4 md:space-y-8">
        <SectionHeading
          eyebrow="Shop"
          title="All womenswear pieces"
          description="Use rich filters for categories, sizes, colors, materials, sleeve length, style, and price."
        />
        <SortBar />
        <div className="grid gap-4 md:gap-8 lg:grid-cols-[280px_1fr]">
          <FilterSidebar categories={categories} types={types} />
          <div className="space-y-4 md:space-y-6">
            {mappedProducts.length > 0 ? (
              <>
                <div className="text-xs md:text-sm text-[var(--muted)]">
                  Showing {((currentPage - 1) * limit) + 1}-{Math.min(currentPage * limit, total)} of {total} products
                </div>
                <ProductGrid products={mappedProducts} />
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      {currentPage > 1 && (
                        <a
                          href={buildPaginationUrl(currentPage - 1)}
                          className="rounded-md border border-[var(--border)] bg-white px-3 md:px-4 py-2 text-xs md:text-sm font-medium hover:bg-[var(--accent)] transition active:scale-95"
                        >
                          ← Prev
                        </a>
                      )}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum: number;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <a
                              key={pageNum}
                              href={buildPaginationUrl(pageNum)}
                              className={`rounded-md px-2.5 md:px-3 py-2 text-xs md:text-sm font-medium transition min-w-[36px] text-center ${
                                pageNum === currentPage
                                  ? "bg-[var(--primary)] text-white"
                                  : "border border-[var(--border)] bg-white hover:bg-[var(--accent)]"
                              }`}
                            >
                              {pageNum}
                            </a>
                          );
                        })}
                      </div>
                      {currentPage < totalPages && (
                        <a
                          href={buildPaginationUrl(currentPage + 1)}
                          className="rounded-md border border-[var(--border)] bg-white px-3 md:px-4 py-2 text-xs md:text-sm font-medium hover:bg-[var(--accent)] transition active:scale-95"
                        >
                          Next →
                        </a>
                      )}
                    </div>
                    <span className="text-xs md:text-sm text-[var(--muted)] text-center">
                      ({total} products)
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 text-center">
                <p className="text-lg text-[var(--muted)]">No products found</p>
                <p className="text-sm text-[var(--muted)] mt-2">
                  Try adjusting your filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

