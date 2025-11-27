import { env } from "@/lib/env";
import crypto from "crypto";

export interface PayHereCheckoutParams {
  orderId: string;
  amount: number;
  currency?: string;
  items: Array<{ name: string; amount: number; quantity: number }>;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerCity?: string;
  customerCountry?: string;
  successUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

export interface PayHerePaymentData {
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  currency: string;
  amount: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  hash: string;
}

export interface PayHereIPNData {
  merchant_id: string;
  order_id: string;
  payment_id: string;
  payhere_amount: string;
  payhere_currency: string;
  status_code: string;
  md5sig: string;
  method: string;
  status_message: string;
  card_holder_name?: string;
  card_no?: string;
  card_expiry?: string;
  [key: string]: string | undefined;
}

export class PayHereService {
  private merchantId: string;
  private merchantSecret: string;
  private sandbox: boolean;

  constructor() {
    this.merchantId = env.PAYHERE_MERCHANT_ID || "";
    this.merchantSecret = env.PAYHERE_MERCHANT_SECRET || "";
    this.sandbox = env.PAYHERE_SANDBOX === "true";
  }

  private ensureConfigured() {
    if (!this.merchantId || !this.merchantSecret) {
      throw new Error("PayHere is not configured. Please set PAYHERE_MERCHANT_ID and PAYHERE_MERCHANT_SECRET.");
    }
  }

  /**
   * Generate MD5 hash for PayHere payment request
   */
  private generateHash(params: Record<string, string>): string {
    const sortedKeys = Object.keys(params).sort();
    const hashString = sortedKeys
      .map((key) => `${key}=${params[key]}`)
      .join("&");
    const fullHashString = `${hashString}&merchant_secret=${this.merchantSecret}`;
    
    return crypto.createHash("md5").update(fullHashString).digest("hex").toUpperCase();
  }

  /**
   * Verify PayHere IPN hash
   * PayHere IPN hash uses a specific parameter order (not alphabetical)
   */
  verifyIPNHash(data: PayHereIPNData): boolean {
    this.ensureConfigured();
    
    // PayHere IPN hash uses specific parameter order
    const hashString = `merchant_id=${data.merchant_id}&order_id=${data.order_id}&payment_id=${data.payment_id}&payhere_amount=${data.payhere_amount}&payhere_currency=${data.payhere_currency}&status_code=${data.status_code}&merchant_secret=${this.merchantSecret}`;
    
    const hash = crypto.createHash("md5").update(hashString).digest("hex").toUpperCase();
    return hash === data.md5sig;
  }

  /**
   * Create PayHere checkout payment data
   */
  createCheckoutData(params: PayHereCheckoutParams): PayHerePaymentData {
    this.ensureConfigured();

    const amount = params.amount.toFixed(2);
    const items = params.items
      .map((item) => `${item.name} x${item.quantity}`)
      .join(", ");

    // Split customer name into first and last name
    const nameParts = params.customerName.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const paymentData: Record<string, string> = {
      merchant_id: this.merchantId,
      return_url: params.successUrl,
      cancel_url: params.cancelUrl,
      notify_url: params.notifyUrl,
      order_id: params.orderId,
      items: items,
      currency: params.currency || "LKR",
      amount: amount,
      first_name: firstName,
      last_name: lastName,
      email: params.customerEmail,
      phone: params.customerPhone,
      address: params.customerAddress || "",
      city: params.customerCity || "",
      country: params.customerCountry || "Sri Lanka",
    };

    const hash = this.generateHash(paymentData);

    return {
      merchant_id: paymentData.merchant_id,
      return_url: paymentData.return_url,
      cancel_url: paymentData.cancel_url,
      notify_url: paymentData.notify_url,
      order_id: paymentData.order_id,
      items: paymentData.items,
      currency: paymentData.currency,
      amount: paymentData.amount,
      first_name: paymentData.first_name,
      last_name: paymentData.last_name,
      email: paymentData.email,
      phone: paymentData.phone,
      address: paymentData.address,
      city: paymentData.city,
      country: paymentData.country,
      hash,
    };
  }

  /**
   * Get PayHere payment URL (sandbox or production)
   */
  getPaymentUrl(): string {
    if (this.sandbox) {
      return "https://sandbox.payhere.lk/pay/checkout";
    }
    return "https://www.payhere.lk/pay/checkout";
  }

  /**
   * Check if payment status indicates success
   */
  isPaymentSuccess(statusCode: string): boolean {
    return statusCode === "2"; // 2 = Success in PayHere
  }

  /**
   * Get payment status from PayHere status code
   */
  getPaymentStatus(statusCode: string): "paid" | "failed" | "pending" {
    switch (statusCode) {
      case "2": // Success
        return "paid";
      case "0": // Pending
        return "pending";
      case "-1": // Canceled
      case "-2": // Failed
      default:
        return "failed";
    }
  }
}

export const payHereService = new PayHereService();

