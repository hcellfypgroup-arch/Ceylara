import { NextRequest } from "next/server";
import { requireAdmin } from "@/app/api/_utils/guards";
import { db } from "@/lib/db";
import { orderService } from "@/lib/services";
import { ok, serverError } from "@/app/api/_utils/response";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (session instanceof Response) return session;

    await db.connect();
    
    const page = Number(req.nextUrl.searchParams.get("page") ?? 1);
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? 20);
    const status = req.nextUrl.searchParams.get("status");
    const search = req.nextUrl.searchParams.get("search");
    
    const filters: Record<string, unknown> = {};
    if (status) {
      filters.status = status;
    }
    if (search) {
      filters.search = search;
    }

    const result = await orderService.getAllOrders(filters, page, limit);
    return ok(result);
  } catch (error: any) {
    console.error("Admin orders API error:", error);
    return serverError(error);
  }
}

