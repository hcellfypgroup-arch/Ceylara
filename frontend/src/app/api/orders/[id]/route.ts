import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { OrderModel } from "@/lib/models";
import { getSessionUser } from "@/app/api/_utils/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await db.connect();
  const { id } = await params;
  const order = await OrderModel.findById(id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: order });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await req.json();
  await db.connect();
  const { id } = await params;
  const order = await OrderModel.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return NextResponse.json({ data: order });
}

