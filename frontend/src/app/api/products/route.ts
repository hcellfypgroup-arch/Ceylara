import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { productFilterSchema, productSchema } from "@/lib/validators";
import { requireAdmin } from "@/app/api/_utils/guards";
import { productService } from "@/lib/services";
import { ok, created, badRequest, serverError } from "@/app/api/_utils/response";
import type { ProductDocument } from "@/lib/models";

export async function GET(req: NextRequest) {
  try {
    await db.connect();
    
    // Parse query params - convert to object for zod parsing
    const rawParams: Record<string, string | string[]> = {};
    req.nextUrl.searchParams.forEach((value, key) => {
      rawParams[key] = value;
    });
    
    const query = productFilterSchema.partial().parse(rawParams);
    
    const filters: Record<string, unknown> = {};
    
    // Category filter - can be single category ID or array
    if (query.category) {
      const categoryIds = Array.isArray(query.category) ? query.category : [query.category];
      filters.categories = { $in: categoryIds };
    }
    
    // Type filter - can be single type ID or array
    if (query.type) {
      const typeIds = Array.isArray(query.type) ? query.type : [query.type];
      filters.types = { $in: typeIds };
    }
    
    // Size filter
    if (query.size && query.size.length > 0) {
      filters["variants.size"] = { $in: query.size };
    }
    
    // Color filter
    if (query.color && query.color.length > 0) {
      filters["variants.color"] = { $in: query.color };
    }
    
    // Material filter
    if (query.material && query.material.length > 0) {
      filters.materials = { $in: query.material };
    }
    
    // Style filter
    if (query.style && query.style.length > 0) {
      filters.style = { $in: query.style };
    }
    
    // Sleeve length filter
    if (query.sleeve && query.sleeve.length > 0) {
      filters.sleeveLength = { $in: query.sleeve };
    }
    
    // Price range filter
    if (query.priceMin || query.priceMax) {
      filters.basePrice = {} as { $gte?: number; $lte?: number };
      if (query.priceMin) (filters.basePrice as { $gte: number }).$gte = query.priceMin;
      if (query.priceMax) (filters.basePrice as { $lte: number }).$lte = query.priceMax;
    }

    const page = Number(req.nextUrl.searchParams.get("page") ?? 1);
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? 12);
    
    // Handle sort parameter
    const sortParam = req.nextUrl.searchParams.get("sort") ?? "latest";
    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortParam === "price-asc") sort = { basePrice: 1 };
    if (sortParam === "price-desc") sort = { basePrice: -1 };
    if (sortParam === "popularity") sort = { rating: -1 };

    const result = await productService.list({ filters, page, limit, sort });
    return ok(result);
  } catch (error: any) {
    console.error("Products API Error:", error);
    if (error.name === "ZodError") {
      return badRequest(`Invalid filter parameters: ${error.errors.map((e: any) => e.message).join(", ")}`);
    }
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (session instanceof Response) return session;

    await db.connect();
    const rawPayload = await req.json();
    const payload = productSchema.parse(rawPayload) as unknown as Partial<ProductDocument>;
    const product = await productService.createProduct(payload);
    return created(product);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return badRequest(error.errors[0].message);
    }
    if (error.message) {
      return badRequest(error.message);
    }
    return serverError(error);
  }
}

