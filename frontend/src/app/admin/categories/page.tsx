import { CategoriesManager } from "@/components/admin/categories-manager";
import { TypesManager } from "@/components/admin/types-manager";
import { db } from "@/lib/db";
import { categoryService, typeService } from "@/lib/services";

async function getCategories(search?: string) {
  await db.connect();
  const categories = await categoryService.getTopLevelCategories();
  
  // Filter by search if provided
  let filtered = categories;
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = categories.filter((cat: any) =>
      cat.name.toLowerCase().includes(searchLower) ||
      cat.slug.toLowerCase().includes(searchLower)
    );
  }
  
  return filtered.map((cat: any) => ({
    _id: cat._id?.toString() || "",
    id: cat._id?.toString() || "",
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    position: cat.position || 0,
    heroImage: cat.heroImage,
  }));
}

async function getTypes(search?: string) {
  await db.connect();
  const types = await typeService.getAllTypes();
  
  // Filter by search if provided
  let filtered = types;
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = types.filter((type: any) =>
      type.name.toLowerCase().includes(searchLower) ||
      type.slug.toLowerCase().includes(searchLower)
    );
  }
  
  return filtered.map((type: any) => ({
    _id: type._id?.toString() || "",
    id: type._id?.toString() || "",
    name: type.name,
    slug: type.slug,
    description: type.description,
    position: type.position || 0,
    heroImage: type.heroImage,
  }));
}

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; tab?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const tab = params.tab || "categories";
  
  const categories = await getCategories(tab === "categories" ? search : undefined);
  const types = await getTypes(tab === "types" ? search : undefined);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Categories and Types</h1>
        <p className="text-sm text-[var(--muted)]">
          Manage your product categories and types
        </p>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-[var(--border)]">
        <nav className="flex gap-4">
          <a
            href="/admin/categories?tab=categories"
            className={`px-4 py-2 border-b-2 transition-colors ${
              tab === "categories"
                ? "border-[var(--primary)] text-[var(--primary)] font-medium"
                : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            Categories
          </a>
          <a
            href="/admin/categories?tab=types"
            className={`px-4 py-2 border-b-2 transition-colors ${
              tab === "types"
                ? "border-[var(--primary)] text-[var(--primary)] font-medium"
                : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            Types
          </a>
        </nav>
      </div>
      
      {/* Tab Content */}
      {tab === "categories" ? (
        <CategoriesManager categories={categories} search={search} />
      ) : (
        <TypesManager types={types} search={search} />
      )}
    </div>
  );
}

