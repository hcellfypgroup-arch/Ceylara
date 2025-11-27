import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ProductModel, CategoryModel } from "@/lib/models";
import { ok, badRequest, serverError } from "@/app/api/_utils/response";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get("q");
    if (!query || query.trim().length === 0) {
      return ok({ products: [], categories: [] });
    }

    await db.connect();
    const searchTerm = query.trim();

    // Search products by title, description, or tags
    const productQuery = {
      $or: [
        { title: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
        { summary: { $regex: searchTerm, $options: "i" } },
        { tags: { $in: [new RegExp(searchTerm, "i")] } },
        { "variants.sku": { $regex: searchTerm, $options: "i" } },
      ],
    };

    // Search categories by name
    const categoryQuery = {
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
      ],
    };

    // Execute searches in parallel
    const [products, categories] = await Promise.all([
      ProductModel.find(productQuery)
        .populate("categories")
        .limit(20)
        .lean(),
      CategoryModel.find(categoryQuery).limit(10).lean(),
    ]);

    // If categories found, also search for products in those categories
    let categoryProducts: any[] = [];
    if (categories.length > 0) {
      const categoryIds = categories.map((cat) => cat._id);
      categoryProducts = await ProductModel.find({
        categories: { $in: categoryIds },
      })
        .populate("categories")
        .limit(20)
        .lean();
    }

    // Combine and deduplicate products
    const allProducts = [...products, ...categoryProducts];
    const uniqueProducts = Array.from(
      new Map(
        allProducts.map((product) => [
          product._id?.toString(),
          product,
        ])
      ).values()
    ).slice(0, 20);

    return ok({
      products: uniqueProducts,
      categories: categories,
      query: searchTerm,
    });
  } catch (error) {
    console.error("Search error:", error);
    return serverError(error);
  }
}

