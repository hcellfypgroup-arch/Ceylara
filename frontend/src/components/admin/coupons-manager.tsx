"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminTable } from "@/components/admin/admin-table";
import { CouponForm } from "@/components/admin/coupon-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import toast from "react-hot-toast";
import { formatCurrency, formatDate } from "@/lib/utils";

type Coupon = {
  _id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minSpend?: number;
  maxDiscount?: number;
  startsAt?: string;
  endsAt?: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
};

type CouponsManagerProps = {
  coupons: Coupon[];
  total: number;
  page: number;
  limit: number;
  search?: string;
};

export const CouponsManager = ({ coupons, total, page, limit, search: initialSearch = "" }: CouponsManagerProps) => {
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState(initialSearch);
  const router = useRouter();

  const handleEdit = (coupon: Coupon) => {
    setEditingCouponId(coupon._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) {
      return;
    }

    try {
      const response = await fetch(`/api/coupons/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete coupon");
      }

      toast.success("Coupon deleted successfully");
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete coupon:", error);
      toast.error("Failed to delete coupon");
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCouponId(null);
    window.location.reload();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCouponId(null);
  };

  const editingCoupon = editingCouponId
    ? coupons.find((c) => c._id === editingCouponId)
    : null;

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.type === "percentage") {
      return `${coupon.value}%${coupon.maxDiscount ? ` (max ${formatCurrency(coupon.maxDiscount)})` : ""}`;
    }
    return formatCurrency(coupon.value);
  };

  const getStatus = (coupon: Coupon) => {
    if (!coupon.isActive) return { label: "Inactive", tone: "neutral" as const };
    
    const now = new Date();
    if (coupon.startsAt && new Date(coupon.startsAt) > now) {
      return { label: "Scheduled", tone: "neutral" as const };
    }
    if (coupon.endsAt && new Date(coupon.endsAt) < now) {
      return { label: "Expired", tone: "neutral" as const };
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { label: "Limit Reached", tone: "neutral" as const };
    }
    return { label: "Active", tone: "success" as const };
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
          </h2>
          <Button variant="outline" onClick={handleFormCancel}>
            Back to List
          </Button>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
          <CouponForm
            coupon={editingCoupon}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      </div>
    );
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set("search", search.trim());
    }
    params.set("page", "1");
    router.push(`/admin/discounts?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Coupons</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Manage discount coupons and promotional codes
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>Create Coupon</Button>
        )}
      </div>

      {/* Search */}
      {!showForm && (
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <Input
              type="text"
              placeholder="Search by coupon code..."
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
                router.push("/admin/discounts");
              }}
            >
              Clear
            </Button>
          )}
        </form>
      )}

      {coupons.length === 0 ? (
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-12 text-center">
          <p className="text-[var(--muted)]">
            {search ? "No coupons found matching your search" : "No coupons found"}
          </p>
        </div>
      ) : (
        <AdminTable
        columns={[
          {
            key: "code",
            label: "Code",
            render: (row) => (
              <span className="font-mono font-semibold">{row.code}</span>
            ),
          },
          {
            key: "discount",
            label: "Discount",
            render: (row: any) => {
              // row.discount contains the full coupon object
              const coupon = row.discount || row;
              return formatDiscount(coupon);
            },
          },
          {
            key: "minSpend",
            label: "Min Spend",
            render: (row: any) => {
              // row.minSpend contains the full coupon object
              const coupon = row.minSpend || row;
              return coupon.minSpend ? formatCurrency(coupon.minSpend) : "None";
            },
          },
          {
            key: "usage",
            label: "Usage",
            render: (row: any) => {
              // row.usage contains the full coupon object
              const coupon = row.usage || row;
              return coupon.usageLimit
                ? `${coupon.usedCount || 0} / ${coupon.usageLimit}`
                : `${coupon.usedCount || 0} / ∞`;
            },
          },
          {
            key: "status",
            label: "Status",
            render: (row: any) => {
              // row.status contains the full coupon object
              const coupon = row.status || row;
              const status = getStatus(coupon);
              return <Badge tone={status.tone}>{status.label}</Badge>;
            },
          },
          {
            key: "validity",
            label: "Validity",
            render: (row: any) => {
              // row.validity contains the full coupon object
              const coupon = row.validity || row;
              if (coupon.startsAt && coupon.endsAt) {
                return (
                  <span className="text-sm text-[var(--muted)]">
                    {formatDate(coupon.startsAt)} - {formatDate(coupon.endsAt)}
                  </span>
                );
              }
              if (coupon.endsAt) {
                return (
                  <span className="text-sm text-[var(--muted)]">
                    Until {formatDate(coupon.endsAt)}
                  </span>
                );
              }
              return <span className="text-sm text-[var(--muted)]">No expiry</span>;
            },
          },
        ]}
        data={coupons.map((coupon) => ({
          id: coupon._id,
          code: coupon.code,
          discount: coupon, // Pass full coupon object for render function
          minSpend: coupon, // Pass full coupon object for render function
          usage: coupon, // Pass full coupon object for render function
          status: coupon, // Pass full coupon object for render function
          validity: coupon, // Pass full coupon object for render function
        }))}
        onEdit={(row) => handleEdit(coupons.find((c) => c._id === row.id)!)}
        onDelete={(row) => handleDelete(row.id)}
      />
      )}

      {total > limit && (
        <div className="flex items-center justify-between text-sm text-[var(--muted)]">
          <span>
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} coupons
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/admin/discounts?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                className="px-3 py-1 border border-[var(--border)] rounded hover:bg-[var(--accent)]"
              >
                Previous
              </a>
            )}
            {page * limit < total && (
              <a
                href={`/admin/discounts?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                className="px-3 py-1 border border-[var(--border)] rounded hover:bg-[var(--accent)]"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

