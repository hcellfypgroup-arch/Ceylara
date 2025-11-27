import mongoose, { Schema, type InferSchemaType, models } from "mongoose";

const addressSchema = new Schema(
  {
    label: { type: String, default: "Home" },
    recipientName: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: "IN" },
    phone: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    avatarUrl: String,
    phone: String,
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    addresses: [addressSchema],
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    recentlyViewed: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product" },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
    carts: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product" },
        variantSku: String,
        quantity: { type: Number, default: 1 },
      },
    ],
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof userSchema>;

export const UserModel =
  models.User ?? mongoose.model<UserDocument>("User", userSchema);

