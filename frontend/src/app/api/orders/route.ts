import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/app/api/_utils/auth";
import { orderService } from "@/lib/services";
import { ok, created, badRequest, serverError } from "@/app/api/_utils/response";

type OrderItemPayload = {
  productId: string;
  variantSku: string;
  price: number;
  quantity: number;
};

type OrderPayload = {
  items: OrderItemPayload[];
  email: string;
  address: {
    recipientName?: string;
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  payment: {
    method: "cod" | "card" | "bank_transfer";
    transactionId?: string;
    status?: "pending" | "paid" | "failed" | "refunded";
  };
  deliveryMethod: string;
  estimatedDelivery?: string;
  couponCode?: string;
};

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return badRequest("Authentication required to view orders");
    }

    await db.connect();
    const page = Number(req.nextUrl.searchParams.get("page") ?? 1);
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? 10);
    const result = await orderService.getUserOrders(session.id, page, limit);
    return ok(result);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Allow guest checkout - get session if available, but don't require it
    const session = await getSessionUser();
    const userId = session?.id || null;

    const payload = (await req.json()) as OrderPayload;
    
    if (!payload.items || payload.items.length === 0) {
      return badRequest("Order must have at least one item");
    }

    if (!payload.email) {
      return badRequest("Email is required");
    }

    await db.connect();
    const order = await orderService.createOrder({
      userId: userId || undefined,
      email: payload.email,
      items: payload.items,
      address: payload.address,
      payment: payload.payment,
      deliveryMethod: payload.deliveryMethod,
      estimatedDelivery: payload.estimatedDelivery,
      couponCode: payload.couponCode,
    });

    // Send confirmation emails (optional - will fail silently if email module has issues)
    try {
      const { sendOrderConfirmation } = await import("@/lib/email");
      await sendOrderConfirmation(order, payload.email);
      // Send admin notification (you might want to get admin email from settings)
      // const { sendAdminOrderNotification } = await import("@/lib/email");
      // await sendAdminOrderNotification(order, adminEmail);
    } catch (emailError) {
      // Silently fail - email is optional
      console.warn("Email sending skipped:", emailError);
    }

    return created(order);
  } catch (error: any) {
    if (error.message) {
      return badRequest(error.message);
    }
    return serverError(error);
  }
}

