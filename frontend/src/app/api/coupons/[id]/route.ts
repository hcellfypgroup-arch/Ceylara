import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { couponService } from "@/lib/services/coupon.service";
import { requireAdmin } from "@/app/api/_utils/guards";
import { ok, badRequest, serverError, notFound } from "@/app/api/_utils/response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await db.connect();
    const { id } = await params;
    const { couponRepository } = await import("@/lib/repositories");
    const coupon = await couponRepository.findById(id);
    
    if (!coupon) {
      return notFound("Coupon not found");
    }
    
    return ok(coupon);
  } catch (error: any) {
    if (error.message === "Coupon not found") {
      return notFound(error.message);
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

    await db.connect();
    const { id } = await params;
    const data = await req.json();

    const coupon = await couponService.updateCoupon(id, data);
    if (!coupon) {
      return notFound("Coupon not found");
    }

    return ok(coupon);
  } catch (error: any) {
    if (error.message) {
      return badRequest(error.message);
    }
    return serverError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    if (session instanceof Response) return session;

    await db.connect();
    const { id } = await params;
    
    const deleted = await couponService.deleteCoupon(id);
    if (!deleted) {
      return notFound("Coupon not found");
    }

    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}

