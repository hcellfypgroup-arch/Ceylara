"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ORDER_STATUSES } from "@/lib/constants";
import Image from "next/image";
import toast from "react-hot-toast";

type OrderItem = {
  title: string;
  variantSku: string;
  size?: string;
  color?: string;
  price: number;
  quantity: number;
  thumbnail?: string;
  customFields?: Array<{ label: string; value: string }>;
  product?: {
    categories?: Array<{ _id?: string; id?: string; name: string; slug?: string }>;
    types?: Array<{ _id?: string; id?: string; name: string; slug?: string }>;
  };
};

type Order = {
  _id: string;
  orderNumber?: string;
  email: string;
  user?: {
    name?: string;
    email?: string;
  };
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
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: string;
  payment: {
    method: string;
    status: string;
    transactionId?: string;
  };
  delivery?: {
    method: string;
    trackingNumber?: string;
    estimatedDate?: string;
  };
  createdAt: string;
  notes?: string;
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/orders/${orderId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch order");
      }

      const { data } = await response.json();
      setOrder(data);
    } catch (error) {
      console.error("Failed to fetch order:", error);
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      const { data } = await response.json();
      setOrder(data);
      toast.success("Order status updated");
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentStatusUpdate = async (newStatus: string) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update payment status");
      }

      const { data } = await response.json();
      setOrder(data);
      toast.success("Payment status updated");
    } catch (error) {
      console.error("Failed to update payment status:", error);
      toast.error("Failed to update payment status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Order Details</h1>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-12 text-center">
          <p className="text-[var(--muted)]">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Order Details</h1>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-12 text-center">
          <p className="text-[var(--muted)]">Order not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/admin/orders")}
          >
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const orderNumber = order.orderNumber || order._id.slice(-8).toUpperCase();
  const customerName = order.user?.name || order.address.recipientName || order.email.split("@")[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Order #{orderNumber}</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/orders")}
        >
          Back to Orders
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 pb-4 border-b border-[var(--border)] last:border-0 last:pb-0"
                >
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
                    <p className="text-sm text-[var(--muted)]">
                      SKU: {item.variantSku}
                      {item.size && ` • Size: ${item.size}`}
                      {item.color && ` • Color: ${item.color}`}
                    </p>
                    {(item.product?.categories?.length > 0 || item.product?.types?.length > 0) && (
                      <p className="text-sm text-[var(--muted)] mt-1">
                        {item.product?.categories && item.product.categories.length > 0 && (
                          <span>
                            Category: {item.product.categories.map((cat: any) => cat.name || cat).join(", ")}
                          </span>
                        )}
                        {item.product?.categories?.length > 0 && item.product?.types?.length > 0 && " • "}
                        {item.product?.types && item.product.types.length > 0 && (
                          <span>
                            Type: {item.product.types.map((type: any) => type.name || type).join(", ")}
                          </span>
                        )}
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
                    <p className="text-sm text-[var(--muted)] mt-1">
                      Quantity: {item.quantity}
                    </p>
                    <p className="font-semibold mt-2">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Subtotal</span>
                <span className="font-medium">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Discount</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(order.discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Delivery Fee</span>
                <span className="font-medium">{formatCurrency(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--border)] pt-3 text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Status */}
          <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">Order Status</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                  disabled={updating}
                  className="w-full"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Payment Status</label>
                <Select
                  value={order.payment.status}
                  onChange={(e) => handlePaymentStatusUpdate(e.target.value)}
                  disabled={updating}
                  className="w-full"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </Select>
              </div>
              {order.payment.transactionId && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Transaction ID</label>
                  <p className="text-sm text-[var(--muted)] font-mono">
                    {order.payment.transactionId}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">Customer</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-[var(--muted)]">Name: </span>
                <span className="font-medium">{customerName}</span>
              </div>
              <div>
                <span className="text-[var(--muted)]">Email: </span>
                <span className="font-medium">{order.email}</span>
              </div>
              {order.user && (
                <Badge tone="brand" className="mt-2">
                  Registered Customer
                </Badge>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
            <div className="space-y-1 text-sm">
              {order.address.recipientName && (
                <p className="font-medium">{order.address.recipientName}</p>
              )}
              <p>{order.address.line1}</p>
              {order.address.line2 && <p>{order.address.line2}</p>}
              <p>
                {order.address.city}, {order.address.state} {order.address.postalCode}
              </p>
              <p>{order.address.country}</p>
              {order.address.phone && (
                <p className="text-[var(--muted)] mt-2">Phone: {order.address.phone}</p>
              )}
            </div>
          </div>

          {/* Delivery Information */}
          {order.delivery && (
            <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
              <h2 className="text-lg font-semibold mb-4">Delivery</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-[var(--muted)]">Method: </span>
                  <span className="font-medium capitalize">{order.delivery.method}</span>
                </div>
                {order.delivery.trackingNumber && (
                  <div>
                    <span className="text-[var(--muted)]">Tracking: </span>
                    <span className="font-medium font-mono">
                      {order.delivery.trackingNumber}
                    </span>
                  </div>
                )}
                {order.delivery.estimatedDate && (
                  <div>
                    <span className="text-[var(--muted)]">Estimated Delivery: </span>
                    <span className="font-medium">
                      {new Date(order.delivery.estimatedDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Information */}
          <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">Payment</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-[var(--muted)]">Method: </span>
                <span className="font-medium capitalize">
                  {order.payment.method === "cod"
                    ? "Cash on Delivery"
                    : order.payment.method === "card"
                    ? "Card Payment"
                    : "Bank Transfer"}
                </span>
              </div>
              <div>
                <span className="text-[var(--muted)]">Status: </span>
                <Badge
                  tone={
                    order.payment.status === "paid"
                      ? "success"
                      : order.payment.status === "failed"
                      ? "neutral"
                      : "neutral"
                  }
                >
                  {order.payment.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

