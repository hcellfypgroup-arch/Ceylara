import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getSessionUser } from "@/app/api/_utils/auth";
import { db } from "@/lib/db";
import { UserModel, ProductModel } from "@/lib/models";
import { ok, badRequest, serverError } from "@/app/api/_utils/response";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) return badRequest("Unauthorized");

    await db.connect();
    const user = await UserModel.findById(session.id)
      .select("recentlyViewed")
      .populate({
        path: "recentlyViewed.product",
        model: ProductModel,
        select: "title slug heroImage basePrice variants",
      })
      .lean();

    if (!user) {
      return ok([]);
    }

    // Format the recently viewed items
    const userDoc = Array.isArray(user) ? user[0] : user;
    const recentItems = ((userDoc as any)?.recentlyViewed || [])
      .filter((item: any) => item.product) // Filter out deleted products
      .map((item: any) => {
        const product = item.product;
        const variantPrices = product.variants?.map((v: any) => v.price || product.basePrice) || [];
        const minPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : product.basePrice;

        return {
          productId: product._id.toString(),
          title: product.title,
          slug: product.slug,
          image: product.heroImage,
          price: minPrice,
          viewedAt: item.viewedAt,
        };
      })
      .sort((a: any, b: any) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())
      .slice(0, 20); // Limit to 20 most recent

    return ok(recentItems);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return badRequest("Unauthorized");

    const { productId } = await req.json();
    if (!productId) {
      return badRequest("Product ID is required");
    }

    await db.connect();
    
    // Check if product exists
    const product = await ProductModel.findById(productId);
    if (!product) {
      return badRequest("Product not found");
    }

    // Remove existing entry for this product if it exists, then add new entry at the beginning
    // Convert string to ObjectId
    const productObjectId = new mongoose.Types.ObjectId(productId);

    // First, pull the existing entry
    await UserModel.findByIdAndUpdate(session.id, {
      $pull: { recentlyViewed: { product: productObjectId } },
    });

    // Then add new entry at the beginning
    await UserModel.findByIdAndUpdate(session.id, {
      $push: {
        recentlyViewed: {
          $each: [{ product: productObjectId, viewedAt: new Date() }],
          $position: 0,
        },
      },
    });

    // Keep only the last 50 items
    const userDoc = await UserModel.findById(session.id).select("recentlyViewed").lean();
    const userRecent = userDoc && !Array.isArray(userDoc) ? (userDoc as any).recentlyViewed : null;
    if (userRecent && userRecent.length > 50) {
      // Slice to keep only the first 50 items
      const recentItems = userRecent.slice(0, 50);
      await UserModel.findByIdAndUpdate(session.id, {
        $set: { recentlyViewed: recentItems },
      });
    }

    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}

