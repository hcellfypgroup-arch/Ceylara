import mongoose, { Schema, type InferSchemaType, models } from "mongoose";

const typeSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    heroImage: String,
    bannerImage: String,
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

export type TypeDocument = InferSchemaType<typeof typeSchema>;

export const TypeModel =
  models.Type ??
  mongoose.model<TypeDocument>("Type", typeSchema);

