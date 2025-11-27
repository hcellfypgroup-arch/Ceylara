import mongoose, { Schema, type InferSchemaType, models } from "mongoose";

const siteSettingSchema = new Schema(
  {
    logo: String,
    colors: {
      primary: String,
      secondary: String,
      accent: String,
    },
    homepageLayout: Schema.Types.Mixed,
    socialLinks: {
      instagram: String,
      facebook: String,
      pinterest: String,
      youtube: String,
    },
    shipping: {
      // Weight-based shipping rates
      rates: [
        {
          minWeight: { type: Number, default: 0 }, // in grams
          maxWeight: { type: Number, default: Infinity }, // in grams, use -1 for Infinity
          fee: { type: Number, default: 0 }, // in LKR
        },
      ],
      freeShippingThreshold: { type: Number, default: 15000 }, // in LKR
      expressShippingSurcharge: { type: Number, default: 700 }, // Additional fee for express shipping
    },
    paymentMethods: {
      cod: { type: Boolean, default: true },
      card: { type: Boolean, default: true },
      bankTransfer: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export type SiteSettingDocument = InferSchemaType<typeof siteSettingSchema>;

export const SiteSettingModel =
  models.SiteSetting ??
  mongoose.model<SiteSettingDocument>("SiteSetting", siteSettingSchema);

