import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/app/api/_utils/guards";
import { categoryService } from "@/lib/services";
import { ok, created, badRequest, serverError } from "@/app/api/_utils/response";

export async function GET(req: NextRequest) {
  try {
    await db.connect();
    const { searchParams } = new URL(req.url);
    const withChildren = searchParams.get("withChildren") === "true";
    
    if (withChildren) {
      const categories = await categoryService.getAllCategoriesWithChildren();
      return ok(categories);
    }
    
    const categories = await categoryService.getTopLevelCategories();
    return ok(categories);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (session instanceof Response) return session;

    await db.connect();
    const payload = await req.json();
    const category = await categoryService.createCategory(payload);
    return created(category);
  } catch (error: any) {
    if (error.message) {
      return badRequest(error.message);
    }
    return serverError(error);
  }
}

