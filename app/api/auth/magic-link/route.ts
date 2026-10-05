import { NextRequest, NextResponse } from "next/server";
import { createMagicLink, isRateLimited } from "@/lib/auth-db";
import { appUrl, sendEmail } from "@/lib/email";
import { magicLinkEmail } from "@/lib/email-templates";
import { normaliseEmail, safeNextPath } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) ?? {};
    const email = normaliseEmail(body.email);
    if (!email) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (await isRateLimited(email)) {
      return NextResponse.json(
        { error: "Too many sign-in links requested. Please wait a few minutes and check your inbox." },
        { status: 429 }
      );
    }

    const token = await createMagicLink(email);
    const link = new URL("/api/auth/verify", appUrl());
    link.searchParams.set("token", token);
    const next = safeNextPath(body.next, "");
    if (next) link.searchParams.set("next", next);

    const { subject, html, text } = magicLinkEmail(link.toString());
    const sent = await sendEmail(email, subject, html, text);
    if (!sent) return NextResponse.json({ error: "We couldn't send the email. Please try again." }, { status: 502 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("magic-link error:", e);
    return NextResponse.json({ error: "Failed to send link" }, { status: 500 });
  }
}
