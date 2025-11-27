"use client";

import { useMemo } from "react";
import { useCartStore, useCartTotals } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useShippingConfig } from "@/hooks/use-shipping-config";

export const CheckoutSummary = () => {
  const items = useCartStore((state) => state.items);
  const { data: shippingConfig, loading: shippingLoading, error: shippingError } = useShippingConfig();
  const totals = useCartTotals(
    shippingConfig
      ? {
          rates: shippingConfig.rates,
          freeShippingThreshold: shippingConfig.freeShippingThreshold,
        }
      : undefined
  );
  const today = useMemo(() => new Date(), []);
  const eta = useMemo(() => {
    const next = new Date();
    next.setDate(next.getDate() + 4);
    return next;
  }, []);
  const deliveryFeeLabel = shippingLoading ? "Calculating..." : formatCurrency(totals.deliveryFee);

  if (items.length === 0) {
    return (
      <div className="space-y-6 rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">
          Order Summary
        </h3>
        <p className="text-sm text-[var(--muted)]">Your cart is empty</p>
        <Link href="/shop">
          <button className="w-full rounded-full border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--accent)] hover:border-[var(--foreground)] transition-all duration-300 active:scale-95">
            Continue Shopping
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 rounded-[var(--radius-lg)] sm:rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-3 sm:p-4 md:p-6 shadow-[var(--shadow-card)]">
      <h3 className="text-base sm:text-lg font-semibold text-[var(--foreground)]">
        Order Summary
      </h3>
      
      <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
        {items.map((item) => (
          <div key={item.variantSku} className="flex gap-2 sm:gap-3 text-xs sm:text-sm">
            {item.thumbnail && (
              <Image
                src={item.thumbnail}
                alt={item.title}
                width={50}
                height={65}
                className="rounded-[var(--radius-md)] object-cover flex-shrink-0"
                unoptimized={item.thumbnail.startsWith("http")}
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.title}</p>
              <p className="text-[10px] sm:text-xs text-[var(--muted)]">
                {item.size} {item.color ? `· ${item.color}` : ""} × {item.quantity}
              </p>
              <p className="text-xs sm:text-sm font-medium mt-0.5 sm:mt-1">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2 sm:space-y-3 border-t border-[var(--border)] pt-3 sm:pt-4 text-xs sm:text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(totals.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery</span>
          <span>{deliveryFeeLabel}</span>
        </div>
        {totals.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-{formatCurrency(totals.discount)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-[var(--border)] pt-2 sm:pt-3 text-sm sm:text-base font-semibold">
          <span>Total</span>
          <span>{formatCurrency(totals.total)}</span>
        </div>
      </div>
      
      <p className="text-[10px] sm:text-xs text-[var(--muted)]">
        Estimated delivery between {today.toLocaleDateString()} -{" "}
        {eta.toLocaleDateString()}
      </p>
      <Link href="/checkout">
        <Button 
          size="pill" 
          className="w-full text-sm sm:text-base hover:shadow-lg hover:shadow-[var(--primary)]/40 transition-all duration-300 active:scale-95 touch-manipulation"
        >
          Proceed to Checkout
        </Button>
      </Link>
      {shippingError && (
        <p className="text-[10px] text-red-500">
          Using fallback shipping rates due to a configuration error.
        </p>
      )}
    </div>
  );
};

