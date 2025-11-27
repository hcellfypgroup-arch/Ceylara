import { SiteSettingModel, type SiteSettingDocument } from "@/lib/models";

export const siteSettingRepository = {
  getSingleton: () => SiteSettingModel.findOne().lean(),
  upsert: (payload: Partial<SiteSettingDocument>) =>
    SiteSettingModel.findOneAndUpdate({}, payload, {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }).lean(),
};

