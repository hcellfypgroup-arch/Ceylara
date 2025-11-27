import { CategoryModel, type CategoryDocument } from "@/lib/models";
import type { PaginationOptions, PaginatedResult } from "./_types";
import { paginate } from "./_utils";

export class CategoryRepository {
  async findById(id: string): Promise<CategoryDocument | null> {
    return CategoryModel.findById(id).lean() as Promise<CategoryDocument | null>;
  }

  async findBySlug(slug: string): Promise<CategoryDocument | null> {
    return CategoryModel.findOne({ slug }).lean() as Promise<CategoryDocument | null>;
  }

  async create(data: Partial<CategoryDocument>): Promise<CategoryDocument> {
    const category = await CategoryModel.create(data);
    return category.toObject();
  }

  async update(id: string, data: Partial<CategoryDocument>): Promise<CategoryDocument | null> {
    const category = await CategoryModel.findByIdAndUpdate(id, data, { new: true }).lean() as CategoryDocument | null;
    return category;
  }

  async delete(id: string): Promise<boolean> {
    const result = await CategoryModel.findByIdAndDelete(id);
    return !!result;
  }

  async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<CategoryDocument>> {
    const query = CategoryModel.find().sort({ position: 1 });
    return paginate<CategoryDocument>(query, options);
  }

  async findTopLevel(): Promise<CategoryDocument[]> {
    const result = await CategoryModel.find({ parent: null })
      .sort({ position: 1 })
      .lean();
    return result as unknown as CategoryDocument[];
  }

  async findByParent(parentId: string): Promise<CategoryDocument[]> {
    const result = await CategoryModel.find({ parent: parentId })
      .sort({ position: 1 })
      .lean();
    return result as unknown as CategoryDocument[];
  }

  async checkSlugExists(slug: string, excludeId?: string, parentId?: string): Promise<boolean> {
    const query: any = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    // If parentId is provided, check uniqueness within that parent context
    // Otherwise check globally (for top-level categories)
    if (parentId) {
      query.parent = parentId;
    } else {
      query.parent = null;
    }
    const count = await CategoryModel.countDocuments(query);
    return count > 0;
  }
}

export const categoryRepository = new CategoryRepository();


