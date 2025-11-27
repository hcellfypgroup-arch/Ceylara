import { SizeChartModel, type SizeChartDocument } from "@/lib/models";

export class SizeChartRepository {
  async findAll(): Promise<SizeChartDocument[]> {
    const charts = await SizeChartModel.find().sort({ updatedAt: -1 }).lean();
    return charts as unknown as SizeChartDocument[];
  }

  async findById(id: string): Promise<SizeChartDocument | null> {
    return SizeChartModel.findById(id).lean() as Promise<SizeChartDocument | null>;
  }

  async findDefault(): Promise<SizeChartDocument | null> {
    return SizeChartModel.findOne({ isDefault: true }).lean() as Promise<SizeChartDocument | null>;
  }

  async create(data: Partial<SizeChartDocument>): Promise<SizeChartDocument> {
    const chart = await SizeChartModel.create(data);
    return chart.toObject();
  }

  async update(id: string, data: Partial<SizeChartDocument>): Promise<SizeChartDocument | null> {
    const chart = await SizeChartModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();
    return chart as SizeChartDocument | null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await SizeChartModel.findByIdAndDelete(id);
    return Boolean(result);
  }

  async clearDefault(excludeId?: string): Promise<void> {
    const query = excludeId ? { _id: { $ne: excludeId } } : {};
    await SizeChartModel.updateMany(query, { $set: { isDefault: false } });
  }
}

export const sizeChartRepository = new SizeChartRepository();


