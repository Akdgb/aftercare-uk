import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "aftercare_session";

// Signed-in areas: the dashboard and saved plans (/plan/<id>). The unsaved
// local plan at /plan stays public so people can use AfterCare without an account.
export async function proxy(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  const secret = process.env.SESSION_SECRET;

  if (token && secret) {
    try {
      // Must match SESSION_AUDIENCE in lib/session.ts
      await jwtVerify(token, new TextEncoder().encode(secret), { audience: "aftercare-session" });
      return NextResponse.next();
    } catch {
      // fall through to sign-in
    }
  }

  const signIn = new URL("/auth/signin", req.url);
  signIn.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/dashboard/:path*", "/plan/:id+"],
};
