import { siteSettingRepository } from "@/lib/repositories";
import type { SiteSettingDocument } from "@/lib/models";
import type { ServiceResult } from "./types";

export const siteSettingService = {
  get: () => siteSettingRepository.find(),
  update: async (
    payload: Partial<SiteSettingDocument>
  ): Promise<ServiceResult<SiteSettingDocument>> => {
    const doc = await siteSettingRepository.update(payload);
    if (!doc) {
      // If no document exists, create one
      const newDoc = await siteSettingRepository.create(payload);
      return { data: newDoc };
    }
    return { data: doc };
  },
};

