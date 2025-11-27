import { NextRequest } from "next/server";
import { getSessionUser } from "@/app/api/_utils/auth";
import { db } from "@/lib/db";
import { UserModel } from "@/lib/models";
import { addressSchema } from "@/lib/validators";
import { ok, badRequest, serverError, notFound } from "@/app/api/_utils/response";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) return badRequest("Unauthorized");

    const { id } = await params;
    const payload = addressSchema.parse(await req.json());

    await db.connect();
    
    // If setting as default, unset other defaults
    if (payload.isDefault) {
      await UserModel.findByIdAndUpdate(session.id, {
        $set: { "addresses.$[].isDefault": false },
      });
    }

    // Update the specific address
    const user = await UserModel.findOneAndUpdate(
      { _id: session.id, "addresses._id": id },
      { $set: { "addresses.$": { ...payload, _id: id } } },
      { new: true }
    ).select("addresses");

    if (!user) {
      return notFound("Address not found");
    }

    return ok(user.addresses);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return badRequest("Invalid address data");
    }
    return serverError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) return badRequest("Unauthorized");

    const { id } = await params;
    await db.connect();

    const user = await UserModel.findByIdAndUpdate(
      session.id,
      { $pull: { addresses: { _id: id } } },
      { new: true }
    ).select("addresses");

    if (!user) {
      return notFound("Address not found");
    }

    return ok(user.addresses);
  } catch (error) {
    return serverError(error);
  }
}

