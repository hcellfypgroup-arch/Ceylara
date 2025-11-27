import { typeRepository } from "@/lib/repositories";
import type { TypeDocument } from "@/lib/models";
import { slugify } from "@/lib/utils";

export class TypeService {
  async createType(data: Partial<TypeDocument>) {
    if (!data.slug) {
      data.slug = slugify(data.name || "");
    }

    const exists = await typeRepository.checkSlugExists(data.slug);
    if (exists) {
      // If slug exists, append a number to make it unique
      let counter = 1;
      let uniqueSlug = data.slug;
      while (await typeRepository.checkSlugExists(uniqueSlug)) {
        uniqueSlug = `${data.slug}-${counter}`;
        counter++;
      }
      data.slug = uniqueSlug;
    }

    return typeRepository.create(data);
  }

  async updateType(id: string, data: Partial<TypeDocument>) {
    if (data.name && !data.slug) {
      data.slug = slugify(data.name);
    }

    if (data.slug) {
      const exists = await typeRepository.checkSlugExists(data.slug, id);
      if (exists) {
        // If slug exists, append a number to make it unique
        let counter = 1;
        let uniqueSlug = data.slug;
        while (await typeRepository.checkSlugExists(uniqueSlug, id)) {
          uniqueSlug = `${data.slug}-${counter}`;
          counter++;
        }
        data.slug = uniqueSlug;
      }
    }

    return typeRepository.update(id, data);
  }

  async deleteType(id: string) {
    const type = await typeRepository.findById(id);
    if (!type) {
      throw new Error("Type not found");
    }

    return typeRepository.delete(id);
  }

  async getTypeBySlug(slug: string) {
    const type = await typeRepository.findBySlug(slug);
    if (!type) {
      throw new Error("Type not found");
    }
    return type;
  }

  async getTypeById(id: string) {
    const type = await typeRepository.findById(id);
    if (!type) {
      throw new Error("Type not found");
    }
    return type;
  }

  async getAllTypes() {
    const result = await typeRepository.findAll({ limit: 1000 });
    return result.data;
  }
}

export const typeService = new TypeService();

