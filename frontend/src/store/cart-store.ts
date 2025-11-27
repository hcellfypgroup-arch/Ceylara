"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/lib/cart";
import { calcCartTotals } from "@/lib/cart";
import type { ShippingRate } from "@/lib/services/shipping.service";

type CartState = {
  items: CartItem[];
  couponCode: string | null;
  discount: number;
  addItem: (item: CartItem) => void;
  removeItem: (sku: string) => void;
  updateQty: (sku: string, qty: number) => void;
  clear: () => void;
  setCoupon: (code: string | null, discount: number) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      couponCode: null,
      discount: 0,
      addItem: (item) =>
        set((state) => {
          // For custom orders (items with customFields), always add as new item
          // For regular items, merge with existing if same variantSku
          if (item.customFields && item.customFields.length > 0) {
            return { items: [...state.items, item] };
          }
          const existing = state.items.find(
            (entry) => entry.variantSku === item.variantSku && (!entry.customFields || entry.customFields.length === 0)
          );
          if (existing) {
            return {
              items: state.items.map((entry) =>
                entry.variantSku === item.variantSku && (!entry.customFields || entry.customFields.length === 0)
                  ? { ...entry, quantity: entry.quantity + item.quantity }
                  : entry
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (sku) =>
        set((state) => ({
          items: state.items.filter((entry) => entry.variantSku !== sku),
        })),
      updateQty: (sku, qty) =>
        set((state) => ({
          items: state.items.map((entry) =>
            entry.variantSku === sku ? { ...entry, quantity: qty } : entry
          ),
        })),
      clear: () => set({ items: [], couponCode: null, discount: 0 }),
      setCoupon: (code, discount) => set({ couponCode: code, discount }),
    }),
    {
      name: "selara-cart",
    }
  )
);

type CartTotalsConfig = {
  rates?: ShippingRate[];
  freeShippingThreshold?: number;
};

export const useCartTotals = (shippingConfig?: CartTotalsConfig) => {
  const items = useCartStore((state) => state.items);
  const discount = useCartStore((state) => state.discount);
  return calcCartTotals(items, { discount, shippingConfig });
};

