import mongoose, { Schema, type InferSchemaType, models } from "mongoose";

const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    title: String,
    variantSku: String,
    size: String,
    color: String,
    price: Number,
    quantity: Number,
    thumbnail: String,
    customFields: [
      {
        label: String,
        value: String,
      },
    ],
  },
  { _id: true }
);

const deliverySchema = new Schema(
  {
    method: { type: String, default: "Standard" },
    fee: { type: Number, default: 0 },
    estimatedDate: Date,
    trackingNumber: String,
    provider: String,
    statusHistory: [
      {
        status: String,
        note: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { _id: false }
);

const paymentSchema = new Schema(
  {
    method: {
      type: String,
      enum: ["cod", "card", "bank_transfer"],
      required: true,
    },
    transactionId: String,
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    email: String,
    address: {
      recipientName: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      phone: String,
    },
    items: [orderItemSchema],
    subtotal: Number,
    discount: Number,
    deliveryFee: Number,
    total: Number,
    couponCode: String,
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
    },
    delivery: deliverySchema,
    payment: paymentSchema,
    notes: String,
  },
  { timestamps: true }
);

export type OrderDocument = InferSchemaType<typeof orderSchema>;

export const OrderModel =
  models.Order ?? mongoose.model<OrderDocument>("Order", orderSchema);

