import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { UserModel } from "@/lib/models";
import { loginSchema } from "@/lib/validators";
import { issueTokens, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload = loginSchema.parse(body);

    await db.connect();
    const user = await UserModel.findOne({ email: payload.email });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPassword(payload.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const { token, refresh } = issueTokens(user.toObject());
    const response = NextResponse.json({ data: { id: user._id } });
    response.cookies.set("selara-token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    response.cookies.set("selara-refresh", refresh, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

