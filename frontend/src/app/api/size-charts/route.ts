import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/app/api/_utils/guards";
import { created, ok, badRequest, serverError } from "@/app/api/_utils/response";
import { sizeChartService } from "@/lib/services";

export async function GET() {
  try {
    await db.connect();
    const charts = await sizeChartService.getAllSizeCharts();
    return ok(charts);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (session instanceof Response) return session;

    await db.connect();
    const payload = await req.json();
    const chart = await sizeChartService.createSizeChart(payload);
    return created(chart);
  } catch (error: any) {
    if (error?.message) {
      return badRequest(error.message);
    }
    return serverError(error);
  }
}


