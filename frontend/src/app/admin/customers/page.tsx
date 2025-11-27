import { db } from "@/lib/db";
import { userRepository } from "@/lib/repositories/user.repository";
import { OrderModel } from "@/lib/models";
import { CustomersManager } from "@/components/admin/customers-manager";
import mongoose from "mongoose";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  await db.connect();
  
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = 10;
  const search = params.search || "";

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

      // Serialize customer data
      return {
        _id: customerId,
        id: customerId,
        name: String(customer.name || "N/A"),
        email: String(customer.email || ""),
        phone: customer.phone ? String(customer.phone) : undefined,
        orders: orderCount,
        totalSpent: totalSpent,
        createdAt: customer.createdAt ? new Date(customer.createdAt).toISOString() : new Date().toISOString(),
      };
    })
  );

  return (
    <CustomersManager
      customers={customersWithStats}
      total={result.total}
      page={page}
      limit={limit}
      totalPages={result.totalPages}
      search={search}
    />
  );
}
