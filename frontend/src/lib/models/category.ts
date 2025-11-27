import mongoose, { Schema, type InferSchemaType, models } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    heroImage: String,
    bannerImage: String,
    parent: { type: Schema.Types.ObjectId, ref: "Category" },
    position: { type: Number, default: 0 },
    filters: {
      colors: [String],
      sizes: [String],
      materials: [String],
      styles: [String],
    },
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);

export type CategoryDocument = InferSchemaType<typeof categorySchema>;

export const CategoryModel =
  models.Category ??
  mongoose.model<CategoryDocument>("Category", categorySchema);

