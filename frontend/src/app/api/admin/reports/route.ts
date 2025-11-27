import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { OrderModel } from "@/lib/models";
import { requireAdmin } from "@/app/api/_utils/guards";

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (session instanceof Response) return session;

  const range = req.nextUrl.searchParams.get("range") ?? "30";
  const since = new Date(Date.now() - Number(range) * 24 * 60 * 60 * 1000);

  await db.connect();
  const orders = await OrderModel.find({ createdAt: { $gte: since } }).lean();

  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
  const byStatus = orders.reduce<Record<string, number>>((acc, order) => {
    acc[order.status] = (acc[order.status] ?? 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    data: {
      totalSales,
      orderCount: orders.length,
      byStatus,
    },
  });
}

