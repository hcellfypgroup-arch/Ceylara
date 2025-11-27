import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CouponModel } from "@/lib/models";
import { requireAdmin } from "@/app/api/_utils/guards";

export async function GET() {
  const session = await requireAdmin();
  if (session instanceof Response) return session;

  await db.connect();
  const coupons = await CouponModel.find().sort({ createdAt: -1 });
  return NextResponse.json({ data: coupons });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (session instanceof Response) return session;

  await db.connect();
  const coupon = await CouponModel.create(await req.json());
  return NextResponse.json({ data: coupon }, { status: 201 });
}

