"use client";

import { useEffect, useState } from "react";
import { OrderCard } from "@/components/account/order-card";
import { Button } from "@/components/ui/button";

type Order = {
  _id: string;
  status: string;
  total: number;
  items: Array<{ 
    title: string; 
    quantity: number;
    size?: string;
    color?: string;
    customFields?: Array<{ label: string; value: string }>;
  }>;
  createdAt: string;
  delivery?: {
    trackingNumber?: string;
  };
};

export const OrdersList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/account/orders?page=${page}&limit=10`);
        if (response.ok) {
          const result = await response.json();
          const ordersData = result.data?.data || result.data || [];
          const total = result.data?.total || 0;
          setOrders(ordersData);
          setHasMore(total > page * 10);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [page]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-[var(--radius-xl)] border border-[var(--border)] bg-gray-100"
          />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-12 text-center">
        <p className="text-lg font-semibold">No orders yet</p>
        <p className="text-sm text-[var(--muted)] mt-2">
          When you place an order, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        // Ensure _id is converted to string (handles ObjectId objects)
        const orderId = typeof order._id === 'object' && order._id?.toString 
          ? order._id.toString() 
          : String(order._id);
        
        return (
          <OrderCard
            key={orderId}
            order={{
              id: orderId, // Pass full ID as string for the link
              status: order.status,
              total: order.total,
              items: order.items,
              placedAt: formatDate(order.createdAt),
              tracking: order.delivery?.trackingNumber,
            }}
          />
        );
      })}
      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all duration-300 active:scale-95"
            onClick={() => setPage(page + 1)}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
};
