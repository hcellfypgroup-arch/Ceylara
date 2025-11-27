import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { productSchema } from "@/lib/validators";
import { requireAdmin } from "@/app/api/_utils/guards";
import { productService } from "@/lib/services";
import { ok, badRequest, notFound, serverError } from "@/app/api/_utils/response";
import type { ProductDocument } from "@/lib/models";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await db.connect();
    const { slug } = await params;
    const product = await productService.getProductBySlug(slug);
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
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireAdmin();
    if (session instanceof Response) return session;

    await db.connect();
    const { slug } = await params;
    const product = await productService.getProductBySlug(slug) as ProductDocument & { _id: { toString(): string } };
    const rawPayload = await req.json();
    const payload = productSchema.partial().parse(rawPayload) as Partial<ProductDocument>;
    const productId = product._id?.toString ? product._id.toString() : String(product._id);
    const updated = await productService.updateProduct(productId, payload);
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
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireAdmin();
    if (session instanceof Response) return session;

    await db.connect();
    const { slug } = await params;
    const product = await productService.getProductBySlug(slug) as ProductDocument & { _id: { toString(): string } };
    const productId = product._id?.toString ? product._id.toString() : String(product._id);
    await productService.deleteProduct(productId);
    return ok({ success: true });
  } catch (error: any) {
    if (error.message === "Product not found") {
      return notFound("Product not found");
    }
    return serverError(error);
  }
}

