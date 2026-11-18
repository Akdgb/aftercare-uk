import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { forwardedMessage, verifyWebhook } from "@/lib/inbound-email";

/** Resend calls this when an email arrives at hello@ or privacy@ (see lib/inbound-email.ts). */
export async function POST(req: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET ?? "";
  const forwardTo = process.env.FORWARD_EMAIL_TO ?? "";
  const body = await req.text();

  const ok = verifyWebhook(
    body,
    {
      id: req.headers.get("svix-id"),
      timestamp: req.headers.get("svix-timestamp"),
      signature: req.headers.get("svix-signature"),
    },
    secret
  );
  if (!ok) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  const event = JSON.parse(body) as { type?: string; data?: { email_id?: string } };
  if (event.type !== "email.received" || !event.data?.email_id) return NextResponse.json({ ok: true });
  if (!forwardTo || !process.env.RESEND_API_KEY) {
    console.error("inbound-email: FORWARD_EMAIL_TO or RESEND_API_KEY is not set, so the email was not forwarded");
    // A server error makes Resend retry later, once the settings are fixed
    return NextResponse.json({ error: "Forwarding is not set up" }, { status: 503 });
  }

  const res = await fetch(`https://api.resend.com/emails/receiving/${encodeURIComponent(event.data.email_id)}`, {
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);
  if (!res?.ok) {
    console.error("inbound-email: could not fetch the received email", res?.status);
    return NextResponse.json({ error: "Could not fetch email" }, { status: 502 });
  }
  const email = (await res.json()) as { from: string; to: string[] | string; subject?: string; text?: string; html?: string };
  const message = forwardedMessage({ ...email, to: Array.isArray(email.to) ? email.to : [email.to] });

  const sent = await sendEmail(forwardTo, message.subject, message.html, message.text, { replyTo: email.from });
  if (!sent) return NextResponse.json({ error: "Could not forward" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
