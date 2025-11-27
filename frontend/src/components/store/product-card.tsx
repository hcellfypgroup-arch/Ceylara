"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Heart, ShoppingBag, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";

type ProductCardProps = {
  id: string;
  slug: string;
  title: string;
  price: number;
  salePrice?: number;
  image: string;
  badge?: string;
  variants?: { sku: string; size?: string; color?: string }[];
  weight?: number; // Weight in grams
};

export const ProductCard = ({
  id,
  slug,
  title,
  price,
  salePrice,
  image,
  badge,
  variants = [],
  weight = 0,
}: ProductCardProps) => {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);
  const wishlistToggle = useWishlistStore((state) => state.toggle);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist);
  const [wishlisted, setWishlisted] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only check wishlist state after component mounts to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    setWishlisted(isInWishlist(id));
  }, [id, isInWishlist]);

  // Check if this product variant is in the cart
  const variantSku = variants && variants.length > 0 ? variants[0].sku : null;
  const isInCart = variantSku ? items.some((item) => item.variantSku === variantSku) : false;

  const handleAddToCart = () => {
    // If no variants, redirect to product page to select one
    if (!variants || variants.length === 0) {
      router.push(`/products/${slug}`);
      return;
    }

    const variant = variants[0];
    addItem({
      productId: id,
      variantSku: variant.sku,
      title,
      price: salePrice ?? price,
      quantity: 1,
      thumbnail: image,
      size: variant.size,
      color: variant.color,
      weight: weight || 0,
    });
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await wishlistToggle({ productId: id, title, price: salePrice ?? price, image });
    // Update local state after toggle
    setWishlisted(isInWishlist(id));
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInCart) {
      router.push("/cart");
    } else {
      handleAddToCart();
    }
  };

  return (
    <Link
      href={`/products/${slug}`}
      className="flex flex-col gap-2 sm:gap-3 md:gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-2 sm:p-3 md:p-4 shadow-[var(--shadow-soft)] transition hover:shadow-[var(--shadow-md)] cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-[var(--radius-md)] sm:rounded-[var(--radius-lg)]">
        <Image
          src={image}
          alt={title}
          width={600}
          height={800}
          className="aspect-[3/4] w-full object-cover transition duration-500 hover:scale-[1.03]"
        />
        <div className="absolute left-2 top-2 sm:left-3 sm:top-3 md:left-4 md:top-4 flex flex-col gap-1 sm:gap-2">
          {badge && <Badge tone="brand" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">{badge}</Badge>}
          {salePrice && <Badge tone="success" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">Sale</Badge>}
        </div>
        <button
          className={cn(
            "absolute right-2 top-2 sm:right-3 sm:top-3 md:right-4 md:top-4 rounded-full border border-[var(--border)] bg-white/80 p-1.5 sm:p-2 text-[var(--foreground)] transition hover:bg-white z-10 touch-manipulation",
            wishlisted && "bg-[var(--brand)] text-white"
          )}
          aria-label="Toggle wishlist"
          onClick={handleWishlist}
        >
          <Heart className="size-3 sm:size-4" fill={wishlisted ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="space-y-1 sm:space-y-2 min-h-[60px] sm:min-h-[70px]">
        <h3 className="text-sm sm:text-base md:text-lg font-medium line-clamp-2">{title}</h3>
        <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
          <span className="font-semibold text-[var(--foreground)]">
            {formatCurrency(salePrice ?? price)}
          </span>
          {salePrice && (
            <span className="text-xs sm:text-sm text-[var(--muted)] line-through">
              {formatCurrency(price)}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-2 sm:gap-3" onClick={(e) => e.stopPropagation()}>
        <Button 
          size="sm"
          className="flex-1 gap-1.5 sm:gap-2 text-xs sm:text-sm hover:shadow-lg hover:shadow-[var(--primary)]/30 transition-all duration-300 active:scale-95 touch-manipulation" 
          onClick={handleAddToCartClick}
        >
          {isInCart ? (
            <>
              <ShoppingCart className="size-3 sm:size-4 transition-transform duration-300" />
              <span className="hidden sm:inline">View Cart</span>
              <span className="sm:hidden">Cart</span>
            </>
          ) : (
            <>
              <ShoppingBag className="size-3 sm:size-4 transition-transform duration-300" />
              <span className="hidden sm:inline">Add to Cart</span>
              <span className="sm:hidden">Add</span>
            </>
          )}
        </Button>
      </div>
    </Link>
  );
};

