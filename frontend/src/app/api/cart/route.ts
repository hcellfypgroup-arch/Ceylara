import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/app/api/_utils/guards";
import { cartService } from "@/lib/services";
import { ok, created, badRequest, serverError } from "@/app/api/_utils/response";

export async function GET() {
  try {
    const session = await requireAuth();
    if (session instanceof Response) return session;

    await db.connect();
    const cart = await cartService.getCart(session.id);
    return ok(cart);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof Response) return session;

    const { productId, variantSku } = await req.json();
    if (!productId || !variantSku) {
      return badRequest("productId and variantSku are required");
    }

    await db.connect();
    const entry = await cartService.addToCart(session.id, productId, variantSku);
    return created(entry);
  } catch (error: any) {
    if (error.message) {
      return badRequest(error.message);
    }
    return serverError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof Response) return session;

    const { variantSku, quantity } = await req.json();
    if (!variantSku || !quantity) {
      return badRequest("variantSku and quantity are required");
    }

    await db.connect();
    await cartService.updateCartItem(session.id, variantSku, quantity);
    return ok({ success: true });
  } catch (error: any) {
    if (error.message) {
      return badRequest(error.message);
    }
    return serverError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof Response) return session;

    const { variantSku } = await req.json();
    if (!variantSku) {
      return badRequest("variantSku is required");
    }

    await db.connect();
    await cartService.removeFromCart(session.id, variantSku);
    return ok({ success: true });
  } catch (error: any) {
    if (error.message) {
      return badRequest(error.message);
    }
    return serverError(error);
  }
}

