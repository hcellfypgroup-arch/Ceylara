/**
 * Shipping calculation service based on weight
 * 
 * Shipping rates are now configurable through the admin panel
 * and stored in the database.
 */

import { db } from "@/lib/db";

export interface ShippingCalculationInput {
  totalWeight: number; // in grams
  subtotal: number; // order subtotal in LKR
  freeShippingThreshold?: number; // default 15000
}

export interface ShippingRate {
  minWeight: number; // in grams
  maxWeight: number; // in grams, -1 represents Infinity
  fee: number; // in LKR
}

// Default rates (used as fallback)
const DEFAULT_RATES: ShippingRate[] = [
  { minWeight: 0, maxWeight: 500, fee: 500 },
  { minWeight: 501, maxWeight: 1000, fee: 800 },
  { minWeight: 1001, maxWeight: 2000, fee: 1200 },
  { minWeight: 2001, maxWeight: 5000, fee: 2000 },
  { minWeight: 5001, maxWeight: -1, fee: 3000 },
];

const DEFAULT_FREE_SHIPPING_THRESHOLD = 15000;

export class ShippingService {
  /**
   * Get shipping rates from database or return defaults
   */
  static async getShippingRates(): Promise<ShippingRate[]> {
    try {
      await db.connect();
      // Lazy import to avoid circular dependency issues
      const { SiteSettingModel } = await import("@/lib/models");
      const settings = await SiteSettingModel.findOne();
      if (settings?.shipping?.rates && settings.shipping.rates.length > 0) {
        return settings.shipping.rates;
      }
    } catch (error) {
      console.error("Failed to fetch shipping rates from database:", error);
    }
    return DEFAULT_RATES;
  }

  /**
   * Get free shipping threshold from database or return default
   */
  static async getFreeShippingThreshold(): Promise<number> {
    try {
      await db.connect();
      // Lazy import to avoid circular dependency issues
      const { SiteSettingModel } = await import("@/lib/models");
      const settings = await SiteSettingModel.findOne();
      if (settings?.shipping?.freeShippingThreshold) {
        return settings.shipping.freeShippingThreshold;
      }
    } catch (error) {
      console.error("Failed to fetch free shipping threshold:", error);
    }
    return DEFAULT_FREE_SHIPPING_THRESHOLD;
  }

  /**
   * Calculate shipping fee based on total weight and order subtotal (async version)
   */
  static async calculateShippingFee(input: ShippingCalculationInput): Promise<number> {
    const { totalWeight, subtotal, freeShippingThreshold } = input;

    // Get threshold from database if not provided
    const threshold = freeShippingThreshold ?? await this.getFreeShippingThreshold();

    // Free shipping if order subtotal exceeds threshold
    if (subtotal >= threshold) {
      return 0;
    }

    // Get rates from database
    const rates = await this.getShippingRates();

    // Find the appropriate shipping rate based on weight
    const rate = rates.find((r) => {
      const maxWeight = r.maxWeight === -1 ? Infinity : r.maxWeight;
      return totalWeight >= r.minWeight && totalWeight <= maxWeight;
    });

    if (rate) {
      return rate.fee;
    }

    // If no rate found, use the last rate (usually the highest weight tier)
    return rates[rates.length - 1]?.fee || DEFAULT_RATES[DEFAULT_RATES.length - 1].fee;
  }

  /**
   * Calculate shipping fee synchronously using provided rates (for client-side use)
   */
  static calculateShippingFeeSync(
    input: ShippingCalculationInput,
    rates: ShippingRate[] = DEFAULT_RATES,
    threshold: number = DEFAULT_FREE_SHIPPING_THRESHOLD
  ): number {
    const { totalWeight, subtotal, freeShippingThreshold } = input;
    const shippingThreshold = freeShippingThreshold ?? threshold;

    // Free shipping if order subtotal exceeds threshold
    if (subtotal >= shippingThreshold) {
      return 0;
    }

    // Find the appropriate shipping rate based on weight
    const rate = rates.find((r) => {
      const maxWeight = r.maxWeight === -1 ? Infinity : r.maxWeight;
      return totalWeight >= r.minWeight && totalWeight <= maxWeight;
    });

    if (rate) {
      return rate.fee;
    }

    // If no rate found, use the last rate
    return rates[rates.length - 1]?.fee || DEFAULT_RATES[DEFAULT_RATES.length - 1].fee;
  }

  /**
   * Get shipping rate for a specific weight (synchronous version using defaults)
   */
  static getShippingRate(weight: number, rates?: ShippingRate[]): ShippingRate {
    const rateList = rates || DEFAULT_RATES;
    const rate = rateList.find((r) => {
      const maxWeight = r.maxWeight === -1 ? Infinity : r.maxWeight;
      return weight >= r.minWeight && weight <= maxWeight;
    });
    return rate || rateList[rateList.length - 1];
  }

  /**
   * Calculate total weight from order items
   */
  static calculateTotalWeight(items: Array<{ weight?: number; quantity: number }>): number {
    return items.reduce((total, item) => {
      const itemWeight = item.weight || 0; // Default to 0 if weight not specified
      return total + itemWeight * item.quantity;
    }, 0);
  }
}

