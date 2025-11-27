"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore, useCartTotals } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CouponSection } from "@/components/cart/coupon-section";
import { useShippingConfig } from "@/hooks/use-shipping-config";
import { Badge } from "@/components/ui/badge";

export const CartTable = () => {
  const items = useCartStore((state) => state.items);
  const updateQty = useCartStore((state) => state.updateQty);
  const removeItem = useCartStore((state) => state.removeItem);
  const { data: shippingConfig, loading: shippingLoading, error: shippingError } = useShippingConfig();
  const totals = useCartTotals(
    shippingConfig
      ? {
          rates: shippingConfig.rates,
          freeShippingThreshold: shippingConfig.freeShippingThreshold,
        }
      : undefined
  );
  const deliveryFeeLabel = shippingLoading ? "Calculating..." : formatCurrency(totals.deliveryFee);

  if (items.length === 0) {
    return (
      <div className="space-y-8 rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] text-center">
        <h2 className="text-2xl font-semibold">Your cart is empty</h2>
        <p className="text-[var(--muted)]">Add some products to get started</p>
        <Button asChild className="bg-[var(--accent)] hover:border-[var(--foreground)] hover:bg-[var(--accent)] hover:text-black transition-all duration-300 active:scale-95
          ">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-4 md:p-6 shadow-[var(--shadow-card)]">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-[var(--muted)]">
            <tr>
              <th className="pb-3 font-normal">Product</th>
              <th className="pb-3 font-normal">Price</th>
              <th className="pb-3 font-normal">Quantity</th>
              <th className="pb-3 font-normal">Total</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {items.map((item) => (
              <tr key={item.variantSku}>
                <td className="py-4">
                  <div className="flex items-center gap-4">
                    {item.thumbnail && (
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        width={72}
                        height={96}
                        className="rounded-[var(--radius-md)] object-cover flex-shrink-0"
                        unoptimized={item.thumbnail.startsWith("http")}
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{item.title}</p>
                        {item.customFields && item.customFields.length > 0 && (
                          <Badge tone="brand" className="text-xs">Custom Order</Badge>
                        )}
                      </div>
                      <p className="text-xs text-[var(--muted)]">
                        {item.size} · {item.color ?? "Multi"}
                      </p>
                      {item.customFields && item.customFields.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {item.customFields.map((field, idx) => (
                            <p key={idx} className="text-xs text-[var(--muted)]">
                              <span className="font-medium">{field.label}:</span> {field.value}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4">{formatCurrency(item.price)}</td>
                <td className="py-4">
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(event) =>
                      updateQty(item.variantSku, Number(event.target.value))
                    }
                    className="w-20"
                  />
                </td>
                <td className="py-4">
                  {formatCurrency(item.price * item.quantity)}
                </td>
                <td className="py-4 text-right">
                  <button
                    onClick={() => removeItem(item.variantSku)}
                    className="text-sm text-[var(--muted)] underline hover:text-red-600 transition-colors duration-200 active:scale-95"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {items.map((item) => (
          <div
            key={item.variantSku}
            className="flex gap-3 pb-4 border-b border-[var(--border)] last:border-0 last:pb-0"
          >
            {item.thumbnail && (
              <Image
                src={item.thumbnail}
                alt={item.title}
                width={80}
                height={100}
                className="rounded-[var(--radius-md)] object-cover flex-shrink-0"
                unoptimized={item.thumbnail.startsWith("http")}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-sm">{item.title}</p>
                {item.customFields && item.customFields.length > 0 && (
                  <Badge tone="brand" className="text-xs">Custom</Badge>
                )}
              </div>
              <p className="text-xs text-[var(--muted)] mb-2">
                {item.size} · {item.color ?? "Multi"}
              </p>
              {item.customFields && item.customFields.length > 0 && (
                <div className="mb-2 space-y-1">
                  {item.customFields.map((field, idx) => (
                    <p key={idx} className="text-xs text-[var(--muted)]">
                      <span className="font-medium">{field.label}:</span> {field.value}
                    </p>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-sm font-medium">
                  {formatCurrency(item.price)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--muted)]">Qty:</span>
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(event) =>
                      updateQty(item.variantSku, Number(event.target.value))
                    }
                    className="w-16 h-8 text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">
                  {formatCurrency(item.price * item.quantity)}
                </span>
                <button
                  onClick={() => removeItem(item.variantSku)}
                  className="text-xs text-[var(--muted)] underline hover:text-red-600 transition-colors duration-200 active:scale-95"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <CouponSection />
      <div className="flex flex-col gap-4 rounded-[var(--radius-lg)] bg-[var(--accent)]/50 p-4 md:p-6 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(totals.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery fee</span>
          <span>{deliveryFeeLabel}</span>
        </div>
        {totals.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-{formatCurrency(totals.discount)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatCurrency(totals.total)}</span>
        </div>
        {shippingError && (
          <p className="text-xs text-red-500">
            Using fallback shipping rates due to a configuration error.
          </p>
        )}
      </div>
    </div>
  );
};

