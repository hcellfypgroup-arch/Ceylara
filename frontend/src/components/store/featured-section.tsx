import { SectionHeading } from "@/components/ui/section-heading";
import { ProductGrid } from "@/components/store/product-grid";
import { db } from "@/lib/db";
import { productService } from "@/lib/services";

async function getFeaturedProducts() {
  try {
    await db.connect();
    const products = await productService.getFeaturedProducts();
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
    console.error("Failed to fetch featured products:", error);
    return [];
  }
}

export const FeaturedSection = async () => {
  const products = await getFeaturedProducts();

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="section">
      <div className="container space-y-8">
        <SectionHeading
          eyebrow="Featured"
          title="Editors' picks for this season"
          description="Curated looks blending muted tones, layered textures, and relaxed tailoring."
        />
        <ProductGrid products={products} />
      </div>
    </section>
  );
};

