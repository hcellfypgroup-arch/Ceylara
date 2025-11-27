import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/app/api/_utils/auth";
import { db } from "@/lib/db";
import { UserModel, ProductModel } from "@/lib/models";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.connect();
  const user = await UserModel.findById(session.id)
    .populate({
      path: "wishlist",
      model: ProductModel,
      select: "title slug heroImage basePrice variants",
    })
    .lean();
  
  // Format products for frontend
  const userDoc = user && !Array.isArray(user) ? user : null;
  const wishlist = (userDoc as any)?.wishlist || [];
  const wishlistItems = wishlist.map((product: any) => ({
    _id: product._id?.toString() || product.id,
    title: product.title,
    slug: product.slug,
    heroImage: product.heroImage,
    basePrice: product.basePrice,
    variants: product.variants?.map((v: any) => ({
      sku: v.sku,
      size: v.size,
      color: v.color,
      price: v.price || product.basePrice,
      salePrice: v.salePrice,
    })) || [],
  }));

  return NextResponse.json({ data: wishlistItems });
}

export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId } = await req.json();
  await db.connect();
  const product = await ProductModel.findById(productId);
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  await UserModel.findByIdAndUpdate(
    session.id,
    {
      $addToSet: { wishlist: productId },
    },
    { new: true }
  );

  return NextResponse.json({ data: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId } = await req.json();
  await db.connect();
  await UserModel.findByIdAndUpdate(session.id, {
    $pull: { wishlist: productId },
  });
  return NextResponse.json({ data: true });
}

