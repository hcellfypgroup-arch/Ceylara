"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminTable } from "@/components/admin/admin-table";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import toast from "react-hot-toast";

type Product = {
  id: string;
  sku: string;
  title: string;
  stock: number;
  price: string;
  status: string;
};

type ProductsManagerProps = {
  products: Product[];
  search?: string;
};

export const ProductsManager = ({ products, search: initialSearch = "" }: ProductsManagerProps) => {
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState(initialSearch);
  const router = useRouter();

  const handleEdit = (product: Product) => {
    setEditingProductId(product.id);
    setShowForm(true);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/products/id/${product.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete product");
      }

      toast.success("Product deleted successfully!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product");
    }
  };

  const handleFormCancel = () => {
    setEditingProductId(null);
    setShowForm(false);
  };

  const handleFormSubmit = async (values: any) => {
    // The form handles the API call itself, we just need to update UI state
    setEditingProductId(null);
    setShowForm(false);
    router.refresh();
  };

  const handleAddNew = () => {
    setEditingProductId(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set("search", search.trim());
    }
    router.push(`/admin/products?${params.toString()}`);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Products</h2>
          <p className="text-sm text-[var(--muted)]">
            Manage your product catalog
          </p>
        </div>
        {!showForm && (
          <Button onClick={handleAddNew}>Add New Product</Button>
        )}
      </div>

      {/* Search */}
      {!showForm && (
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <Input
              type="text"
              placeholder="Search by product name or SKU..."
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
                router.push("/admin/products");
              }}
            >
              Clear
            </Button>
          )}
        </form>
      )}

      {showForm && (
        <ProductForm
          productId={editingProductId || undefined}
          onCancel={handleFormCancel}
          onSubmit={handleFormSubmit}
        />
      )}

      {products.length === 0 ? (
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-12 text-center">
          <p className="text-[var(--muted)]">
            {search ? "No products found matching your search" : "No products found"}
          </p>
        </div>
      ) : (
        <AdminTable
          columns={[
            { key: "sku", label: "SKU" },
            { key: "title", label: "Product" },
            { key: "stock", label: "Stock" },
            { key: "price", label: "Price" },
            { key: "status", label: "Status" },
          ]}
          data={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

