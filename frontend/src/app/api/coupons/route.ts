import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { couponService } from "@/lib/services/coupon.service";
import { requireAdmin } from "@/app/api/_utils/guards";
import { ok, badRequest, serverError } from "@/app/api/_utils/response";

export async function GET(req: NextRequest) {
  try {
    await db.connect();
    
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const result = await couponService.getAllCoupons(page, limit);
    return ok(result);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (session instanceof Response) return session;

    await db.connect();
    const data = await req.json();

    const coupon = await couponService.createCoupon(data);
    return ok(coupon);
  } catch (error: any) {
    if (error.message) {
      return badRequest(error.message);
    }
    return serverError(error);
  }
}

