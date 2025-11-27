"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminTable } from "@/components/admin/admin-table";
import { TypeForm } from "@/components/admin/type-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import toast from "react-hot-toast";

type Type = {
  _id: string;
  id: string;
  name: string;
  slug: string;
  description?: string;
  position?: number;
  heroImage?: string;
};

type TypesManagerProps = {
  types: Type[];
  search?: string;
};

export const TypesManager = ({ types, search: initialSearch = "" }: TypesManagerProps) => {
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState(initialSearch);
  const router = useRouter();

  const handleEdit = (type: Type) => {
    setEditingTypeId(type._id || type.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (type: Type) => {
    if (!confirm(`Are you sure you want to delete "${type.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/types/id/${type._id || type.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete type");
      }

      toast.success("Type deleted successfully!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete type");
    }
  };

  const handleFormCancel = () => {
    setEditingTypeId(null);
    setShowForm(false);
  };

  const handleFormSubmit = async () => {
    setEditingTypeId(null);
    setShowForm(false);
    router.refresh();
  };

  const handleAddNew = () => {
    setEditingTypeId(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set("search", search.trim());
    }
    params.set("tab", "types");
    router.push(`/admin/categories?${params.toString()}`);
  };

  const tableData = types.map((type) => ({
    _id: type._id || type.id,
    id: type._id || type.id,
    name: type.name,
    slug: type.slug,
    position: type.position || 0,
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Types</h2>
          <p className="text-sm text-[var(--muted)]">
            Manage your product types
          </p>
        </div>
        {!showForm && (
          <Button onClick={handleAddNew}>Add New Type</Button>
        )}
      </div>

      {/* Search */}
      {!showForm && (
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <Input
              type="text"
              placeholder="Search by type name or slug..."
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
                router.push("/admin/categories?tab=types");
              }}
            >
              Clear
            </Button>
          )}
        </form>
      )}

      {showForm && (
        <TypeForm
          typeId={editingTypeId || undefined}
          onCancel={handleFormCancel}
          onSubmit={handleFormSubmit}
        />
      )}

      {tableData.length === 0 ? (
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-12 text-center">
          <p className="text-[var(--muted)]">
            {search ? "No types found matching your search" : "No types found"}
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

