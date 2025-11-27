"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SizeChartModal } from "@/components/product/size-chart-modal";
import { CustomOrderModal } from "@/components/product/custom-order-modal";
import { SIZE_OPTIONS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";

type Variant = {
  sku: string;
  size?: string;
  color?: string;
  price: number;
  stock: number;
};

type ProductInfoPanelProps = {
  product: {
    id: string;
    title: string;
    price: number;
    salePrice?: number;
    description: string;
    fabrics: string[];
    careInstructions: string;
    deliveryInfo?: string;
    sizes?: string[];
    sku?: string;
    thumbnail?: string;
    weight?: number; // Weight in grams
    isCustomOrderEnabled?: boolean;
    customOrderSurcharge?: number;
    customFields?: Array<{
      label: string;
      type: "text" | "number" | "textarea" | "dropdown";
      required: boolean;
      options?: string[];
    }>;
  };
  variants?: Variant[];
  categories?: Array<{ id: string; name: string; slug: string }>;
  types?: Array<{ id: string; name: string; slug: string }>;
};

export const ProductInfoPanel = ({ product, variants = [], categories = [], types = [] }: ProductInfoPanelProps) => {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);
  const wishlistToggle = useWishlistStore((state) => state.toggle);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist);
  const panelRef = useRef<HTMLDivElement>(null);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] ?? SIZE_OPTIONS[0]);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(() => {
    const firstVariantWithColor = variants.find((variant) => Boolean(variant.color));
    return firstVariantWithColor?.color ?? undefined;
  });
  const [wishlisted, setWishlisted] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showCustomOrderModal, setShowCustomOrderModal] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  // Only check wishlist state after component mounts to avoid hydration mismatch
  useEffect(() => {
    setWishlisted(isInWishlist(product.id));
  }, [product.id, isInWishlist]);

  useEffect(() => {
    const target = panelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const colorOptions =
    variants
      ?.map((variant) => variant.color)
      .filter((color): color is string => Boolean(color))
      .filter((color, index, array) => array.indexOf(color) === index) ?? [];

  // Find variant based on selected size/color combo
  const selectedVariant =
    variants.find((variant) => {
      const matchesSize = product.sizes?.length ? variant.size === selectedSize : true;
      const matchesColor = colorOptions.length ? variant.color === selectedColor : true;
      return matchesSize && matchesColor;
    }) ||
    variants.find((variant) => (colorOptions.length ? variant.color === selectedColor : false)) ||
    variants.find((variant) => (product.sizes?.length ? variant.size === selectedSize : false)) ||
    variants[0];
  const displayPrice = selectedVariant?.price || product.salePrice || product.price;
  const inStock = selectedVariant ? selectedVariant.stock > 0 : true;

  // Check if the selected variant is in the cart
  const isInCart = selectedVariant
    ? items.some((item) => item.variantSku === selectedVariant.sku)
    : false;

  const handleCart = () => {
    if (isInCart) {
      router.push("/cart");
      return;
    }

    if (!selectedVariant) {
      console.error("No variant selected");
      return;
    }

    if (selectedVariant.stock < 1) {
      alert("This item is out of stock");
      return;
    }

    addItem({
      productId: product.id,
      variantSku: selectedVariant.sku,
      title: product.title,
      price: displayPrice,
      quantity: 1,
      size: selectedVariant.size,
      color: selectedVariant.color,
      thumbnail: product.thumbnail,
      weight: product.weight || 0,
    });
  };

  return (
    <div
      ref={panelRef}
      className={`space-y-4 sm:space-y-6 rounded-[var(--radius-lg)] sm:rounded-[var(--radius-xl)] border border-[var(--border)] bg-white/95 p-4 sm:p-5 md:p-6 shadow-[var(--shadow-card)] backdrop-blur-sm transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${
        isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <div className="space-y-2 sm:space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {inStock ? (
            <Badge tone="brand" className="text-xs sm:text-sm">In stock</Badge>
          ) : (
            <Badge tone="neutral" className="text-xs sm:text-sm">Out of stock</Badge>
          )}
          {product.isCustomOrderEnabled === true && (
            <Badge tone="brand" className="text-xs sm:text-sm">
              Custom Orders Available
            </Badge>
          )}
          {types.map((type) => (
            <Badge key={type.id} tone="neutral" className="text-xs sm:text-sm">
              {type.name}
            </Badge>
          ))}
          {categories.map((category) => (
            <Badge key={category.id} tone="neutral" className="text-xs sm:text-sm">
              {category.name}
            </Badge>
          ))}
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--foreground)]">
          {product.title}
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-[var(--muted)]">{product.description}</p>
        <div className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl font-semibold">
          <span>{formatCurrency(displayPrice)}</span>
          {selectedVariant && selectedVariant.price < product.price && (
            <span className="text-sm sm:text-base text-[var(--muted)] line-through">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>
      </div>

      {product.sizes && product.sizes.length > 0 && (
        <section className="space-y-3 sm:space-y-4 rounded-[var(--radius-md)] sm:rounded-[var(--radius-lg)] border border-[var(--border)]/60 bg-[var(--accent)]/10 p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 text-xs sm:text-sm">
            <p className="font-medium text-[var(--foreground)]">Size</p>
            <button
              type="button"
              className="text-[var(--muted)] underline text-xs sm:text-sm touch-manipulation"
              aria-haspopup="dialog"
              aria-expanded={showSizeGuide}
              onClick={() => setShowSizeGuide(true)}
            >
              Size guide
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {product.sizes.map((sizeOption) => {
              const variantForSize = variants.find((v) => v.size === sizeOption);
              const isOutOfStock = variantForSize ? variantForSize.stock < 1 : false;
              const isSelected = selectedSize === sizeOption;

              return (
                <button
                  key={sizeOption}
                  disabled={isOutOfStock}
                  className={`rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm transition touch-manipulation min-w-[44px] ${
                    isSelected
                      ? "border-[var(--foreground)] bg-[var(--foreground)] text-white"
                      : isOutOfStock
                      ? "border-[var(--border)] text-[var(--muted)] opacity-50 cursor-not-allowed"
                      : "border-[var(--border)] text-[var(--foreground)] hover:border-[var(--foreground)] active:scale-95"
                  }`}
                  onClick={() => {
                    setSelectedSize(sizeOption);
                    if (colorOptions.length > 0 && selectedColor) {
                      const combinationExists = variants.some(
                        (variant) => variant.size === sizeOption && variant.color === selectedColor
                      );
                      if (!combinationExists) {
                        const fallbackVariant = variants.find((variant) => variant.size === sizeOption);
                        if (fallbackVariant?.color && fallbackVariant.color !== selectedColor) {
                          setSelectedColor(fallbackVariant.color);
                        }
                      }
                    }
                  }}
                >
                  {sizeOption}
                </button>
              );
            })}
          </div>
          <p className="text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.4em] text-[var(--muted)]">
            Delivery between 3-5 days
          </p>
        </section>
      )}

      {colorOptions.length > 0 && (
        <section className="space-y-2 sm:space-y-3 rounded-[var(--radius-md)] sm:rounded-[var(--radius-lg)] border border-[var(--border)]/60 p-3 sm:p-4">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <p className="font-medium text-[var(--foreground)]">Color</p>
            {selectedColor && (
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-[var(--muted)]">
                {selectedColor}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {colorOptions.map((color) => {
              const isSelected = color === selectedColor;
              const isAvailableForSize = product.sizes?.length
                ? variants.some((variant) => variant.size === selectedSize && variant.color === color)
                : true;

              return (
                <button
                  key={color}
                  type="button"
                  disabled={!isAvailableForSize}
                  className={`flex items-center gap-1.5 sm:gap-2 rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm transition touch-manipulation ${
                    isSelected
                      ? "border-[var(--foreground)] bg-[var(--foreground)] text-white"
                      : !isAvailableForSize
                      ? "border-[var(--border)] text-[var(--muted)] opacity-50 cursor-not-allowed"
                      : "border-[var(--border)] text-[var(--foreground)] hover:border-[var(--foreground)] active:scale-95"
                  }`}
                  onClick={() => {
                    setSelectedColor(color);
                    if (product.sizes?.length) {
                      const combinationExists = variants.some(
                        (variant) => variant.size === selectedSize && variant.color === color
                      );
                      if (!combinationExists) {
                        const fallbackVariant = variants.find((variant) => variant.color === color);
                        if (fallbackVariant?.size && fallbackVariant.size !== selectedSize) {
                          setSelectedSize(fallbackVariant.size);
                        }
                      }
                    }
                  }}
                >
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <span
                      className="h-3 w-3 sm:h-4 sm:w-4 rounded-full border border-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]"
                      style={{ backgroundColor: color }}
                    />
                    <span>{color}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <div className="space-y-2 sm:space-y-3 rounded-[var(--radius-md)] sm:rounded-[var(--radius-lg)] bg-[var(--accent)]/15 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button 
            className="flex-1 min-w-0 whitespace-nowrap hover:shadow-lg hover:shadow-[var(--primary)]/40 transition-all duration-300 active:scale-95 touch-manipulation text-sm sm:text-base" 
            size="pill" 
            onClick={handleCart}
            disabled={!inStock || !selectedVariant}
          >
            {isInCart ? "View Cart" : "Add to Cart"}
          </Button>
          <Button
            variant="outline"
            size="pill"
            className="flex-1 sm:flex-initial hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all duration-300 active:scale-95 touch-manipulation text-sm sm:text-base"
            onClick={async () => {
              await wishlistToggle({
                productId: product.id,
                title: product.title,
                price: product.salePrice ?? product.price,
                image: product.thumbnail,
              });
              // Update local state after toggle
              setWishlisted(isInWishlist(product.id));
            }}
          >
            {wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          </Button>
        </div>
        {product.isCustomOrderEnabled === true && (
          <Button
            variant="outline"
            size="pill"
            className="w-full hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all duration-300 active:scale-95 touch-manipulation text-sm sm:text-base"
            onClick={() => setShowCustomOrderModal(true)}
          >
            Order Custom
          </Button>
        )}
      </div>

      <div className="space-y-3 sm:space-y-4 rounded-[var(--radius-md)] sm:rounded-[var(--radius-lg)] border border-[var(--border)]/60 p-3 sm:p-4">
        <div className="space-y-1.5 sm:space-y-2">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
            Fabric & Care
          </p>
          <ul className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-[var(--muted)] space-y-1">
            {product.fabrics.map((fabric) => (
              <li key={fabric}>{fabric}</li>
            ))}
          </ul>
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-[var(--muted)]">
            {product.careInstructions}
          </p>
        </div>
        <div className="space-y-1.5 sm:space-y-2">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
            Delivery
          </p>
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-[var(--muted)]">
            {product.deliveryInfo ?? "Standard delivery: 3-5 working days."}
          </p>
        </div>
      </div>
      <SizeChartModal open={showSizeGuide} onClose={() => setShowSizeGuide(false)} />
      {product.isCustomOrderEnabled === true && (
        <CustomOrderModal
          open={showCustomOrderModal}
          onClose={() => setShowCustomOrderModal(false)}
          product={product}
          variants={variants}
        />
      )}
    </div>
  );
};

