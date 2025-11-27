import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/app/api/_utils/guards";
import { typeService } from "@/lib/services";
import { ok, created, badRequest, serverError } from "@/app/api/_utils/response";

export async function GET(req: NextRequest) {
  try {
    await db.connect();
    const types = await typeService.getAllTypes();
    return ok(types);
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
    const type = await typeService.createType(payload);
    return created(type);
  } catch (error: any) {
    if (error.message) {
      return badRequest(error.message);
    }
    return serverError(error);
  }
}

