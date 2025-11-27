import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { couponService } from "@/lib/services/coupon.service";
import { ok, badRequest, serverError } from "@/app/api/_utils/response";

export async function POST(req: NextRequest) {
  try {
    await db.connect();
    const { code, subtotal } = await req.json();

    if (!code) {
      return badRequest("Coupon code is required");
    }

    if (typeof subtotal !== "number") {
      return badRequest("Subtotal must be a number");
    }

    const result = await couponService.validateCoupon(code, subtotal);
    return ok(result);
  } catch (error) {
    return serverError(error);
  }
}

