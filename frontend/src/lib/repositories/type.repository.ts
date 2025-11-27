import { TypeModel, type TypeDocument } from "@/lib/models";
import type { PaginationOptions, PaginatedResult } from "./_types";
import { paginate } from "./_utils";

export class TypeRepository {
  async findById(id: string): Promise<TypeDocument | null> {
    return TypeModel.findById(id).lean() as Promise<TypeDocument | null>;
  }

  async findBySlug(slug: string): Promise<TypeDocument | null> {
    return TypeModel.findOne({ slug }).lean() as Promise<TypeDocument | null>;
  }

  async create(data: Partial<TypeDocument>): Promise<TypeDocument> {
    const type = await TypeModel.create(data);
    return type.toObject();
  }

  async update(id: string, data: Partial<TypeDocument>): Promise<TypeDocument | null> {
    const type = await TypeModel.findByIdAndUpdate(id, data, { new: true }).lean() as TypeDocument | null;
    return type;
  }

  async delete(id: string): Promise<boolean> {
    const result = await TypeModel.findByIdAndDelete(id);
    return !!result;
  }

  async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<TypeDocument>> {
    const query = TypeModel.find().sort({ position: 1 });
    return paginate<TypeDocument>(query, options);
  }

  async checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
    const query: any = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const count = await TypeModel.countDocuments(query);
    return count > 0;
  }
}

export const typeRepository = new TypeRepository();

