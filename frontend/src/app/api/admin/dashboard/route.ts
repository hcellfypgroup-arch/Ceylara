import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/app/api/_utils/guards";
import { orderRepository, productRepository, userRepository, couponRepository } from "@/lib/repositories";
import { OrderModel, ProductModel, CategoryModel, CouponModel } from "@/lib/models";
import { ok, serverError } from "@/app/api/_utils/response";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (session instanceof Response) return session;

    await db.connect();

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);
    
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayStart);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
    yesterdayEnd.setHours(23, 59, 59, 999);

    // Get today's stats
    const todayOrders = await OrderModel.find({
      createdAt: { $gte: todayStart, $lte: todayEnd },
      "payment.status": "paid",
    }).lean();
    const revenueToday = todayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const ordersToday = todayOrders.length;
    const averageOrderValue = ordersToday > 0 ? revenueToday / ordersToday : 0;

    // Get yesterday's stats for comparison
    const yesterdayOrders = await OrderModel.find({
      createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd },
      "payment.status": "paid",
    }).lean();
    const revenueYesterday = yesterdayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const ordersYesterday = yesterdayOrders.length;

    // Get pending orders (all time, not just today)
    const pendingOrders = await OrderModel.find({
      status: "pending",
    }).lean();
    const pendingOrdersCount = pendingOrders.length;

    // Get yesterday's pending orders for comparison
    const yesterdayPendingOrders = await OrderModel.find({
      status: "pending",
      createdAt: { $lte: yesterdayEnd },
    }).lean();
    const yesterdayPendingCount = yesterdayPendingOrders.length;

    // Get total customers
    const totalCustomers = await userRepository.findAll({ filter: { role: "customer" }, limit: 1 });
    
    // Get total products
    const totalProducts = await ProductModel.countDocuments();

    // Get best sellers (products marked as best sellers)
    const bestSellers = await productRepository.findBestSellers();

    // Get low stock products
    const allProducts = await productRepository.findAll({}, { limit: 1000 });
    const lowStockProducts = allProducts.data.filter((product: any) => {
      if (!product.variants || product.variants.length === 0) return false;
      return product.variants.some((variant: any) => (variant.stock || 0) < 20);
    });
    const criticalStockProducts = allProducts.data.filter((product: any) => {
      if (!product.variants || product.variants.length === 0) return false;
      return product.variants.some((variant: any) => (variant.stock || 0) < 5);
    });

    // Get top categories by product count
    const categories = await CategoryModel.find().lean();
    const categoryStats = await Promise.all(
      categories.map(async (category: any) => {
        const count = await productRepository.countByCategory(category._id.toString());
        return {
          name: category.name,
          count,
        };
      })
    );
    const totalCategoryProducts = categoryStats.reduce((sum, cat) => sum + cat.count, 0);
    const topCategories = categoryStats
      .filter((cat) => cat.count > 0)
      .map((cat) => ({
        name: cat.name,
        count: cat.count,
        percentage: totalCategoryProducts > 0 ? (cat.count / totalCategoryProducts) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    // Get top coupons by usage
    const allCoupons = await couponRepository.findAll({}, { limit: 100 });
    const topCoupons = allCoupons.data
      .map((coupon: any) => ({
        code: coupon.code,
        usedCount: coupon.usedCount || 0,
        totalDiscount: 0, // We don't track total discount per coupon, so we'll estimate
      }))
      .sort((a, b) => b.usedCount - a.usedCount)
      .slice(0, 5);

    // Estimate total discount for coupons (rough calculation)
    const estimatedAvgOrderValue = averageOrderValue || 1000;
    const topCouponsWithDiscount = topCoupons.map((coupon) => {
      // Rough estimate: assume average discount per use
      const estimatedDiscount = coupon.usedCount * (estimatedAvgOrderValue * 0.1); // Assume 10% average discount
      return {
        ...coupon,
        totalDiscount: estimatedDiscount,
      };
    });

    return ok({
      revenueToday,
      revenueYesterday,
      ordersToday,
      ordersYesterday,
      pendingOrdersCount,
      yesterdayPendingCount,
      averageOrderValue,
      totalCustomers: totalCustomers.total,
      totalProducts,
      lowStockCount: lowStockProducts.length,
      criticalStockCount: criticalStockProducts.length,
      bestSellers: bestSellers.slice(0, 4).map((p: any) => ({
        _id: p._id?.toString() || "",
        title: p.title,
        variants: p.variants,
        basePrice: p.basePrice,
      })),
      lowStock: lowStockProducts.slice(0, 10).map((p: any) => ({
        _id: p._id?.toString() || "",
        title: p.title,
        variants: p.variants,
      })),
      topCategories,
      topCoupons: topCouponsWithDiscount,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return serverError(error);
  }
}
