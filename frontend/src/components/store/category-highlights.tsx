import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { categoryService } from "@/lib/services";

async function getCategoriesWithCounts() {
  try {
    await db.connect();
    const categories = await categoryService.getCategoriesWithProductCounts();
    return categories.map((cat: any) => ({
      _id: cat._id?.toString() || "",
      name: cat.name,
      slug: cat.slug,
      heroImage: cat.heroImage || "/placeholder-category.jpg",
      productCount: cat.productCount || 0,
    }));
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export const CategoryHighlights = async () => {
  const categories = await getCategoriesWithCounts();

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="section border-y border-[var(--border)] bg-white">
      <div className="container space-y-4 sm:space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3 sm:gap-4">
          <div>
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Our Category List
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold">Discover every mood</h2>
          </div>
          <Link href="/shop" className="text-xs sm:text-sm text-[var(--foreground)] underline">
            View all
          </Link>
        </div>
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/categories/${category.slug}`}
              className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white"
            >
              <Image
                src={category.heroImage}
                alt={category.name}
                width={520}
                height={390}
                className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/20"></div>
              <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-2 sm:left-3 md:left-4 space-y-0.5 sm:space-y-1 text-white">
                <p className="text-sm sm:text-base md:text-lg font-semibold">{category.name}</p>
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em]">
                  {category.productCount}+ styles
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

