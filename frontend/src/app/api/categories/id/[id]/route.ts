import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/app/api/_utils/guards";
import { categoryService } from "@/lib/services";
import { ok, badRequest, notFound, serverError } from "@/app/api/_utils/response";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await db.connect();
    const { id } = await params;
    const category = await categoryService.getCategoryById(id);
    return ok(category);
  } catch (error: any) {
    if (error.message === "Category not found") {
      return notFound("Category not found");
    }
    return serverError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    if (session instanceof Response) return session;

    await db.connect();
    const { id } = await params;
    const payload = await req.json();
    const updated = await categoryService.updateCategory(id, payload);
    return ok(updated);
  } catch (error: any) {
    if (error.message === "Category not found") {
      return notFound("Category not found");
    }
    if (error.message) {
      return badRequest(error.message);
    }
    return serverError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    if (session instanceof Response) return session;

    await db.connect();
    const { id } = await params;
    await categoryService.deleteCategory(id);
    return ok({ success: true });
  } catch (error: any) {
    if (error.message === "Category not found") {
      return notFound("Category not found");
    }
    if (error.message) {
      return badRequest(error.message);
    }
    return serverError(error);
  }
}

