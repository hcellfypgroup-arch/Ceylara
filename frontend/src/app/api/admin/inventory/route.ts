import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ProductModel } from "@/lib/models";
import { requireAdmin } from "@/app/api/_utils/guards";

export async function GET() {
  const session = await requireAdmin();
  if (session instanceof Response) return session;

  await db.connect();
  const products = await ProductModel.find()
    .select("title variants")
    .lean();

  const stock = products.map((product: any) => ({
    id: product._id ? (typeof product._id === 'object' ? product._id.toString() : String(product._id)) : '',
    title: product.title,
    variants: product.variants.map((variant: any) => ({
      sku: variant.sku,
      stock: variant.stock,
    })),
  }));

  return NextResponse.json({ data: stock });
}

