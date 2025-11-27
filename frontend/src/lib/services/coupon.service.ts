import { couponRepository } from "@/lib/repositories";
import type { CouponDocument } from "@/lib/models";

export class CouponService {
  async createCoupon(data: Partial<CouponDocument>) {
    if (!data.code) {
      throw new Error("Coupon code is required");
    }

    const exists = await couponRepository.checkCodeExists(data.code);
    if (exists) {
      throw new Error("Coupon code already exists");
    }

    return couponRepository.create({
      ...data,
      code: data.code.toUpperCase(),
    });
  }

  async updateCoupon(id: string, data: Partial<CouponDocument>) {
    if (data.code) {
      const exists = await couponRepository.checkCodeExists(data.code, id);
      if (exists) {
        throw new Error("Coupon code already exists");
      }
      data.code = data.code.toUpperCase();
    }

    return couponRepository.update(id, data);
  }

  async deleteCoupon(id: string) {
    return couponRepository.delete(id);
  }

  async getCouponByCode(code: string) {
    const coupon = await couponRepository.findByCode(code);
    if (!coupon) {
      throw new Error("Coupon not found");
    }
    return coupon;
  }

  async validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; discount: number; message?: string }> {
    const coupon = await couponRepository.findByCode(code);
    
    if (!coupon) {
      return { valid: false, discount: 0, message: "Coupon not found" };
    }

    if (!coupon.isActive) {
      return { valid: false, discount: 0, message: "Coupon is not active" };
    }

    if (coupon.minSpend && subtotal < coupon.minSpend) {
      return { valid: false, discount: 0, message: `Minimum spend of ${coupon.minSpend} required` };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, discount: 0, message: "Coupon usage limit reached" };
    }

    const now = new Date();
    if (coupon.startsAt && new Date(coupon.startsAt) > now) {
      return { valid: false, discount: 0, message: "Coupon not yet active" };
    }

    if (coupon.endsAt && new Date(coupon.endsAt) < now) {
      return { valid: false, discount: 0, message: "Coupon has expired" };
    }

    let discount = 0;
    if (coupon.type === "percentage") {
      discount = Math.min((subtotal * coupon.value) / 100, coupon.maxDiscount || Infinity);
    } else {
      discount = Math.min(coupon.value, subtotal);
    }

    return { valid: true, discount };
  }

  async getAllCoupons(page = 1, limit = 10, search?: string) {
    const filter: any = {};
    if (search) {
      filter.code = { $regex: search, $options: "i" };
    }
    return couponRepository.findAll(filter, { page, limit });
  }

  async getActiveCoupons() {
    return couponRepository.findActive();
  }
}

export const couponService = new CouponService();


