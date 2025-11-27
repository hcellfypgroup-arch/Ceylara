import mongoose, { Schema, type InferSchemaType, models } from "mongoose";

const measurementSchema = new Schema(
  {
    key: { type: String, required: true }, // unique key used in row values
    label: { type: String, required: true }, // human friendly label
    unit: { type: String, default: "" }, // optional unit (in, cm, etc.)
  },
  { _id: false }
);

const rowSchema = new Schema(
  {
    sizeLabel: { type: String, required: true },
    values: {
      type: Map,
      of: Schema.Types.Mixed, // allow string or number values per measurement key
      default: {},
    },
  },
  { _id: false }
);

const sizeChartSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    measurements: { type: [measurementSchema], default: [] },
    rows: { type: [rowSchema], default: [] },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type SizeChartDocument = InferSchemaType<typeof sizeChartSchema>;

export const SizeChartModel =
  models.SizeChart ?? mongoose.model<SizeChartDocument>("SizeChart", sizeChartSchema);


