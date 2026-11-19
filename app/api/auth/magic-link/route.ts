import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createMagicLink, isRateLimited } from "@/lib/auth-db";
import { appUrl, sendEmail } from "@/lib/email";
import { magicLinkEmail } from "@/lib/email-templates";
import { normaliseEmail, safeNextPath } from "@/lib/security";

/** A keyed hash of the caller's IP address: enough to rate limit, without storing the IP itself. */
function requesterKey(req: NextRequest): string | undefined {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "";
  const secret = process.env.SESSION_SECRET;
  if (!ip || !secret) return undefined;
  return createHmac("sha256", secret).update(`rate-limit:${ip}`).digest("hex").slice(0, 32);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) ?? {};
    const email = normaliseEmail(body.email);
    if (!email) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    // Accounts are for people aged 16 or over (see the privacy policy). The
    // question is asked neutrally in the browser; this enforces the answer.
    if (body.ageBand !== "16-17" && body.ageBand !== "18-plus") {
      return NextResponse.json({ error: "Please tell us your age to continue." }, { status: 400 });
    }

    const requester = requesterKey(req);
    if (await isRateLimited(email, requester)) {
      return NextResponse.json(
        { error: "Too many sign-in links requested. Please wait a few minutes and check your inbox." },
        { status: 429 }
      );
    }

    const token = await createMagicLink(email, requester);
    const link = new URL("/api/auth/verify", appUrl());
    link.searchParams.set("token", token);
    const next = safeNextPath(body.next, "");
    if (next) link.searchParams.set("next", next);

    const { subject, html, text } = magicLinkEmail(link.toString());
    const sent = await sendEmail(email, subject, html, text);
    if (!sent) return NextResponse.json({ error: "We could not send the email. Please try again." }, { status: 502 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("magic-link error:", e);
    return NextResponse.json({ error: "Failed to send link" }, { status: 500 });
  }
}
