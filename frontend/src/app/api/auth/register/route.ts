import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { UserModel } from "@/lib/models";
import { registerSchema } from "@/lib/validators";
import { hashPassword, issueTokens } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload = registerSchema.parse(body);

    await db.connect();
    const existing = await UserModel.findOne({ email: payload.email });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(payload.password);
    const user = await UserModel.create({
      email: payload.email,
      name: payload.name,
      passwordHash,
    });

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
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}

