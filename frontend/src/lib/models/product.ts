import mongoose, { Schema, type InferSchemaType, models } from "mongoose";

const variantSchema = new Schema(
  {
    sku: { type: String, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    stock: { type: Number, default: 0 },
    price: { type: Number, required: true },
    salePrice: Number,
    images: [String],
  },
  { _id: true }
);

const productSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    summary: String,
    description: String,
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    types: [{ type: Schema.Types.ObjectId, ref: "Type" }],
    tags: [String],
    heroImage: String,
    gallery: [String],
    variants: [variantSchema],
    basePrice: { type: Number, required: true },
    discount: Number,
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    materials: [String],
    sleeveLength: { type: String, enum: ["Sleeveless", "Short", "3/4", "Long"] },
    style: { type: String, enum: ["Casual", "Formal", "Festive", "Athleisure", "Modest"] },
    careInstructions: String,
    fabrics: [String],
    weight: { type: Number, default: 0 }, // Weight in grams
    rating: { type: Number, default: 4.7 },
    ratingCount: { type: Number, default: 0 },
    isCustomOrderEnabled: { type: Boolean, default: false },
    customOrderSurcharge: { type: Number, default: 0 },
    customFields: [
      {
        label: { type: String, required: true },
        type: {
          type: String,
          enum: ["text", "number", "textarea", "dropdown"],
          required: true,
        },
        required: { type: Boolean, default: false },
        options: [String], // For dropdown type
      },
    ],
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);

export type ProductDocument = InferSchemaType<typeof productSchema>;

export const ProductModel =
  models.Product ?? mongoose.model<ProductDocument>("Product", productSchema);

