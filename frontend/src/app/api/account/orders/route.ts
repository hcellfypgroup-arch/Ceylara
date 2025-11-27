import { NextRequest } from "next/server";
import { getSessionUser } from "@/app/api/_utils/auth";
import { db } from "@/lib/db";
import { orderService } from "@/lib/services";
import { ok, badRequest, serverError } from "@/app/api/_utils/response";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return badRequest("Authentication required");
    }

    await db.connect();
    const page = Number(req.nextUrl.searchParams.get("page") ?? 1);
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? 10);
    const result = await orderService.getUserOrders(session.id, page, limit);
    
    return ok(result);
  } catch (error) {
    return serverError(error);
  }
}

