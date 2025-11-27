"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCartStore, useCartTotals } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import { X } from "lucide-react";

export const CouponSection = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const couponCode = useCartStore((state) => state.couponCode);
  const setCoupon = useCartStore((state) => state.setCoupon);
  const totals = useCartTotals();

  const handleApply = async () => {
    if (!code.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          subtotal: totals.subtotal,
        }),
      });

      const { data } = await response.json();

      if (!response.ok || !data.valid) {
        toast.error(data.message || "Invalid coupon code");
        return;
      }

      setCoupon(code.trim().toUpperCase(), data.discount);
      toast.success(`Coupon applied! You saved ${formatCurrency(data.discount)}`);
      setCode("");
    } catch (error) {
      console.error("Failed to validate coupon:", error);
      toast.error("Failed to validate coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setCoupon(null, 0);
    toast.success("Coupon removed");
  };

  if (couponCode) {
    return (
      <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-[var(--radius-md)]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-green-800">
            Coupon: <span className="font-mono">{couponCode}</span>
          </span>
          <span className="text-sm text-green-600">
            -{formatCurrency(totals.discount)}
          </span>
        </div>
        <button
          onClick={handleRemove}
          className="text-green-600 hover:text-green-800 transition-colors"
          aria-label="Remove coupon"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <Input
        placeholder="Coupon code"
        className="flex-1 sm:max-w-xs"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleApply();
          }
        }}
      />
      <Button
        variant="outline"
        onClick={handleApply}
        disabled={loading}
        className="w-full sm:w-auto"
      >
        {loading ? "Applying..." : "Apply coupon"}
      </Button>
    </div>
  );
};

