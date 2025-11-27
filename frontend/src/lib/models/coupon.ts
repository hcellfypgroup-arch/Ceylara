import mongoose, { Schema, type InferSchemaType, models } from "mongoose";

const couponSchema = new Schema(
  {
    code: { type: String, unique: true, required: true },
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true },
    minSpend: Number,
    maxDiscount: Number,
    startsAt: Date,
    endsAt: Date,
    usageLimit: Number,
    usedCount: { type: Number, default: 0 },
    autoApply: { type: Boolean, default: false },
    applicableCategories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    isActive: { type: Boolean, default: true },
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);

export type CouponDocument = InferSchemaType<typeof couponSchema>;

export const CouponModel =
  models.Coupon ?? mongoose.model<CouponDocument>("Coupon", couponSchema);

