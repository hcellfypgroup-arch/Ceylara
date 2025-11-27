import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { reviewSchema } from "@/lib/validators";
import { requireAuth } from "@/app/api/_utils/guards";
import { reviewService } from "@/lib/services";
import { ok, created, badRequest, serverError } from "@/app/api/_utils/response";

export async function GET(req: NextRequest) {
  try {
    await db.connect();
    const productId = req.nextUrl.searchParams.get("productId");
    const page = Number(req.nextUrl.searchParams.get("page") ?? 1);
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? 10);

    if (productId) {
      const result = await reviewService.getProductReviews(productId, page, limit);
      return ok(result);
    }

    const result = await reviewService.getAllReviews({ status: "approved" }, page, limit);
    return ok(result);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof Response) return session;

    const payload = reviewSchema.parse(await req.json());
    await db.connect();
    const review = await reviewService.createReview({
      productId: payload.productId,
      userId: session.id,
      rating: payload.rating,
      title: payload.title,
      comment: payload.comment,
    });

    return created(review);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return badRequest(error.errors[0].message);
    }
    if (error.message) {
      return badRequest(error.message);
    }
    return serverError(error);
  }
}

