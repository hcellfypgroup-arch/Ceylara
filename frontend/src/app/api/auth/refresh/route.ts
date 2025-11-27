import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { refreshAccessToken, decodeRefreshToken } from "@/lib/auth";
import { ok, unauthorized, badRequest, serverError } from "@/app/api/_utils/response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const refreshToken = body.refreshToken || (await cookies()).get("selara-refresh")?.value;

    if (!refreshToken) {
      return unauthorized();
    }

    const payload = decodeRefreshToken(refreshToken);
    if (!payload) {
      return unauthorized();
    }

    const newToken = refreshAccessToken(refreshToken);
    const response = ok({ token: newToken });
    response.cookies.set("selara-token", newToken, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error: any) {
    if (error.message === "Invalid refresh token") {
      return badRequest("Invalid refresh token");
    }
    return serverError(error);
  }
}










