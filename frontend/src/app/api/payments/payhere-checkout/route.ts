import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/app/api/_utils/guards";
import { payHereService } from "@/lib/services";
import { orderService } from "@/lib/services";
import { env } from "@/lib/env";
import { ok, badRequest, serverError } from "@/app/api/_utils/response";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof Response) return session;

    const body = await req.json();
    const { orderId, items, customerEmail, customerName, customerPhone, customerAddress, customerCity, customerCountry } = body;

    if (!orderId || !items || !customerEmail || !customerName || !customerPhone) {
      return badRequest("orderId, items, customerEmail, customerName, and customerPhone are required");
    }

    await db.connect();

    // Verify order exists and belongs to user
    const order = await orderService.getOrderById(orderId);
    if (order.user && order.user.toString() !== session.id) {
      return badRequest("Order not found or unauthorized");
    }

    // Use order total (includes delivery fee and discount)
    const totalAmount = order.total || 0;
    if (totalAmount <= 0) {
      return badRequest("Order total must be greater than 0");
    }

    // Create PayHere checkout data
    // Note: items array will be converted to description string by the service
    const paymentData = payHereService.createCheckoutData({
      orderId,
      amount: totalAmount,
      currency: "LKR", // PayHere primarily uses LKR
      items: order.items.map((item: any) => ({
        name: item.title || "Product",
        amount: item.price,
        quantity: item.quantity,
      })),
      customerEmail,
      customerName,
      customerPhone,
      customerAddress: customerAddress || order.address?.line1 || "",
      customerCity: customerCity || order.address?.city || "",
      customerCountry: customerCountry || order.address?.country || "Sri Lanka",
      successUrl: `${env.NEXT_PUBLIC_SITE_URL}/order-confirmation/${orderId}?payment_id={PAYMENT_ID}`,
      cancelUrl: `${env.NEXT_PUBLIC_SITE_URL}/checkout?canceled=true`,
      notifyUrl: `${env.NEXT_PUBLIC_SITE_URL}/api/payments/payhere-webhook`,
    });

    const paymentUrl = payHereService.getPaymentUrl();

    return ok({ 
      paymentData,
      paymentUrl,
    });
  } catch (error: any) {
    if (error.message) {
      return badRequest(error.message);
    }
    return serverError(error);
  }
}

