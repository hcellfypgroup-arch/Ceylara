import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ReviewModel } from "@/lib/models";
import { getSessionUser } from "@/app/api/_utils/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.connect();
  const { id } = await params;
  const review = await ReviewModel.findByIdAndUpdate(
    id,
    await req.json(),
    { new: true }
  );
  return NextResponse.json({ data: review });
}

