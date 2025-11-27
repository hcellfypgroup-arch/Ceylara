import { NextRequest } from "next/server";
import { requireAdmin } from "@/app/api/_utils/guards";
import { uploadImage } from "@/lib/cloudinary";
import { ok, badRequest, serverError } from "@/app/api/_utils/response";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (session instanceof Response) return session;

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string | null;

    if (!file) {
      return badRequest("No file provided");
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await uploadImage(buffer, {
      folder: folder || "products",
    });

    return ok({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return serverError(error);
  }
}

