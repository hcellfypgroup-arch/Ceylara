import type { UpdateQuery } from "mongoose";
import {
  orderRepository,
  productRepository,
  couponRepository,
  type QueryOptions,
} from "@/lib/repositories";
import type { OrderDocument } from "@/lib/models";
import type { PaginatedResult } from "./types";

type OrderItemInput = {
  productId: string;
  variantSku: string;
  quantity: number;
  price?: number;
};

type OrderPayload = {
  userId: string;
  email: string;
  address: OrderDocument["address"];
  items: OrderItemInput[];
  payment: OrderDocument["payment"];
  delivery: Partial<OrderDocument["delivery"]>;
  couponCode?: string;
};

const buildItems = async (items: OrderItemInput[]) => {
  const productIds = items.map((item) => item.productId);
    const productResults = await productRepository.findAll(
      { _id: { $in: productIds } } as any,
      { limit: 1000 }
    );
    const products = productResults.data;
  return items.map((item) => {
    const product = products.find(
      (doc: any) => (doc._id?.toString() || doc.id) === item.productId
    );
    const variant = product?.variants?.find(
      (variantDoc) => variantDoc.sku === item.variantSku
    );
    return {
      product: (product as any)?._id || (product as any)?.id,
      title: product?.title,
      variantSku: item.variantSku,
      size: variant?.size,
      color: variant?.color,
      price: item.price ?? variant?.salePrice ?? variant?.price ?? 0,
      quantity: item.quantity,
      thumbnail: variant?.images?.[0] ?? product?.heroImage,
    };
  });
};

const calculateTotals = async (
  items: Awaited<ReturnType<typeof buildItems>>,
  deliveryFee: number,
  couponCode?: string
) => {
  const subtotal = items.reduce(
    (total, item) => total + (item.price ?? 0) * (item.quantity ?? 0),
    0
  );
  let discount = 0;
  if (couponCode) {
    const coupon = await couponRepository.findByCode(couponCode);
    if (coupon && coupon.isActive) {
      const isWithinWindow =
        (!coupon.startsAt || coupon.startsAt < new Date()) &&
        (!coupon.endsAt || coupon.endsAt > new Date());
      if (isWithinWindow) {
        if (coupon.type === "percentage") {
          discount = Math.min(
            subtotal * (coupon.value / 100),
            coupon.maxDiscount ?? Infinity
          );
        } else {
          discount = coupon.value;
        }
        if (coupon.minSpend && subtotal < coupon.minSpend) {
          discount = 0;
        }
      }
    }
  }
  const total = Math.max(subtotal + deliveryFee - discount, 0);
  return { subtotal, discount, total };
};

export const orderService = {
  listForUser: (
    userId: string,
    { page = 1, limit = 20 }: { page?: number; limit?: number } = {}
  ): Promise<PaginatedResult<OrderDocument>> =>
    orderRepository.findByUser(userId, { page, limit, sort: { createdAt: -1 } }),
  listForAdmin: async ({
    filters = {},
    page = 1,
    limit = 20,
    sort = { createdAt: -1 },
  }: {
    filters?: QueryOptions["projection"];
    page?: number;
    limit?: number;
    sort?: QueryOptions["sort"];
  }): Promise<PaginatedResult<OrderDocument>> => {
    const queryFilters = filters ?? {};
    return orderRepository.findAll(queryFilters, { page, limit, sort });
  },
  getById: (orderId: string, options?: QueryOptions) =>
    orderRepository.findById(orderId),
  create: async (payload: OrderPayload) => {
    const items = await buildItems(payload.items);
    const { subtotal, discount, total } = await calculateTotals(
      items,
      payload.delivery?.fee ?? 0,
      payload.couponCode
    );
    const mongoose = await import("mongoose");
    const userId = payload.userId ? new mongoose.default.Types.ObjectId(payload.userId) : undefined;
    const order = await orderRepository.create({
      user: userId as any,
      email: payload.email,
      address: payload.address,
      items: items as any,
      subtotal,
      discount,
      deliveryFee: payload.delivery?.fee ?? 0,
      total,
      payment: payload.payment,
      delivery: {
        method: payload.delivery?.method ?? "Standard",
        estimatedDate: payload.delivery?.estimatedDate,
        fee: payload.delivery?.fee ?? 0,
        statusHistory: [],
      } as any,
      couponCode: payload.couponCode,
    });
    return order;
  },
  updateStatus: (orderId: string, status: OrderDocument["status"]) =>
    orderRepository.updateStatus(orderId, status),
  updatePaymentStatus: (
    orderId: string,
    status: string,
    transactionId?: string
  ) =>
    orderRepository.updatePaymentStatus(orderId, status, transactionId),
};

