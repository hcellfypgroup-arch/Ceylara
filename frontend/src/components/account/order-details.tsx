"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

type OrderDetailsProps = {
  order: {
    _id: string;
    status: string;
    total: number;
    subtotal: number;
    deliveryFee: number;
    discount: number;
    items: Array<{
      title: string;
      quantity: number;
      price: number;
      size?: string;
      color?: string;
      thumbnail?: string;
      customFields?: Array<{ label: string; value: string }>;
    }>;
    createdAt: string;
    address: {
      recipientName?: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      phone?: string;
    };
    payment: {
      method: string;
      status: string;
    };
    delivery?: {
      method?: string;
      trackingNumber?: string;
      estimatedDate?: string;
    };
  };
};

export const OrderDetails = ({ order }: OrderDetailsProps) => {
  const formatOrderId = (id: string) => {
    return id.slice(-8).toUpperCase();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusTone = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "delivered") return "success";
    if (statusLower === "cancelled" || statusLower === "returned") return "neutral";
    if (statusLower === "shipped") return "brand";
    return "brand";
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Order Details
            </p>
            <h1 className="text-3xl font-semibold">Order #{formatOrderId(order._id)}</h1>
            <p className="text-sm text-[var(--muted)] mt-1">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <Badge tone={getStatusTone(order.status)} className="text-base px-4 py-2">
            {order.status}
          </Badge>
        </div>

        <div className="space-y-4 border-t border-[var(--border)] pt-6">
          <h2 className="font-semibold">Order Items</h2>
          {order.items.map((item, index) => (
            <div key={index} className="flex gap-4">
              {item.thumbnail && (
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  width={80}
                  height={100}
                  className="rounded-[var(--radius-md)] object-cover"
                  unoptimized={item.thumbnail.startsWith("http")}
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{item.title}</p>
                  {item.customFields && item.customFields.length > 0 && (
                    <Badge tone="brand" className="text-xs">Custom Order</Badge>
                  )}
                </div>
                {item.size && (
                  <p className="text-sm text-[var(--muted)]">
                    Size: {item.size} {item.color ? `• Color: ${item.color}` : ""}
                  </p>
                )}
                {item.customFields && item.customFields.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {item.customFields.map((field, idx) => (
                      <p key={idx} className="text-xs text-[var(--muted)]">
                        <span className="font-medium">{field.label}:</span> {field.value}
                      </p>
                    ))}
                  </div>
                )}
                <p className="text-sm text-[var(--muted)]">
                  Quantity: {item.quantity}
                </p>
                <p className="text-sm font-semibold mt-1">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2 border-t border-[var(--border)] pt-6 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {order.deliveryFee > 0 && (
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{formatCurrency(order.deliveryFee)}</span>
            </div>
          )}
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-[var(--border)] pt-2 font-semibold text-base">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
          <h2 className="mb-4 font-semibold">Shipping Address</h2>
          <div className="text-sm text-[var(--muted)] space-y-1">
            <p>{order.address.recipientName}</p>
            <p>{order.address.line1}</p>
            {order.address.line2 && <p>{order.address.line2}</p>}
            <p>
              {order.address.city}, {order.address.state} {order.address.postalCode}
            </p>
            <p>{order.address.country}</p>
            {order.address.phone && <p>{order.address.phone}</p>}
          </div>
        </div>

        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
          <h2 className="mb-4 font-semibold">Payment & Delivery</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-[var(--muted)]">Payment Method: </span>
              <span className="font-medium capitalize">{order.payment.method}</span>
            </div>
            <div>
              <span className="text-[var(--muted)]">Payment Status: </span>
              <span className="font-medium capitalize">{order.payment.status}</span>
            </div>
            {order.delivery?.method && (
              <div>
                <span className="text-[var(--muted)]">Delivery Method: </span>
                <span className="font-medium">{order.delivery.method}</span>
              </div>
            )}
            {order.delivery?.trackingNumber && (
              <div>
                <span className="text-[var(--muted)]">Tracking Number: </span>
                <span className="font-medium">{order.delivery.trackingNumber}</span>
              </div>
            )}
            {order.delivery?.estimatedDate && (
              <div>
                <span className="text-[var(--muted)]">Estimated Delivery: </span>
                <span className="font-medium">
                  {new Date(order.delivery.estimatedDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button 
          variant="outline" 
          className="hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all duration-300 active:scale-95"
          asChild
        >
          <Link href="/account/orders">Back to Orders</Link>
        </Button>
      </div>
    </div>
  );
};

