import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SiteSettingModel, type SiteSettingDocument } from "@/lib/models";
import { requireAdmin } from "@/app/api/_utils/guards";

export async function GET() {
  const session = await requireAdmin();
  if (session instanceof Response) return session;

  await db.connect();
  const settings = await SiteSettingModel.findOne().lean() as SiteSettingDocument | null;
  const shipping = settings?.shipping;
  
  // Return default values if not set
  return NextResponse.json({
    data: {
      rates: shipping?.rates || [
        { minWeight: 0, maxWeight: 500, fee: 500 },
        { minWeight: 501, maxWeight: 1000, fee: 800 },
        { minWeight: 1001, maxWeight: 2000, fee: 1200 },
        { minWeight: 2001, maxWeight: 5000, fee: 2000 },
        { minWeight: 5001, maxWeight: -1, fee: 3000 },
      ],
      freeShippingThreshold: shipping?.freeShippingThreshold || 15000,
      expressShippingSurcharge: shipping?.expressShippingSurcharge || 700,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (session instanceof Response) return session;

  await db.connect();
  
  const shippingData = await req.json();
  
  // Validate the data structure
  if (!shippingData.rates || !Array.isArray(shippingData.rates)) {
    return NextResponse.json(
      { error: "Invalid shipping rates format" },
      { status: 400 }
    );
  }

  const settings = await SiteSettingModel.findOneAndUpdate(
    {},
    { $set: { shipping: shippingData } },
    { upsert: true, new: true }
  );
  
  return NextResponse.json({ data: settings.shipping });
}

