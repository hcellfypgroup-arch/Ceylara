import { ProductsManager } from "@/components/admin/products-manager";
import { db } from "@/lib/db";
import { ProductModel } from "@/lib/models";
import { formatCurrency } from "@/lib/utils";

async function getProducts(search?: string) {
  await db.connect();
  
  const filter: any = {};
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { "variants.sku": { $regex: search, $options: "i" } },
    ];
  }
  
  const products = await ProductModel.find(filter)
    .populate("categories")
    .sort({ createdAt: -1 })
    .lean();

  return products.map((product: any) => {
    const totalStock = product.variants?.reduce(
      (sum: number, v: any) => sum + (v.stock || 0),
      0
    ) || 0;
    const minPrice = Math.min(
      ...(product.variants?.map((v: any) => v.price || product.basePrice) || [
        product.basePrice,
      ])
    );
    const status =
      totalStock === 0
        ? "Out of stock"
        : totalStock < 20
          ? "Low stock"
          : "Active";

    return {
      id: product._id.toString(),
      sku: product.variants?.[0]?.sku || `SEL-${product._id.toString().slice(-6)}`,
      title: product.title,
      stock: totalStock,
      price: formatCurrency(minPrice),
      status,
    };
  });
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const products = await getProducts(search);

  return <ProductsManager products={products} search={search} />;
}

