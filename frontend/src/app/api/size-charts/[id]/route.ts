import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/app/api/_utils/guards";
import { badRequest, notFound, ok, serverError } from "@/app/api/_utils/response";
import { sizeChartService } from "@/lib/services";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    if (session instanceof Response) return session;

    await db.connect();
    const { id } = await params;
    const chart = await sizeChartService.getSizeChartById(id);
    return ok(chart);
  } catch (error: any) {
    if (error?.message === "Size chart not found") {
      return notFound(error.message);
    }
    return serverError(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    if (session instanceof Response) return session;

    await db.connect();
    const { id } = await params;
    const payload = await req.json();
    const chart = await sizeChartService.updateSizeChart(id, payload);
    return ok(chart);
  } catch (error: any) {
    if (error?.message) {
      if (error.message === "Size chart not found") {
        return notFound(error.message);
      }
      return badRequest(error.message);
    }
    return serverError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    if (session instanceof Response) return session;

    await db.connect();
    const { id } = await params;
    await sizeChartService.deleteSizeChart(id);
    return ok(true);
  } catch (error: any) {
    if (error?.message) {
      if (error.message === "Size chart not found") {
        return notFound(error.message);
      }
      return badRequest(error.message);
    }
    return serverError(error);
  }
}


