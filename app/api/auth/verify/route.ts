import { NextRequest, NextResponse } from "next/server";
import { verifyMagicLink } from "@/lib/auth-db";
import { createSession } from "@/lib/session";
import { safeNextPath } from "@/lib/security";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const next = safeNextPath(req.nextUrl.searchParams.get("next"));

  if (!token) {
    return NextResponse.redirect(new URL("/auth/signin?error=missing", req.url));
  }

  const user = await verifyMagicLink(token).catch(() => null);

  if (!user) {
    const retry = new URL("/auth/signin", req.url);
    retry.searchParams.set("error", "expired");
    retry.searchParams.set("next", next);
    return NextResponse.redirect(retry);
  }

  await createSession({ userId: user.userId, email: user.email });

  return NextResponse.redirect(new URL(next, req.url));
}
