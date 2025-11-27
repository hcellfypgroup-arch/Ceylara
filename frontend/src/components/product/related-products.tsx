import { ProductGrid } from "@/components/store/product-grid";

type RelatedProductsProps = {
  products: Array<{
    id: string;
    slug: string;
    title: string;
    price: number;
    salePrice?: number;
    image: string;
  }>;
};

export const RelatedProducts = ({ products }: RelatedProductsProps) => (
  <section className="space-y-6">
    <div>
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
        You may also like
      </p>
      <h3 className="text-2xl font-semibold text-[var(--foreground)]">
        Curated for you
      </h3>
    </div>
    <ProductGrid products={products} />
  </section>
);

