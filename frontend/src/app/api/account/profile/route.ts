import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/api/_utils/auth";
import { db } from "@/lib/db";
import { UserModel } from "@/lib/models";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.connect();
  const user = await UserModel.findById(session.id).select("-passwordHash");
  return NextResponse.json({ data: user });
}

export async function PATCH(req: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  await db.connect();
  const updated = await UserModel.findByIdAndUpdate(session.id, body, {
    new: true,
  }).select("-passwordHash");

  return NextResponse.json({ data: updated });
}

