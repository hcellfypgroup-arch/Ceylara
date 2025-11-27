import { categoryRepository } from "@/lib/repositories";
import type { CategoryDocument } from "@/lib/models";
import { slugify } from "@/lib/utils";

export class CategoryService {
  async createCategory(data: Partial<CategoryDocument>) {
    if (!data.slug) {
      data.slug = slugify(data.name || "");
    }

    const parentId = data.parent ? data.parent.toString() : undefined;
    const exists = await categoryRepository.checkSlugExists(data.slug, undefined, parentId);
    if (exists) {
      // If slug exists, append a number to make it unique
      let counter = 1;
      let uniqueSlug = data.slug;
      while (await categoryRepository.checkSlugExists(uniqueSlug, undefined, parentId)) {
        uniqueSlug = `${data.slug}-${counter}`;
        counter++;
      }
      data.slug = uniqueSlug;
    }

    return categoryRepository.create(data);
  }

  async updateCategory(id: string, data: Partial<CategoryDocument>) {
    // Get current category to check if parent is changing
    const currentCategory = await categoryRepository.findById(id);
    if (!currentCategory) {
      throw new Error("Category not found");
    }

    const parentId = data.parent ? data.parent.toString() : (currentCategory.parent ? currentCategory.parent.toString() : undefined);

    if (data.name && !data.slug) {
      data.slug = slugify(data.name);
    }

    if (data.slug) {
      const exists = await categoryRepository.checkSlugExists(data.slug, id, parentId);
      if (exists) {
        // If slug exists, append a number to make it unique
        let counter = 1;
        let uniqueSlug = data.slug;
        while (await categoryRepository.checkSlugExists(uniqueSlug, id, parentId)) {
          uniqueSlug = `${data.slug}-${counter}`;
          counter++;
        }
        data.slug = uniqueSlug;
      }
    }

    return categoryRepository.update(id, data);
  }

  async deleteCategory(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new Error("Category not found");
    }

    const hasChildren = await categoryRepository.findByParent(id);
    if (hasChildren.length > 0) {
      throw new Error("Cannot delete category with subcategories");
    }

    return categoryRepository.delete(id);
  }

  async getCategoryBySlug(slug: string) {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) {
      throw new Error("Category not found");
    }
    return category;
  }

  async getTopLevelCategories() {
    return categoryRepository.findTopLevel();
  }

  async getSubcategories(parentId: string) {
    return categoryRepository.findByParent(parentId);
  }

  async getCategoryById(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new Error("Category not found");
    }
    return category;
  }

  async getCategoriesWithProductCounts() {
    const categories = await categoryRepository.findTopLevel();
    const { productRepository } = await import("@/lib/repositories");
    
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat: any) => {
        const count = await productRepository.countByCategory(cat._id.toString());
        return {
          ...cat,
          productCount: count,
        };
      })
    );
    
    return categoriesWithCounts;
  }

  async getAllCategoriesWithChildren() {
    const allCategoriesResult = await categoryRepository.findAll({ limit: 1000 });
    const allCategories = allCategoriesResult.data;
    
    // Build a map of all categories
    const categoryMap = new Map();
    allCategories.forEach((cat: any) => {
      categoryMap.set(cat._id.toString(), { ...cat, children: [] });
    });
    
    // Build hierarchical structure
    const result: any[] = [];
    allCategories.forEach((cat: any) => {
      const category = categoryMap.get(cat._id.toString());
      if (!cat.parent || cat.parent === null) {
        // Top-level category
        result.push(category);
      } else {
        // Child category - add to parent's children
        const parentId = typeof cat.parent === 'string' ? cat.parent : cat.parent.toString();
        const parent = categoryMap.get(parentId);
        if (parent) {
          parent.children.push(category);
        }
      }
    });
    
    // Sort by position
    result.sort((a, b) => (a.position || 0) - (b.position || 0));
    result.forEach((cat) => {
      cat.children.sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
    });
    
    return result;
  }
}

export const categoryService = new CategoryService();

