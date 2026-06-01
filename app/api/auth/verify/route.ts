import { NextRequest, NextResponse } from "next/server";
import { verifyMagicLink } from "@/lib/auth-db";
import { createSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/auth/signin?error=missing", req.url));
  }

  const user = await verifyMagicLink(token);

  if (!user) {
    return NextResponse.redirect(new URL("/auth/signin?error=expired", req.url));
  }

  await createSession({ userId: user.userId, email: user.email });

  return NextResponse.redirect(new URL("/dashboard", req.url));
}
