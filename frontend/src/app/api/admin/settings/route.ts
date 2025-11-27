import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SiteSettingModel } from "@/lib/models";
import { requireAdmin } from "@/app/api/_utils/guards";

export async function GET() {
  const session = await requireAdmin();
  if (session instanceof Response) return session;

  await db.connect();
  const settings = await SiteSettingModel.findOne().lean();
  return NextResponse.json({ data: settings });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (session instanceof Response) return session;

  await db.connect();
  const settings = await SiteSettingModel.findOneAndUpdate(
    {},
    await req.json(),
    { upsert: true, new: true }
  );
  return NextResponse.json({ data: settings });
}

