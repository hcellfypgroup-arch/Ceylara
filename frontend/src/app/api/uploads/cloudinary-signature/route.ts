import { NextRequest } from "next/server";
import { requireAuth } from "@/app/api/_utils/guards";
import { generateUploadSignature } from "@/lib/cloudinary";
import { ok, serverError } from "@/app/api/_utils/response";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof Response) return session;

    const body = await req.json();
    const { folder } = body;

    const signature = generateUploadSignature({ folder });
    return ok(signature);
  } catch (error) {
    return serverError(error);
  }
}










