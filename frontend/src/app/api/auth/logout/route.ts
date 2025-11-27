import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ data: true });
  response.cookies.delete("selara-token");
  response.cookies.delete("selara-refresh");
  return response;
}

