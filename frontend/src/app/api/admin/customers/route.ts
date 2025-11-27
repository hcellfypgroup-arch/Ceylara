import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userRepository } from "@/lib/repositories/user.repository";
import { orderRepository } from "@/lib/repositories/order.repository";
import { requireAdmin } from "@/app/api/_utils/guards";
import { ok, serverError } from "@/app/api/_utils/response";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (session instanceof Response) return session;

    await db.connect();
    
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    // Build filter query
    const filter: any = { role: "customer" };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Fetch customers with pagination
    const result = await userRepository.findAll({ 
      page, 
      limit,
      filter,
    });

    // Fetch order statistics for each customer
    const { OrderModel } = await import("@/lib/models");
    const mongoose = await import("mongoose");
    
    const customersWithStats = await Promise.all(
      result.data.map(async (customer: any) => {
        const customerId = customer._id?.toString() || customer._id;
        
        // Get order count and total spent for this customer
        const customerObjectId = new mongoose.Types.ObjectId(customerId);
        const orders = await OrderModel.find({ user: customerObjectId }).lean();
        
        const orderCount = orders.length;
        const totalSpent = orders.reduce((sum: number, order: any) => {
          return sum + (order.total || 0);
        }, 0);

        return {
          _id: customerId,
          id: customerId,
          name: customer.name || "N/A",
          email: customer.email || "",
          phone: customer.phone || "",
          orders: orderCount,
          totalSpent: totalSpent,
          createdAt: customer.createdAt,
        };
      })
    );

    return ok({
      data: customersWithStats,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return serverError(error);
  }
}
