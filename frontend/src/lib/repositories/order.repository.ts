import { OrderModel, type OrderDocument } from "@/lib/models";
import type { PaginationOptions, PaginatedResult } from "./_types";
import { paginate, buildFilter } from "./_utils";

export class OrderRepository {
  async findById(id: string): Promise<OrderDocument | null> {
    return OrderModel.findById(id)
      .populate("user")
      .populate({
        path: "items.product",
        populate: [
          { path: "categories" },
          { path: "types" }
        ]
      })
      .lean() as Promise<OrderDocument | null>;
  }

  async create(data: Partial<OrderDocument>): Promise<OrderDocument> {
    const order = await OrderModel.create(data);
    return order.toObject();
  }

  async update(id: string, data: Partial<OrderDocument>): Promise<OrderDocument | null> {
    const order = await OrderModel.findByIdAndUpdate(id, data, { new: true }).lean() as OrderDocument | null;
    return order;
  }

  async delete(id: string): Promise<boolean> {
    const result = await OrderModel.findByIdAndDelete(id);
    return !!result;
  }

  async findByUser(
    userId: string,
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<OrderDocument>> {
    const query = OrderModel.find({ user: userId });
    return paginate<OrderDocument>(query, options);
  }

  async findAll(
    filters: Record<string, unknown> = {},
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<OrderDocument>> {
    let filter = buildFilter(filters);
    
    // Handle search query - search in orderNumber, email, and user name/email
    if (filters.search) {
      const searchTerm = String(filters.search);
      const searchFilter: any[] = [
        { orderNumber: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
      ];
      
      // Search in user name/email by using aggregation or separate query
      // For now, we'll search in email field which is stored directly on order
      // User name search would require aggregation pipeline
      
      if (filter.$or) {
        filter.$and = [
          { $or: filter.$or },
          { $or: searchFilter }
        ];
        delete filter.$or;
      } else {
        filter.$or = searchFilter;
      }
      delete filter.search;
    }
    
    const query = OrderModel.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    return paginate<OrderDocument>(query, options);
  }

  async updateStatus(id: string, status: string): Promise<boolean> {
    const result = await OrderModel.updateOne(
      { _id: id },
      { $set: { status } }
    );
    return result.modifiedCount > 0;
  }

  async updatePaymentStatus(id: string, status: string, transactionId?: string): Promise<boolean> {
    const update: any = { "payment.status": status };
    if (transactionId) {
      update["payment.transactionId"] = transactionId;
    }
    const result = await OrderModel.updateOne({ _id: id }, { $set: update });
    return result.modifiedCount > 0;
  }

  async getRevenueByDateRange(startDate: Date, endDate: Date): Promise<number> {
    const orders = await OrderModel.find({
      createdAt: { $gte: startDate, $lte: endDate },
      "payment.status": "paid",
    }).lean() as unknown as OrderDocument[];
    return orders.reduce((total, order) => total + (order.total || 0), 0);
  }

  async getOrderCountByDateRange(startDate: Date, endDate: Date): Promise<number> {
    return OrderModel.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    });
  }
}

export const orderRepository = new OrderRepository();


