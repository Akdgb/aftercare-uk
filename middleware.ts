import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED = ["/dashboard"];
const COOKIE = "aftercare_session";

export async function middleware(req: NextRequest) {
  const isProtected = PROTECTED.some((p) => req.nextUrl.pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get(COOKIE)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET ?? "");
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
