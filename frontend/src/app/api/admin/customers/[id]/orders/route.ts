import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orderRepository } from "@/lib/repositories/order.repository";
import { requireAdmin } from "@/app/api/_utils/guards";
import { ok, serverError } from "@/app/api/_utils/response";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    if (session instanceof Response) return session;

    await db.connect();
    const { id } = await params;
    
    const customerObjectId = new mongoose.Types.ObjectId(id);
    const result = await orderRepository.findByUser(customerObjectId.toString(), {
      page: 1,
      limit: 50,
    });

    // Serialize orders
    const serialized = result.data.map((order: any) => ({
      _id: typeof order._id === 'object' && order._id?.toString 
        ? order._id.toString() 
        : String(order._id),
      orderNumber: order.orderNumber,
      total: Number(order.total || 0),
      status: String(order.status || "pending"),
      createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : undefined,
    }));

    return ok(serialized);
  } catch (error) {
    return serverError(error);
  }
}

