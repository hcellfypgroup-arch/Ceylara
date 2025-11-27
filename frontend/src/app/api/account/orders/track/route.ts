import { NextRequest } from "next/server";
import { getSessionUser } from "@/app/api/_utils/auth";
import { db } from "@/lib/db";
import { orderService } from "@/lib/services";
import { ok, badRequest, serverError, notFound } from "@/app/api/_utils/response";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return badRequest("Authentication required");
    }

    const orderIdParam = req.nextUrl.searchParams.get("orderId");
    if (!orderIdParam) {
      return badRequest("Order ID is required");
    }

    await db.connect();
    
    const order = await orderService.getOrderById(orderIdParam);
    
    // Verify the order belongs to the user
    const orderUserId = order.user 
      ? (typeof order.user === 'object' 
          ? order.user.toString() 
          : order.user)
      : null;
    
    if (orderUserId && orderUserId !== session.id && session.role !== 'admin') {
      return badRequest("Unauthorized to view this order");
    }

    // Format order tracking data
    const trackingOrderId = (order as any)._id ? (typeof (order as any)._id === 'object' ? (order as any)._id.toString() : String((order as any)._id)) : orderIdParam;
    const trackingData = {
      orderId: trackingOrderId,
      status: order.status,
      trackingNumber: order.delivery?.trackingNumber,
      estimatedDelivery: order.delivery?.estimatedDate,
      statusHistory: order.delivery?.statusHistory || [],
      items: order.items.map((item: any) => ({
        title: item.title,
        quantity: item.quantity,
        thumbnail: item.thumbnail,
      })),
      address: order.address,
      total: order.total,
    };

    return ok(trackingData);
  } catch (error: any) {
    if (error.message === "Order not found") {
      return notFound("Order not found");
    }
    return serverError(error);
  }
}

