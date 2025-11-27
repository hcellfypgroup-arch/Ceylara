"use client";

import { useState, useEffect } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { TrendingUp, ShoppingBag, Bell, Sparkles, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

type DashboardData = {
  revenueToday: number;
  revenueYesterday: number;
  ordersToday: number;
  ordersYesterday: number;
  pendingOrdersCount: number;
  yesterdayPendingCount: number;
  averageOrderValue: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  criticalStockCount: number;
  bestSellers: Array<{
    _id: string;
    title: string;
    variants?: Array<{ sku: string; stock?: number }>;
    basePrice: number;
  }>;
  lowStock: Array<{
    _id: string;
    title: string;
    variants?: Array<{ sku: string; stock?: number }>;
  }>;
  topCategories: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  topCoupons: Array<{
    code: string;
    usedCount: number;
    totalDiscount: number;
  }>;
};

export const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/dashboard");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const result = await response.json();
      setData(result.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6 animate-pulse"
            >
              <div className="h-4 bg-[var(--accent)] rounded w-1/2 mb-2" />
              <div className="h-8 bg-[var(--accent)] rounded w-1/3 mb-2" />
              <div className="h-3 bg-[var(--accent)] rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-12 text-center">
        <p className="text-[var(--muted)]">Failed to load dashboard data</p>
        <Button onClick={fetchDashboardData} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  const revenueTrend =
    data.revenueYesterday > 0
      ? ((data.revenueToday - data.revenueYesterday) / data.revenueYesterday) * 100
      : 0;
  const pendingTrend =
    data.yesterdayPendingCount > 0
      ? ((data.pendingOrdersCount - data.yesterdayPendingCount) / data.yesterdayPendingCount) * 100
      : data.yesterdayPendingCount === 0 && data.pendingOrdersCount > 0
      ? 100
      : 0;

  const getBestSellerSku = (product: any) => {
    return product.variants?.[0]?.sku || `SEL-${product._id?.toString().slice(-6) || "N/A"}`;
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Daily sales"
          value={formatCurrency(data.revenueToday)}
          trend={
            revenueTrend !== 0
              ? `${revenueTrend > 0 ? "+" : ""}${revenueTrend.toFixed(1)}% vs yesterday`
              : "No previous data"
          }
          icon={<TrendingUp />}
          tone="brand"
        />
        <StatCard
          label="Pending orders"
          value={data.pendingOrdersCount.toString()}
          trend={
            pendingTrend !== 0
              ? `${pendingTrend > 0 ? "+" : ""}${pendingTrend.toFixed(1)}% vs yesterday`
              : data.pendingOrdersCount === 0
              ? "All orders processed"
              : "No previous data"
          }
          icon={<ShoppingBag />}
        />
        <StatCard
          label="Total customers"
          value={data.totalCustomers.toString()}
          trend={`${data.totalProducts} products`}
          icon={<Users />}
        />
        <StatCard
          label="Low stock alerts"
          value={data.lowStockCount.toString()}
          trend={data.criticalStockCount > 0 ? `${data.criticalStockCount} critical` : "All good"}
          icon={<Bell />}
          tone={data.criticalStockCount > 0 ? "warning" : undefined}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                Best selling items
              </p>
              <h3 className="text-xl font-semibold">Performance snapshot</h3>
            </div>
          </div>
          {data.bestSellers.length === 0 ? (
            <p className="text-sm text-[var(--muted)] py-8 text-center">
              No best sellers yet
            </p>
          ) : (
            <div className="divide-y divide-[var(--border)] text-sm">
              {data.bestSellers.map((product) => {
                const sku = getBestSellerSku(product);
                const minPrice = product.variants?.length
                  ? Math.min(...product.variants.map((v: any) => v.price || product.basePrice))
                  : product.basePrice;
                return (
                  <div key={product._id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">{product.title}</p>
                      <p className="text-xs text-[var(--muted)]">{sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(minPrice)}</p>
                      <p className="text-xs text-[var(--muted)]">Best seller</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Alerts
          </p>
          {data.lowStock.length === 0 ? (
            <div className="rounded-[var(--radius-md)] bg-[var(--accent)]/60 px-4 py-3 text-sm">
              <p className="font-medium">All good</p>
              <p className="text-[var(--muted)]">No low stock alerts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.lowStock.slice(0, 5).map((product) => {
                const minStock = Math.min(
                  ...(product.variants?.map((v: any) => v.stock || 0) || [0])
                );
                const isCritical = minStock < 5;
                return (
                  <div
                    key={product._id}
                    className={`rounded-[var(--radius-md)] px-4 py-3 text-sm ${
                      isCritical
                        ? "bg-red-50 border border-red-200"
                        : "bg-[var(--accent)]/60"
                    }`}
                  >
                    <p className="font-medium">
                      {isCritical ? "Critical stock" : "Low stock"}
                    </p>
                    <p className="text-[var(--muted)]">
                      {product.title} · {minStock} units left
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Top categories
          </p>
          {data.topCategories.length === 0 ? (
            <p className="text-sm text-[var(--muted)] mt-4">No category data available</p>
          ) : (
            <div className="mt-4 space-y-4">
              {data.topCategories.map((category) => (
                <div key={category.name}>
                  <div className="flex justify-between text-sm">
                    <span>{category.name}</span>
                    <span>{category.count} products ({category.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-[var(--accent)]">
                    <div
                      className="h-full rounded-full bg-[var(--foreground)]"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Top coupons
          </p>
          {data.topCoupons.length === 0 ? (
            <p className="text-sm text-[var(--muted)] mt-4">No coupon usage data</p>
          ) : (
            <div className="mt-4 space-y-3 text-sm">
              {data.topCoupons.map((coupon) => (
                <div
                  key={coupon.code}
                  className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] px-4 py-3"
                >
                  <div>
                    <p className="font-semibold">{coupon.code}</p>
                    <p className="text-xs text-[var(--muted)]">{coupon.usedCount} uses</p>
                  </div>
                  <p className="font-medium">{formatCurrency(coupon.totalDiscount)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
