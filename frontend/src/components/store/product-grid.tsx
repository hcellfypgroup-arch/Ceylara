import { ProductCard } from "@/components/store/product-card";

type ProductGridProps = {
  products: Array<{
    id: string;
    slug: string;
    title: string;
    price: number;
    salePrice?: number;
    image: string;
    badge?: string;
    variants?: { sku: string; size?: string; color?: string }[];
  }>;
};

export const ProductGrid = ({ products }: ProductGridProps) => (
  <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
    {products.map((product) => (
      <ProductCard key={product.id} {...product} />
    ))}
  </div>
);

