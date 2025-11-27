import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/app/api/_utils/auth";
import { db } from "@/lib/db";
import { UserModel } from "@/lib/models";
import { addressSchema } from "@/lib/validators";
import { ok, badRequest, serverError } from "@/app/api/_utils/response";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) return badRequest("Unauthorized");

    await db.connect();
    const user = await UserModel.findById(session.id).select("addresses");
    return ok(user?.addresses ?? []);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return badRequest("Unauthorized");

    const payload = addressSchema.parse(await req.json());
    
    // If this is set as default, unset other defaults
    if (payload.isDefault) {
      await db.connect();
      await UserModel.findByIdAndUpdate(session.id, {
        $set: { "addresses.$[].isDefault": false },
      });
    }

    await db.connect();
    const updated = await UserModel.findByIdAndUpdate(
      session.id,
      { $push: { addresses: payload } },
      { new: true }
    ).select("addresses");
    
    return ok(updated?.addresses ?? []);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return badRequest("Invalid address data");
    }
    return serverError(error);
  }
}

