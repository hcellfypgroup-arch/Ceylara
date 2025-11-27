import type { SizeChartDocument } from "@/lib/models";
import { sizeChartRepository } from "@/lib/repositories";

export class SizeChartService {
  async getAllSizeCharts() {
    return sizeChartRepository.findAll();
  }

  async getSizeChartById(id: string) {
    const chart = await sizeChartRepository.findById(id);
    if (!chart) {
      throw new Error("Size chart not found");
    }
    return chart;
  }

  async getDefaultSizeChart() {
    const chart = await sizeChartRepository.findDefault();
    if (!chart) {
      throw new Error("Default size chart not configured");
    }
    return chart;
  }

  async createSizeChart(data: Partial<SizeChartDocument>) {
    if (data.isDefault) {
      await sizeChartRepository.clearDefault();
    } else {
      const existingDefault = await sizeChartRepository.findDefault();
      if (!existingDefault) {
        data.isDefault = true;
      }
    }

    return sizeChartRepository.create(data);
  }

  async updateSizeChart(id: string, data: Partial<SizeChartDocument>) {
    const existing = await sizeChartRepository.findById(id);
    if (!existing) {
      throw new Error("Size chart not found");
    }

    if (data.isDefault) {
      await sizeChartRepository.clearDefault(id);
    } else if (data.isDefault === false) {
      // Prevent removing the last default chart without assigning another default first
      const otherDefault = await sizeChartRepository.findDefault();
      if (!otherDefault || otherDefault._id?.toString() === id) {
        throw new Error("At least one size chart must remain default");
      }
    }

    const updated = await sizeChartRepository.update(id, data);
    if (!updated) {
      throw new Error("Failed to update size chart");
    }
    return updated;
  }

  async deleteSizeChart(id: string) {
    const existing = await sizeChartRepository.findById(id);
    if (!existing) {
      throw new Error("Size chart not found");
    }

    if (existing.isDefault) {
      throw new Error("Set another chart as default before deleting this one");
    }

    await sizeChartRepository.delete(id);
    return true;
  }
}

export const sizeChartService = new SizeChartService();


