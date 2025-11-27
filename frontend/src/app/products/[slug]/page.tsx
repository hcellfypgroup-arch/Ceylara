import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfoPanel } from "@/components/product/product-info-panel";
import { RelatedProducts } from "@/components/product/related-products";
import { TrackProductView } from "@/components/product/track-product-view";
import { db } from "@/lib/db";
import { productService } from "@/lib/services";

async function fetchProduct(slug: string) {
  try {
    await db.connect();
    const product = await productService.getProductBySlug(slug);
    return product;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  if (!product) {
    return (
      <section className="section">
        <div className="container text-center">
          <h1 className="text-2xl font-semibold">Product not found</h1>
          <p className="text-[var(--muted)] mt-2">The product you're looking for doesn't exist.</p>
        </div>
      </section>
    );
  }

  // Use gallery if available, otherwise use heroImage
  let gallery: string[] = [];
  if (product.gallery && product.gallery.length > 0) {
    gallery = product.gallery;
  } else if (product.heroImage) {
    gallery = [product.heroImage];
  } else {
    gallery = ["/placeholder-product.jpg"];
  }

  // Get unique sizes from variants
  const sizes = product.variants
    ?.map((v: any) => v.size)
    .filter((size: any): size is string => Boolean(size))
    .filter((size: string, index: number, self: string[]) => self.indexOf(size) === index) || [];

  // Get variants for add to cart
  const variants = product.variants?.map((v: any) => ({
    sku: v.sku,
    size: v.size,
    color: v.color,
    price: v.salePrice || v.price || product.basePrice,
    stock: v.stock || 0,
  })) || [];

  // Fetch random products for "Curated for you" section
  let randomProducts: Array<{
    id: string;
    slug: string;
    title: string;
    price: number;
    image: string;
  }> = [];
  try {
    await db.connect();
    const productWithId = product as typeof product & { _id?: { toString(): string } | string; id?: string };
    const currentProductId = productWithId?._id 
      ? (typeof productWithId._id === 'object' ? productWithId._id.toString() : String(productWithId._id))
      : productWithId?.id;
    const products = await productService.getRandomProducts(8, currentProductId ? String(currentProductId) : undefined);
    randomProducts = products.map((p: any) => {
      const variantPrices = p.variants?.map((v: any) => v.price || p.basePrice) || [];
      const minPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : p.basePrice;
      const salePrices = p.variants?.filter((v: any) => v.salePrice).map((v: any) => v.salePrice!) || [];
      const minSalePrice = salePrices.length > 0 ? Math.min(...salePrices) : undefined;

      return {
        id: p._id?.toString() || "",
        slug: p.slug || "",
        title: p.title,
        price: minPrice,
        salePrice: minSalePrice && minSalePrice < minPrice ? minSalePrice : undefined,
        image: p.heroImage || "/placeholder-product.jpg",
        weight: p.weight || 0,
        variants: p.variants?.map((v: any) => ({
          sku: v.sku,
          size: v.size,
          color: v.color,
        })) || [],
      };
    });
  } catch (error) {
    console.error("Failed to fetch random products:", error);
  }

  const productWithId = product as typeof product & { _id?: { toString(): string } | string };
  const productId = productWithId._id 
    ? (typeof productWithId._id === 'object' ? productWithId._id.toString() : String(productWithId._id))
    : "";

  // Serialize customFields to plain objects (remove Mongoose _id)
  const serializedCustomFields = (product.customFields || []).map((field: any) => ({
    label: String(field.label || ''),
    type: String(field.type || 'text') as "text" | "number" | "textarea" | "dropdown",
    required: Boolean(field.required),
    options: field.options ? field.options.map((opt: any) => String(opt)) : undefined,
  }));

  // Extract categories and types from populated product
  const categories = (product.categories || []).map((cat: any) => ({
    id: typeof cat._id === 'object' && cat._id?.toString ? cat._id.toString() : String(cat._id || ''),
    name: String(cat.name || ''),
    slug: String(cat.slug || ''),
  })).filter((cat: any) => cat.name);

  const types = (product.types || []).map((type: any) => ({
    id: typeof type._id === 'object' && type._id?.toString ? type._id.toString() : String(type._id || ''),
    name: String(type.name || ''),
    slug: String(type.slug || ''),
  })).filter((type: any) => type.name);

  return (
    <section className="section">
      {productId && <TrackProductView productId={productId} />}
      <div className="container space-y-6 sm:space-y-8 md:space-y-12">
        <div className="grid gap-4 sm:gap-6 md:gap-8 lg:gap-10 lg:grid-cols-2">
          <ProductGallery images={gallery} />
          <ProductInfoPanel
            product={{
              id: productId,
              title: product.title,
              price: product.basePrice || 0,
              salePrice: product.variants?.find((v: any) => v.salePrice)?.salePrice ?? undefined,
              description: product.description || "",
              fabrics: product.fabrics || [],
              careInstructions: product.careInstructions || "",
              sizes: sizes,
              sku: product.variants?.[0]?.sku,
              thumbnail: product.heroImage || gallery[0],
              weight: product.weight ?? 0,
              isCustomOrderEnabled: Boolean(product.isCustomOrderEnabled),
              customOrderSurcharge: product.customOrderSurcharge || 0,
              customFields: serializedCustomFields,
            }}
            variants={variants}
            categories={categories}
            types={types}
          />
        </div>
        {randomProducts.length > 0 && (
          <RelatedProducts products={randomProducts} />
        )}
      </div>
    </section>
  );
}

