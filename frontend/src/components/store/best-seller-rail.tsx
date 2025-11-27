import { ProductCard } from "@/components/store/product-card";
import { db } from "@/lib/db";
import { productService } from "@/lib/services";

async function getBestSellers() {
  try {
    await db.connect();
    const products = await productService.getBestSellers();
    return products.map((product: any) => {
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
  } catch (error) {
    console.error("Failed to fetch best sellers:", error);
    return [];
  }
}

export const BestSellerRail = async () => {
  const products = await getBestSellers();

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="section bg-white">
      <div className="container space-y-3 sm:space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3 sm:gap-4">
          <div>
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Best Sellers
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold">Most loved pieces</h2>
          </div>
          <p className="text-xs sm:text-sm text-[var(--muted)]">
            Curated by admin
          </p>
        </div>
        <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              slug={product.slug}
              title={product.title}
              price={product.price}
              salePrice={product.salePrice}
              image={product.image}
              badge={product.badge}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

