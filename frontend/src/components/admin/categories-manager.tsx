"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminTable } from "@/components/admin/admin-table";
import { CategoryForm } from "@/components/admin/category-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import toast from "react-hot-toast";

type Category = {
  _id: string;
  id: string;
  name: string;
  slug: string;
  description?: string;
  position?: number;
  heroImage?: string;
};

type CategoriesManagerProps = {
  categories: Category[];
  search?: string;
};

export const CategoriesManager = ({ categories, search: initialSearch = "" }: CategoriesManagerProps) => {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState(initialSearch);
  const router = useRouter();

  const handleEdit = (category: Category) => {
    setEditingCategoryId(category._id || category.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/id/${category._id || category.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete category");
      }

      toast.success("Category deleted successfully!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete category");
    }
  };

  const handleFormCancel = () => {
    setEditingCategoryId(null);
    setShowForm(false);
  };

  const handleFormSubmit = async () => {
    setEditingCategoryId(null);
    setShowForm(false);
    router.refresh();
  };

  const handleAddNew = () => {
    setEditingCategoryId(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set("search", search.trim());
    }
    params.set("tab", "categories");
    router.push(`/admin/categories?${params.toString()}`);
  };

  const tableData = categories.map((cat) => ({
    _id: cat._id || cat.id,
    id: cat._id || cat.id,
    name: cat.name,
    slug: cat.slug,
    position: cat.position || 0,
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Categories</h2>
          <p className="text-sm text-[var(--muted)]">
            Manage your product categories
          </p>
        </div>
        {!showForm && (
          <Button onClick={handleAddNew}>Add New Category</Button>
        )}
      </div>

      {/* Search */}
      {!showForm && (
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <Input
              type="text"
              placeholder="Search by category name or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
          {search && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSearch("");
                router.push("/admin/categories?tab=categories");
              }}
            >
              Clear
            </Button>
          )}
        </form>
      )}

      {showForm && (
        <CategoryForm
          categoryId={editingCategoryId || undefined}
          onCancel={handleFormCancel}
          onSubmit={handleFormSubmit}
        />
      )}

      {tableData.length === 0 ? (
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-12 text-center">
          <p className="text-[var(--muted)]">
            {search ? "No categories found matching your search" : "No categories found"}
          </p>
        </div>
      ) : (
        <AdminTable
          columns={[
            { key: "name", label: "Name" },
            { key: "slug", label: "Slug" },
            { key: "position", label: "Position" },
          ]}
          data={tableData}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

