import { db } from "@/lib/db";
import { notFound, ok, serverError } from "@/app/api/_utils/response";
import { sizeChartService } from "@/lib/services";

export async function GET() {
  try {
    await db.connect();
    const chart = await sizeChartService.getDefaultSizeChart();
    return ok(chart);
  } catch (error: any) {
    if (error?.message === "Default size chart not configured") {
      return notFound(error.message);
    }
    return serverError(error);
  }
}


