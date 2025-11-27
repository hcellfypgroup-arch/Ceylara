"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/store/product-card";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";

type WishlistItem = {
  _id: string;
  title: string;
  slug: string;
  heroImage?: string;
  basePrice: number;
  variants?: Array<{
    sku: string;
    size?: string;
    color?: string;
    price: number;
    salePrice?: number;
  }>;
};

export const WishlistList = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/account/wishlist");
      if (response.ok) {
        const { data } = await response.json();
        setItems(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      const response = await fetch("/api/account/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        toast.success("Removed from wishlist");
        await fetchWishlist();
      } else {
        toast.error("Failed to remove item");
      }
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-96 animate-pulse rounded-[var(--radius-lg)] border border-[var(--border)] bg-gray-100"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-12 text-center">
        <Heart className="mx-auto size-12 text-[var(--muted)]" />
        <p className="mt-4 text-lg font-semibold">Your wishlist is empty</p>
        <p className="text-sm text-[var(--muted)] mt-2">
          Save products to compare and checkout later.
        </p>
        <Button asChild className="mt-6 bg-[var(--accent)] text-black">
          <Link href="/shop">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const variantPrices = item.variants?.map((v) => v.price || item.basePrice) || [];
        const minPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : item.basePrice;
        const salePrices = item.variants?.filter((v) => v.salePrice).map((v) => v.salePrice!) || [];
        const minSalePrice = salePrices.length > 0 ? Math.min(...salePrices) : undefined;

        return (
          <div key={item._id} className="relative">
            <ProductCard
              id={item._id}
              slug={item.slug}
              title={item.title}
              price={minPrice}
              salePrice={minSalePrice && minSalePrice < minPrice ? minSalePrice : undefined}
              image={item.heroImage || "/placeholder-product.jpg"}
              variants={item.variants?.map((v) => ({
                sku: v.sku,
                size: v.size,
                color: v.color,
              }))}
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRemove(item._id);
              }}
              className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-2 shadow-md hover:bg-white"
              aria-label="Remove from wishlist"
            >
              <Heart className="size-4 fill-red-500 text-red-500" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

