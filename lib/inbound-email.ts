import { createHmac, timingSafeEqual } from "node:crypto";

// Email sent to hello@ and privacy@ is received by Resend, which calls our
// webhook. We check the signature, fetch the message and forward it to the
// owner's own inbox, with Reply going straight back to the sender. This keeps
// email to two services (Vercel and Resend) with no separate forwarding service.

const TOLERANCE_SECONDS = 5 * 60;

/**
 * Verifies a webhook signed in the Svix format Resend uses. The signed content
 * is "id.timestamp.body", signed with HMAC SHA-256 using the base64 secret
 * after its "whsec_" prefix. Old or replayed requests are rejected.
 */
export function verifyWebhook(
  body: string,
  headers: { id: string | null; timestamp: string | null; signature: string | null },
  secret: string,
  now = Date.now()
): boolean {
  const { id, timestamp, signature } = headers;
  if (!id || !timestamp || !signature || !secret) return false;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(now / 1000 - ts) > TOLERANCE_SECONDS) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest();
  return signature.split(" ").some((part) => {
    const [version, value] = part.split(",");
    if (version !== "v1" || !value) return false;
    const given = Buffer.from(value, "base64");
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Builds the forwarded message: a short note of who wrote to which address, then their message. */
export function forwardedMessage(email: {
  from: string;
  to: string[];
  subject?: string;
  text?: string;
  html?: string;
}) {
  const to = email.to.join(", ");
  const subject = `[AfterCare] ${email.subject?.trim() || "(no subject)"}`;
  const note = `Sent to ${to} by ${email.from}. Reply to this email to answer them.`;
  const text = `${note}\n\n${email.text ?? ""}`;
  const html = `<p style="font:13px sans-serif;color:#587469;border-bottom:1px solid #e2dcd1;padding-bottom:8px">${escapeHtml(
    note
  )}</p>${email.html ?? `<pre style="white-space:pre-wrap;font:14px sans-serif">${escapeHtml(email.text ?? "")}</pre>`}`;
  return { subject, text, html };
}
