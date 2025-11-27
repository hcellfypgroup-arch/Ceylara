"use client";

import { useState } from "react";
import { AdminTable } from "@/components/admin/admin-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

type Customer = {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  orders: number;
  totalSpent: number;
  createdAt: string;
};

type CustomersManagerProps = {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  search?: string;
};

export const CustomersManager = ({
  customers,
  total,
  page,
  limit,
  totalPages,
  search: initialSearch = "",
}: CustomersManagerProps) => {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set("search", search.trim());
    }
    params.set("page", "1");
    router.push(`/admin/customers?${params.toString()}`);
  };

  const handleViewDetails = (customerId: string) => {
    router.push(`/admin/customers/${customerId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Customers</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Manage customer accounts and view customer information
          </p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
          <Input
            type="text"
            placeholder="Search by name or email..."
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
              router.push("/admin/customers");
            }}
          >
            Clear
          </Button>
        )}
      </form>

      {customers.length === 0 ? (
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-12 text-center">
          <p className="text-[var(--muted)]">
            {search ? "No customers found matching your search" : "No customers found"}
          </p>
        </div>
      ) : (
        <>
          <AdminTable
            columns={[
              {
                key: "name",
                label: "Name",
                render: (row: any) => (
                  <span className="font-medium">{row.name}</span>
                ),
              },
              {
                key: "email",
                label: "Email",
                render: (row: any) => (
                  <span className="text-sm">{row.email}</span>
                ),
              },
              {
                key: "phone",
                label: "Phone",
                render: (row: any) => (
                  <span className="text-sm text-[var(--muted)]">
                    {row.phone || "—"}
                  </span>
                ),
              },
              {
                key: "orders",
                label: "Orders",
                render: (row: any) => (
                  <span className="font-medium">{row.orders}</span>
                ),
              },
              {
                key: "totalSpent",
                label: "Total Spent",
                render: (row: any) => (
                  <span className="font-semibold">
                    {formatCurrency(row.totalSpent)}
                  </span>
                ),
              },
              {
                key: "createdAt",
                label: "Joined",
                render: (row: any) => (
                  <span className="text-sm text-[var(--muted)]">
                    {row.createdAt ? formatDate(row.createdAt) : "—"}
                  </span>
                ),
              },
            ]}
            data={customers.map((customer) => {
              const { id: _, ...rest } = customer;
              return {
                id: customer._id || customer.id,
                ...rest,
              };
            })}
            onEdit={(row) => handleViewDetails(row.id)}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-[var(--muted)]">
              <span>
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} customers
              </span>
              <div className="flex gap-2">
                {page > 1 && (
                  <a
                    href={`/admin/customers?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                    className="px-3 py-1 border border-[var(--border)] rounded hover:bg-[var(--accent)] transition"
                  >
                    Previous
                  </a>
                )}
                {page < totalPages && (
                  <a
                    href={`/admin/customers?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                    className="px-3 py-1 border border-[var(--border)] rounded hover:bg-[var(--accent)] transition"
                  >
                    Next
                  </a>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

