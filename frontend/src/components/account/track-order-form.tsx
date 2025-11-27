"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

type TrackingData = {
  orderId: string;
  status: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  statusHistory: Array<{
    status: string;
    note?: string;
    timestamp: string;
  }>;
  items: Array<{
    title: string;
    quantity: number;
    thumbnail?: string;
  }>;
  address: any;
  total: number;
};

export const TrackOrderForm = () => {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);

  useEffect(() => {
    const orderIdParam = searchParams.get("orderId");
    if (orderIdParam) {
      setOrderId(orderIdParam);
      // Auto-track if orderId is provided
      const track = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/account/orders/track?orderId=${orderIdParam}`);
          if (response.ok) {
            const { data } = await response.json();
            setTrackingData(data);
          } else {
            setTrackingData(null);
          }
        } catch (error) {
          setTrackingData(null);
        } finally {
          setLoading(false);
        }
      };
      track();
    }
  }, [searchParams]);


  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      toast.error("Please enter an order number");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/account/orders/track?orderId=${orderId}`);
      if (response.ok) {
        const { data } = await response.json();
        setTrackingData(data);
      } else {
        const error = await response.json();
        toast.error(error.error || "Order not found");
        setTrackingData(null);
      }
    } catch (error) {
      toast.error("Failed to track order");
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = [
    "pending",
    "confirmed",
    "packed",
    "shipped",
    "delivered",
  ];

  const getStatusIndex = (status: string) => {
    return statusSteps.indexOf(status.toLowerCase());
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="space-y-6 rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
          Track Order
        </p>
        <h1 className="text-3xl font-semibold">Track your order</h1>
        <p className="text-sm text-[var(--muted)]">
          Enter your order number to see the current status and delivery updates.
        </p>
      </div>

      <form onSubmit={handleTrack} className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Enter order number"
          className="flex-1 min-w-48"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />
        <Button 
          type="submit" 
          disabled={loading}
          className="hover:shadow-lg hover:shadow-[var(--primary)]/40 transition-all duration-300 active:scale-95 disabled:hover:scale-100 disabled:hover:shadow-none"
        >
          {loading ? "Tracking..." : "Track order"}
        </Button>
      </form>

      {trackingData && (
        <div className="space-y-6 border-t border-[var(--border)] pt-6">
          <div>
            <p className="text-sm text-[var(--muted)]">Order #{trackingData.orderId}</p>
            <Badge tone="brand" className="mt-2">
              {trackingData.status}
            </Badge>
            {trackingData.trackingNumber && (
              <p className="mt-2 text-sm">
                Tracking: <strong>{trackingData.trackingNumber}</strong>
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            {statusSteps.map((step, index) => {
              const currentIndex = getStatusIndex(trackingData.status);
              const isCompleted = index <= currentIndex;
              const isCurrent = index === currentIndex;

              return (
                <div key={step} className="text-center">
                  <div className="relative flex items-center justify-center">
                    <div
                      className={`size-10 rounded-full border-2 ${
                        isCompleted
                          ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                          : "border-[var(--border)] bg-[var(--accent)]/60"
                      }`}
                    />
                    {index < statusSteps.length - 1 && (
                      <span
                        className={`absolute left-1/2 top-1/2 hidden h-[2px] w-full md:inline ${
                          isCompleted ? "bg-[var(--primary)]" : "bg-[var(--border)]"
                        }`}
                      />
                    )}
                  </div>
                  <p className="mt-2 text-sm font-semibold capitalize">{step}</p>
                  {isCurrent && trackingData.statusHistory.length > 0 && (
                    <p className="text-xs text-[var(--muted)]">
                      {formatDate(
                        trackingData.statusHistory[trackingData.statusHistory.length - 1]
                          .timestamp
                      )}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {trackingData.estimatedDelivery && (
            <div className="rounded-lg bg-[var(--accent)]/50 p-4 text-sm">
              <p className="font-semibold">Estimated Delivery</p>
              <p className="text-[var(--muted)]">
                {new Date(trackingData.estimatedDelivery).toLocaleDateString("en-US", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <p className="font-semibold">Order Items</p>
            {trackingData.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span>
                  {item.title} × {item.quantity}
                </span>
              </div>
            ))}
            <div className="border-t border-[var(--border)] pt-2">
              <p className="text-right font-semibold">
                Total: {formatCurrency(trackingData.total)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

