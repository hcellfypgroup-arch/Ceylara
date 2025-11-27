import { cookies } from "next/headers";
import { decodeToken } from "@/lib/auth";
import { UserModel } from "@/lib/models";
import { db } from "@/lib/db";

export const getSessionUser = async () => {
  const token = (await cookies()).get("selara-token")?.value;
  if (!token) return null;

  const payload = decodeToken(token);
  if (!payload) return null;

  await db.connect();
  const user = await UserModel.findById(payload.sub).lean();
  if (!user) return null;

  // Handle case where user might be an array
  const userDoc = Array.isArray(user) ? user[0] : user;
  if (!userDoc || !userDoc._id) return null;

  return { id: userDoc._id.toString(), role: userDoc.role, email: userDoc.email };
};

