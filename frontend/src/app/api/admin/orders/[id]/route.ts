import { NextRequest } from "next/server";
import { requireAdmin } from "@/app/api/_utils/guards";
import { db } from "@/lib/db";
import { orderService } from "@/lib/services";
import { ok, badRequest, serverError } from "@/app/api/_utils/response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    if (session instanceof Response) return session;

    const { id } = await params;
    await db.connect();
    
    const order = await orderService.getOrderById(id);
    return ok(order);
  } catch (error: any) {
    console.error("Admin order detail API error:", error);
    if (error.message?.includes("not found")) {
      return badRequest(error.message);
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

    const { id } = await params;
    const body = await req.json();
    
    await db.connect();

    if (body.status) {
      await orderService.updateOrderStatus(id, body.status);
    }

    if (body.paymentStatus) {
      await orderService.updatePaymentStatus(
        id,
        body.paymentStatus,
        body.transactionId
      );
    }

    const order = await orderService.getOrderById(id);
    return ok(order);
  } catch (error: any) {
    console.error("Admin order update API error:", error);
    if (error.message?.includes("not found")) {
      return badRequest(error.message);
    }
    return serverError(error);
  }
}

