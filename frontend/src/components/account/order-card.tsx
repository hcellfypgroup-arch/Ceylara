"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

type OrderCardProps = {
  order: {
    id: string; // Full MongoDB ObjectId
    status: string;
    total: number;
    items: { 
      title: string; 
      quantity: number;
      size?: string;
      color?: string;
      customFields?: Array<{ label: string; value: string }>;
    }[];
    placedAt: string;
    tracking?: string;
  };
};

export const OrderCard = ({ order }: OrderCardProps) => {
  const getStatusTone = (status: string): "success" | "neutral" | "brand" | "warning" | undefined => {
    const statusLower = status.toLowerCase();
    if (statusLower === "delivered") return "success";
    if (statusLower === "cancelled" || statusLower === "returned") return "neutral";
    if (statusLower === "shipped") return "brand";
    return "brand";
  };

  // Format order ID for display (last 8 characters)
  const displayOrderId = order.id.slice(-8).toUpperCase();

  return (
    <div className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--muted)]">Order #{displayOrderId}</p>
          <p className="text-xs text-[var(--muted)]">Placed on {order.placedAt}</p>
        </div>
        <Badge tone={getStatusTone(order.status)}>{order.status}</Badge>
      </div>
      <div className="space-y-2 text-sm">
        {order.items.map((item, index) => (
          <div key={index} className="flex justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span>
                  {item.title} × {item.quantity}
                </span>
                {item.customFields && item.customFields.length > 0 && (
                  <Badge tone="brand" className="text-xs">Custom</Badge>
                )}
              </div>
              {(item.size || item.color) && (
                <span className="text-xs text-[var(--muted)] mt-0.5">
                  {item.size && `Size: ${item.size}`}
                  {item.size && item.color && " • "}
                  {item.color && `Color: ${item.color}`}
                </span>
              )}
              {item.customFields && item.customFields.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {item.customFields.slice(0, 2).map((field, idx) => (
                    <span key={idx} className="text-xs text-[var(--muted)] block">
                      {field.label}: {field.value}
                    </span>
                  ))}
                  {item.customFields.length > 2 && (
                    <span className="text-xs text-[var(--muted)]">
                      +{item.customFields.length - 2} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between text-sm">
        <span className="font-semibold text-[var(--foreground)]">
          Total {formatCurrency(order.total)}
        </span>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all duration-300 active:scale-95"
            asChild
          >
            <Link href={`/account/orders/${order.id}`}>View details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

