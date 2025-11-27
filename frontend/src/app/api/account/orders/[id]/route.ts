import { NextRequest } from "next/server";
import { getSessionUser } from "@/app/api/_utils/auth";
import { db } from "@/lib/db";
import { orderService } from "@/lib/services";
import { ok, badRequest, serverError, notFound } from "@/app/api/_utils/response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return badRequest("Authentication required");
    }

    const { id } = await params;
    await db.connect();
    
    const order = await orderService.getOrderById(id);
    
    // Verify the order belongs to the user
    const orderUserId = order.user 
      ? (typeof order.user === 'object' 
          ? order.user.toString() 
          : order.user)
      : null;
    
    if (orderUserId && orderUserId !== session.id && session.role !== 'admin') {
      return badRequest("Unauthorized to view this order");
    }

    return ok(order);
  } catch (error: any) {
    if (error.message === "Order not found") {
      return notFound("Order not found");
    }
    return serverError(error);
  }
}

