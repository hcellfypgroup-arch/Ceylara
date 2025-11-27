import { orderRepository, userRepository, productRepository, couponRepository } from "@/lib/repositories";
import { productService } from "./product.service";
import { ShippingService } from "./shipping.service";
import type { OrderDocument } from "@/lib/models";

interface OrderItemInput {
  productId: string;
  variantSku: string;
  price: number;
  quantity: number;
  customFields?: Array<{ label: string; value: string }>;
}

interface CreateOrderInput {
  userId?: string;
  email: string;
  items: OrderItemInput[];
  address: any;
  payment: {
    method: "cod" | "card" | "bank_transfer";
    transactionId?: string;
    status?: "pending" | "paid" | "failed" | "refunded";
  };
  deliveryMethod: string;
  estimatedDelivery?: string;
  couponCode?: string;
}

export class OrderService {
  async createOrder(input: CreateOrderInput) {
    const { userId, items, couponCode } = input;

    // For guest checkout, userId can be undefined

    // Validate stock and build order items
    const productIds = items.map((item) => item.productId);
    const productDocs = await Promise.all(
      productIds.map((id) => productRepository.findById(id))
    );
    const validProducts = productDocs.filter((p) => p !== null);

    const orderItems = [];
    for (const item of items) {
      const product = validProducts.find(
        (doc: any) => doc._id.toString() === item.productId
      );
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      const variant = product.variants?.find((v: any) => v.sku === item.variantSku);
      if (!variant) {
        throw new Error(`Variant ${item.variantSku} not found`);
      }

      if (variant.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.title} - ${variant.size}`);
      }

      orderItems.push({
        product: (product as any)._id || (product as any).id,
        title: product.title,
        variantSku: item.variantSku,
        size: variant.size,
        color: variant.color,
        price: item.price,
        quantity: item.quantity,
        thumbnail: variant.images?.[0] || product.heroImage,
        customFields: item.customFields || [],
      });
    }

    // Calculate totals
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    
    // Calculate total weight for shipping
    const orderItemsWithWeight = [];
    for (const item of items) {
      const product = validProducts.find(
        (doc: any) => doc._id.toString() === item.productId
      );
      if (product) {
        orderItemsWithWeight.push({
          weight: product.weight || 0,
          quantity: item.quantity,
        });
      }
    }
    const totalWeight = ShippingService.calculateTotalWeight(orderItemsWithWeight);
    const deliveryFee = await ShippingService.calculateShippingFee({
      totalWeight,
      subtotal,
    });
    
    let discount = 0;
    if (couponCode) {
      const coupon = await couponRepository.findByCode(couponCode);
      if (coupon && this.isCouponValid(coupon, subtotal)) {
        if (coupon.type === "percentage") {
          discount = Math.min((subtotal * coupon.value) / 100, coupon.maxDiscount || Infinity);
        } else {
          discount = coupon.value;
        }
        await couponRepository.incrementUsage(couponCode);
      }
    }

    const total = Math.max(subtotal + deliveryFee - discount, 0);

    // Create order
    const mongoose = await import("mongoose");
    const userObjectId = userId ? new mongoose.default.Types.ObjectId(userId) : undefined;
    const order = await orderRepository.create({
      user: userObjectId as any,
      email: input.email,
      address: input.address,
      items: orderItems as any,
      subtotal,
      discount,
      deliveryFee,
      total,
      couponCode: couponCode || undefined,
      payment: {
        ...input.payment,
        status: input.payment.status || "pending",
      },
      delivery: {
        method: input.deliveryMethod,
        estimatedDate: input.estimatedDelivery ? new Date(input.estimatedDelivery) : undefined,
        statusHistory: [],
      } as any,
      status: "pending",
    });

    // Reduce stock
    for (const item of items) {
      await productService.reduceStock(item.variantSku, item.quantity);
    }

    // Clear cart only if user is logged in
    if (userId) {
      await userRepository.clearCart(userId);
    }

    return order;
  }

  async getOrderById(id: string) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }
    return order;
  }

  async getUserOrders(userId: string, page = 1, limit = 10) {
    return orderRepository.findByUser(userId, { page, limit });
  }

  async getAllOrders(filters: Record<string, unknown> = {}, page = 1, limit = 10) {
    return orderRepository.findAll(filters, { page, limit });
  }

  async updateOrderStatus(id: string, status: string) {
    return orderRepository.updateStatus(id, status);
  }

  async updatePaymentStatus(id: string, status: string, transactionId?: string) {
    return orderRepository.updatePaymentStatus(id, status, transactionId);
  }

  async cancelOrder(id: string) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }

    if (["delivered", "cancelled"].includes(order.status)) {
      throw new Error(`Cannot cancel order with status: ${order.status}`);
    }

    // Restore stock
    for (const item of order.items) {
      if (item.variantSku && item.quantity) {
        await productService.restoreStock(item.variantSku, item.quantity);
      }
    }

    return orderRepository.updateStatus(id, "cancelled");
  }

  private isCouponValid(coupon: any, subtotal: number): boolean {
    if (!coupon.isActive) return false;
    if (coupon.minSpend && subtotal < coupon.minSpend) return false;
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return false;
    
    const now = new Date();
    if (coupon.startsAt && new Date(coupon.startsAt) > now) return false;
    if (coupon.endsAt && new Date(coupon.endsAt) < now) return false;

    return true;
  }

  async getDashboardStats(startDate: Date, endDate: Date) {
    const [revenue, orderCount] = await Promise.all([
      orderRepository.getRevenueByDateRange(startDate, endDate),
      orderRepository.getOrderCountByDateRange(startDate, endDate),
    ]);

    return {
      revenue,
      orderCount,
      averageOrderValue: orderCount > 0 ? revenue / orderCount : 0,
    };
  }
}

export const orderService = new OrderService();

