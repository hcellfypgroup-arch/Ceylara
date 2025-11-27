import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { payHereService, orderService } from "@/lib/services";
import { ok, badRequest, serverError } from "@/app/api/_utils/response";
import type { PayHereIPNData } from "@/lib/services/payhere.service";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Convert FormData to object
    const ipnData: PayHereIPNData = {
      merchant_id: formData.get("merchant_id") as string,
      order_id: formData.get("order_id") as string,
      payment_id: formData.get("payment_id") as string,
      payhere_amount: formData.get("payhere_amount") as string,
      payhere_currency: formData.get("payhere_currency") as string,
      status_code: formData.get("status_code") as string,
      md5sig: formData.get("md5sig") as string,
      method: formData.get("method") as string,
      status_message: formData.get("status_message") as string,
      card_holder_name: formData.get("card_holder_name") as string | undefined,
      card_no: formData.get("card_no") as string | undefined,
      card_expiry: formData.get("card_expiry") as string | undefined,
    };

    // Verify hash
    const isValid = payHereService.verifyIPNHash(ipnData);
    if (!isValid) {
      console.error("PayHere IPN hash verification failed", ipnData);
      return badRequest("Invalid hash");
    }

    await db.connect();

    const orderId = ipnData.order_id;
    const paymentStatus = payHereService.getPaymentStatus(ipnData.status_code);
    const transactionId = ipnData.payment_id;

    // Update order payment status
    await orderService.updatePaymentStatus(orderId, paymentStatus, transactionId);

    // If payment is successful, update order status to confirmed
    if (payHereService.isPaymentSuccess(ipnData.status_code)) {
      await orderService.updateOrderStatus(orderId, "confirmed");
    }

    // PayHere expects a specific response format
    return new Response("success", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error: any) {
    console.error("PayHere webhook error:", error);
    if (error.message?.includes("Invalid hash")) {
      return badRequest(error.message);
    }
    return serverError(error);
  }
}

// PayHere also supports GET requests for IPN
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    
    const ipnData: PayHereIPNData = {
      merchant_id: searchParams.get("merchant_id") || "",
      order_id: searchParams.get("order_id") || "",
      payment_id: searchParams.get("payment_id") || "",
      payhere_amount: searchParams.get("payhere_amount") || "",
      payhere_currency: searchParams.get("payhere_currency") || "",
      status_code: searchParams.get("status_code") || "",
      md5sig: searchParams.get("md5sig") || "",
      method: searchParams.get("method") || "",
      status_message: searchParams.get("status_message") || "",
      card_holder_name: searchParams.get("card_holder_name") || undefined,
      card_no: searchParams.get("card_no") || undefined,
      card_expiry: searchParams.get("card_expiry") || undefined,
    };

    // Verify hash
    const isValid = payHereService.verifyIPNHash(ipnData);
    if (!isValid) {
      console.error("PayHere IPN hash verification failed", ipnData);
      return badRequest("Invalid hash");
    }

    await db.connect();

    const orderId = ipnData.order_id;
    const paymentStatus = payHereService.getPaymentStatus(ipnData.status_code);
    const transactionId = ipnData.payment_id;

    // Update order payment status
    await orderService.updatePaymentStatus(orderId, paymentStatus, transactionId);

    // If payment is successful, update order status to confirmed
    if (payHereService.isPaymentSuccess(ipnData.status_code)) {
      await orderService.updateOrderStatus(orderId, "confirmed");
    }

    // PayHere expects a specific response format
    return new Response("success", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error: any) {
    console.error("PayHere webhook error:", error);
    if (error.message?.includes("Invalid hash")) {
      return badRequest(error.message);
    }
    return serverError(error);
  }
}

