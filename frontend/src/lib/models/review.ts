import mongoose, { Schema, type InferSchemaType, models } from "mongoose";

const reviewSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    title: String,
    comment: String,
    rating: { type: Number, min: 1, max: 5, required: true },
    images: [String],
    status: {
      type: String,
      enum: ["pending", "approved", "blocked"],
      default: "pending",
    },
    adminReply: {
      message: String,
      repliedAt: Date,
    },
  },
  { timestamps: true }
);

export type ReviewDocument = InferSchemaType<typeof reviewSchema>;

export const ReviewModel =
  models.Review ?? mongoose.model<ReviewDocument>("Review", reviewSchema);

