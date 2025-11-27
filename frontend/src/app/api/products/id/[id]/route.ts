import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { productSchema } from "@/lib/validators";
import { requireAdmin } from "@/app/api/_utils/guards";
import { productService } from "@/lib/services";
import { ok, badRequest, notFound, serverError } from "@/app/api/_utils/response";
import type { ProductDocument } from "@/lib/models";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await db.connect();
    const { id } = await params;
    const product = await productService.getProductById(id);
    return ok(product);
  } catch (error: any) {
    if (error.message === "Product not found") {
      return notFound("Product not found");
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
    const body = await req.json();
    console.log("PATCH request body:", JSON.stringify(body, null, 2));
    const payload = productSchema.partial().parse(body) as Partial<ProductDocument>;
    console.log("Parsed payload:", JSON.stringify(payload, null, 2));
    const updated = await productService.updateProduct(id, payload);
    return ok(updated);
  } catch (error: any) {
    if (error.message === "Product not found") {
      return notFound("Product not found");
    }
    if (error.name === "ZodError") {
      return badRequest(error.errors[0].message);
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
    await productService.deleteProduct(id);
    return ok({ success: true });
  } catch (error: any) {
    if (error.message === "Product not found") {
      return notFound("Product not found");
    }
    return serverError(error);
  }
}

