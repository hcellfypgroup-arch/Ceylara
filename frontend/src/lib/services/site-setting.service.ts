import { siteSettingRepository } from "@/lib/repositories";
import type { SiteSettingDocument } from "@/lib/models";

export class SiteSettingService {
  async getSettings(): Promise<SiteSettingDocument> {
    let settings = await siteSettingRepository.find();
    if (!settings) {
      settings = await siteSettingRepository.create({
        shipping: {
          rates: [] as any,
          freeShippingThreshold: 15000,
          expressShippingSurcharge: 700,
        },
        paymentMethods: {
          cod: true,
          card: true,
          bankTransfer: false,
        },
      });
    }
    return settings;
  }

  async updateSettings(data: Partial<SiteSettingDocument>) {
    return siteSettingRepository.update(data);
  }
}

export const siteSettingService = new SiteSettingService();


