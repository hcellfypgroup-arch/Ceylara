"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishlistItem = {
  productId: string;
  title: string;
  price: number;
  image?: string;
};

type WishlistState = {
  items: WishlistItem[];
  synced: boolean;
  toggle: (item: WishlistItem) => Promise<void>;
  syncFromServer: () => Promise<void>;
  clear: () => void;
  isInWishlist: (productId: string) => boolean;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      synced: false,
      isInWishlist: (productId: string) => {
        return get().items.some((item) => item.productId === productId);
      },
      toggle: async (item) => {
        const exists = get().items.find((entry) => entry.productId === item.productId);
        
        // Update local state immediately for better UX
        if (exists) {
          set({
            items: get().items.filter(
              (entry) => entry.productId !== item.productId
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }

        // Sync with backend if user is logged in
        try {
          const response = await fetch("/api/account/profile");
          if (response.ok) {
            // User is logged in, sync with backend
            if (exists) {
              await fetch("/api/account/wishlist", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: item.productId }),
              });
            } else {
              await fetch("/api/account/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: item.productId }),
              });
            }
          }
        } catch (error) {
          // If user is not logged in or API fails, keep local state
          // The local state was already updated above
          console.warn("Wishlist sync failed (user may not be logged in):", error);
        }
      },
      syncFromServer: async () => {
        try {
          const response = await fetch("/api/account/wishlist");
          if (response.ok) {
            const { data } = await response.json();
            // Map backend products to wishlist items
            const items: WishlistItem[] = (data || []).map((product: any) => {
              const variantPrices = product.variants?.map((v: any) => v.price || product.basePrice) || [];
              const minPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : product.basePrice;
              
              return {
                productId: product._id?.toString() || product.id,
                title: product.title,
                price: minPrice,
                image: product.heroImage,
              };
            });
            set({ items, synced: true });
          }
        } catch (error) {
          console.warn("Failed to sync wishlist from server:", error);
        }
      },
      clear: () => set({ items: [], synced: false }),
    }),
    {
      name: "ceylara-wishlist",
    }
  )
);

