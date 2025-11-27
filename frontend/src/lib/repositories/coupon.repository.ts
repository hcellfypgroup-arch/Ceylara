import { CouponModel, type CouponDocument } from "@/lib/models";
import type { PaginationOptions, PaginatedResult } from "./_types";
import { paginate } from "./_utils";

export class CouponRepository {
  async findById(id: string): Promise<CouponDocument | null> {
    return CouponModel.findById(id).lean() as Promise<CouponDocument | null>;
  }

  async findByCode(code: string): Promise<CouponDocument | null> {
    return CouponModel.findOne({ code: code.toUpperCase() }).lean() as Promise<CouponDocument | null>;
  }

  async create(data: Partial<CouponDocument>): Promise<CouponDocument> {
    const coupon = await CouponModel.create(data);
    return coupon.toObject();
  }

  async update(id: string, data: Partial<CouponDocument>): Promise<CouponDocument | null> {
    const coupon = await CouponModel.findByIdAndUpdate(id, data, { new: true }).lean() as CouponDocument | null;
    return coupon;
  }

  async delete(id: string): Promise<boolean> {
    const result = await CouponModel.findByIdAndDelete(id);
    return !!result;
  }

  async findAll(filter: Record<string, unknown> = {}, options: PaginationOptions = {}): Promise<PaginatedResult<CouponDocument>> {
    const query = CouponModel.find(filter);
    return paginate<CouponDocument>(query, options);
  }

  async findActive(): Promise<CouponDocument[]> {
    const now = new Date();
    const result = await CouponModel.find({
      isActive: true,
      $or: [
        { startsAt: { $lte: now } },
        { startsAt: { $exists: false } },
      ],
      $and: [
        {
          $or: [
            { endsAt: { $gte: now } },
            { endsAt: { $exists: false } },
          ],
        },
      ],
    }).lean();
    return result as unknown as CouponDocument[];
  }

  async incrementUsage(code: string): Promise<boolean> {
    const result = await CouponModel.updateOne(
      { code: code.toUpperCase() },
      { $inc: { usedCount: 1 } }
    );
    return result.modifiedCount > 0;
  }

  async checkCodeExists(code: string, excludeId?: string): Promise<boolean> {
    const query: any = { code: code.toUpperCase() };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const count = await CouponModel.countDocuments(query);
    return count > 0;
  }
}

export const couponRepository = new CouponRepository();

