"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminTable } from "@/components/admin/admin-table";
import { ORDER_STATUSES } from "@/lib/constants";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Search, Printer, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { PrintLabel } from "@/components/admin/print-label";

type Order = {
  id: string;
  _id?: string;
  orderNumber?: string;
  customer: string;
  email: string;
  total: number;
  status: string;
  paymentStatus?: string;
  date: string;
  createdAt?: string;
  items?: Array<{ title: string; quantity: number }>;
};

type FullOrder = {
  _id: string;
  orderNumber?: string;
  address: {
    recipientName?: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: Array<{
    title: string;
    quantity: number;
    size?: string;
    color?: string;
  }>;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [printingOrder, setPrintingOrder] = useState<FullOrder | null>(null);
  const [loadingPrint, setLoadingPrint] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, search]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (statusFilter) {
        params.append("status", statusFilter);
      }
      if (search.trim()) {
        params.append("search", search.trim());
      }

      const response = await fetch(`/api/admin/orders?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const { data } = await response.json();
      const formattedOrders: Order[] = (data.data || []).map((order: any) => {
        const orderId = order._id?.toString() || order.id || "";
        const shortId = orderId.slice(-8).toUpperCase();
        const orderNumber = order.orderNumber || `SLR${shortId}`;
        
        return {
          id: orderId,
          _id: orderId,
          orderNumber,
          customer: order.user?.name || order.email?.split("@")[0] || "Guest",
          email: order.email || "",
          total: order.total || 0,
          status: order.status || "pending",
          paymentStatus: order.payment?.status || "pending",
          date: order.createdAt
            ? new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "N/A",
          createdAt: order.createdAt,
          items: order.items || [],
        };
      });

      setOrders(formattedOrders);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      toast.success("Order status updated");
      fetchOrders();
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const getStatusTone = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "delivered") return "success";
    if (statusLower === "cancelled" || statusLower === "returned") return "subtle";
    if (statusLower === "shipped") return "brand";
    if (statusLower === "confirmed" || statusLower === "packed") return "brand";
    return "neutral";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Orders</h1>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-12 text-center">
          <p className="text-[var(--muted)]">Loading orders...</p>
        </div>
      </div>
    );
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handlePrint = async (orderId: string) => {
    try {
      setLoadingPrint(orderId);
      const response = await fetch(`/api/admin/orders/${orderId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }

      const { data } = await response.json();
      const fullOrder: FullOrder = {
        _id: data._id || orderId,
        orderNumber: data.orderNumber,
        address: data.address || {
          line1: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        },
        items: (data.items || []).map((item: any) => ({
          title: item.title || "Item",
          quantity: item.quantity || 1,
          size: item.size,
          color: item.color,
        })),
      };

      setPrintingOrder(fullOrder);
    } catch (error) {
      console.error("Failed to fetch order for printing:", error);
      toast.error("Failed to load order details for printing");
    } finally {
      setLoadingPrint(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="w-auto"
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </Select>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
          <Input
            type="text"
            placeholder="Search by order number, customer name, or email..."
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
              setPage(1);
              fetchOrders();
            }}
          >
            Clear
          </Button>
        )}
      </form>

      {orders.length === 0 ? (
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-12 text-center">
          <p className="text-[var(--muted)]">No orders found</p>
        </div>
      ) : (
        <>
          <AdminTable
            columns={[
              {
                key: "orderNumber",
                label: "Order #",
                render: (row) => (
                  <Link
                    href={`/admin/orders/${row.id}`}
                    className="font-medium text-[var(--primary)] hover:underline"
                  >
                    {row.orderNumber || row.id}
                  </Link>
                ),
              },
              {
                key: "customer",
                label: "Customer",
                render: (row) => (
                  <div>
                    <p className="font-medium">{row.customer}</p>
                    <p className="text-xs text-[var(--muted)]">{row.email}</p>
                  </div>
                ),
              },
              {
                key: "total",
                label: "Total",
                render: (row) => (
                  <span className="font-medium">{formatCurrency(row.total)}</span>
                ),
              },
              {
                key: "status",
                label: "Status",
                render: (row) => (
                  <Select
                    value={row.status}
                    onChange={(e) => handleStatusChange(row.id, e.target.value)}
                    className="w-auto min-w-[140px]"
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </Select>
                ),
              },
              {
                key: "paymentStatus",
                label: "Payment",
                render: (row) => (
                  <Badge tone={row.paymentStatus === "paid" ? "success" : "neutral"}>
                    {row.paymentStatus || "pending"}
                  </Badge>
                ),
              },
              {
                key: "date",
                label: "Date",
              },
              {
                key: "view",
                label: "View",
                render: (row) => (
                  <Link href={`/admin/orders/${row.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:text-[var(--primary)] transition-all duration-300 active:scale-95"
                      title="View order details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                ),
              },
              {
                key: "print",
                label: "Print",
                render: (row) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePrint(row.id)}
                    disabled={loadingPrint === row.id}
                    className="hover:text-[var(--primary)] transition-all duration-300 active:scale-95"
                    title="Print shipping label"
                  >
                    <Printer className="w-4 h-4" />
                  </Button>
                ),
              },
            ]}
            data={orders}
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-full border border-[var(--border)] px-4 py-2 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-[var(--muted)]">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-full border border-[var(--border)] px-4 py-2 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {printingOrder && (
        <PrintLabel
          order={printingOrder}
          onClose={() => setPrintingOrder(null)}
        />
      )}
    </div>
  );
}
