import { NextResponse } from "next/server";

export const ok = (data: unknown, init?: ResponseInit) =>
  NextResponse.json({ data }, { status: 200, ...init });

export const created = (data: unknown) =>
  NextResponse.json({ data }, { status: 201 });

export const badRequest = (message: string) =>
  NextResponse.json({ error: message }, { status: 400 });

export const unauthorized = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

export const notFound = (message = "Not found") =>
  NextResponse.json({ error: message }, { status: 404 });

export const serverError = (error: unknown) => {
  console.error(error);
  return NextResponse.json(
    { error: "Unexpected server error" },
    { status: 500 }
  );
};

