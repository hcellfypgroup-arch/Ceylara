import { SiteSettingModel, type SiteSettingDocument } from "@/lib/models";

export class SiteSettingRepository {
  async find(): Promise<SiteSettingDocument | null> {
    const settings = await SiteSettingModel.findOne().lean() as SiteSettingDocument | null;
    return settings;
  }

  async create(data: Partial<SiteSettingDocument>): Promise<SiteSettingDocument> {
    const settings = await SiteSettingModel.create(data);
    return settings.toObject();
  }

  async update(data: Partial<SiteSettingDocument>): Promise<SiteSettingDocument | null> {
    const settings = await SiteSettingModel.findOneAndUpdate({}, data, {
      new: true,
      upsert: true,
    }).lean() as SiteSettingDocument | null;
    return settings;
  }
}

export const siteSettingRepository = new SiteSettingRepository();


