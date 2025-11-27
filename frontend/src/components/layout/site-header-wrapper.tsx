import { db } from "@/lib/db";
import { categoryService } from "@/lib/services";
import { SiteHeader } from "./site-header";

async function getCategories() {
  try {
    await db.connect();
    const categories = await categoryService.getTopLevelCategories();
    return categories.map((cat: any) => ({
      name: String(cat.name || ""),
      slug: String(cat.slug || ""),
    }));
  } catch (error) {
    console.error("Failed to fetch categories for navigation:", error);
    return [];
  }
}

export const SiteHeaderWrapper = async () => {
  const categories = await getCategories();
  return <SiteHeader categories={categories} />;
};

