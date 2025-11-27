import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SiteSettingModel } from "@/lib/models";

const DEFAULT_RATES = [
  { minWeight: 0, maxWeight: 500, fee: 500 },
  { minWeight: 501, maxWeight: 1000, fee: 800 },
  { minWeight: 1001, maxWeight: 2000, fee: 1200 },
  { minWeight: 2001, maxWeight: 5000, fee: 2000 },
  { minWeight: 5001, maxWeight: -1, fee: 3000 },
];

const DEFAULT_FREE_SHIPPING_THRESHOLD = 15000;
const DEFAULT_EXPRESS_SURCHARGE = 700;

export async function GET() {
  try {
    await db.connect();
    const settings = await SiteSettingModel.findOne().lean();
    const shipping = settings?.shipping;

    return NextResponse.json({
      data: {
        rates:
          shipping?.rates && shipping.rates.length > 0
            ? shipping.rates
            : DEFAULT_RATES,
        freeShippingThreshold:
          shipping?.freeShippingThreshold ?? DEFAULT_FREE_SHIPPING_THRESHOLD,
        expressShippingSurcharge:
          shipping?.expressShippingSurcharge ?? DEFAULT_EXPRESS_SURCHARGE,
      },
    });
  } catch (error) {
    console.error("Failed to load shipping settings:", error);
    return NextResponse.json({
      data: {
        rates: DEFAULT_RATES,
        freeShippingThreshold: DEFAULT_FREE_SHIPPING_THRESHOLD,
        expressShippingSurcharge: DEFAULT_EXPRESS_SURCHARGE,
      },
      error: "Failed to load live shipping settings. Using defaults.",
    });
  }
}



