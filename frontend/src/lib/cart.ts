import type { ProductDocument } from "@/lib/models";
import { ShippingService, type ShippingRate } from "@/lib/services/shipping.service";

export type CartItem = {
  productId: string;
  variantSku: string;
  title: string;
  price: number;
  quantity: number;
  thumbnail?: string;
  size?: string;
  color?: string;
  weight?: number; // Weight in grams
  customFields?: Array<{ label: string; value: string }>;
};

type CartTotalsOptions = {
  deliveryFee?: number;
  discount?: number;
  shippingConfig?: {
    rates?: ShippingRate[];
    freeShippingThreshold?: number;
  };
};

export const calcCartTotals = (
  items: CartItem[],
  options?: CartTotalsOptions
) => {
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  
  // Calculate shipping based on weight if not provided
  // Note: For client-side calculations, we use default rates
  // The actual rates from database will be used in server-side order creation
  let deliveryFee = options?.deliveryFee;
  if (deliveryFee === undefined) {
    const totalWeight = ShippingService.calculateTotalWeight(
      items.map(item => ({ weight: item.weight || 0, quantity: item.quantity }))
    );
    deliveryFee = ShippingService.calculateShippingFeeSync(
      {
        totalWeight,
        subtotal,
        freeShippingThreshold: options?.shippingConfig?.freeShippingThreshold,
      },
      options?.shippingConfig?.rates,
      options?.shippingConfig?.freeShippingThreshold
    );
  }
  
  const discount = options?.discount ?? 0;
  const total = Math.max(subtotal + deliveryFee - discount, 0);

  return { subtotal, deliveryFee, discount, total };
};

export const buildCartEntry = (product: ProductDocument, variantSku: string) => {
  const variant = product.variants.find((v) => v.sku === variantSku);
  if (!variant) throw new Error("Variant not found");

  const productWithId = product as typeof product & { _id?: { toString(): string } | string };
  const productId = productWithId._id 
    ? (typeof productWithId._id === 'object' ? productWithId._id.toString() : String(productWithId._id))
    : '';

  return {
    productId,
    variantSku,
    title: product.title,
    size: variant.size,
    color: variant.color,
    thumbnail: variant.images?.[0] ?? product.heroImage,
    price: variant.salePrice ?? variant.price,
    quantity: 1,
    weight: product.weight || 0, // Include product weight in grams
  };
};

