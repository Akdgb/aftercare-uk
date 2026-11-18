import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { forwardedMessage, verifyWebhook } from "@/lib/inbound-email";

const secret = "whsec_" + Buffer.from("test-secret-key-123").toString("base64");
const sign = (id: string, ts: string, body: string) =>
  "v1," + createHmac("sha256", Buffer.from(secret.slice(6), "base64")).update(`${id}.${ts}.${body}`).digest("base64");

describe("inbound email webhook", () => {
  const body = JSON.stringify({ type: "email.received", data: { email_id: "abc" } });
  const now = 1_800_000_000_000;
  const ts = String(now / 1000);

  it("accepts a correctly signed, recent request", () => {
    expect(verifyWebhook(body, { id: "msg_1", timestamp: ts, signature: sign("msg_1", ts, body) }, secret, now)).toBe(true);
  });

  it("rejects a changed body, wrong secret, missing headers or an old request", () => {
    const sig = sign("msg_1", ts, body);
    expect(verifyWebhook(body + " ", { id: "msg_1", timestamp: ts, signature: sig }, secret, now)).toBe(false);
    expect(verifyWebhook(body, { id: "msg_1", timestamp: ts, signature: sig }, "whsec_" + Buffer.from("other").toString("base64"), now)).toBe(false);
    expect(verifyWebhook(body, { id: null, timestamp: ts, signature: sig }, secret, now)).toBe(false);
    expect(verifyWebhook(body, { id: "msg_1", timestamp: ts, signature: sig }, secret, now + 10 * 60 * 1000)).toBe(false);
  });

  it("escapes plain-text messages and labels the subject", () => {
    const m = forwardedMessage({ from: "a@example.com", to: ["hello@aftercareuk.co.uk"], subject: "Hi", text: "<b>x</b>" });
    expect(m.subject).toBe("[AfterCare] Hi");
    expect(m.html).toContain("&lt;b&gt;x&lt;/b&gt;");
    expect(m.html).not.toContain("<b>x</b>");
  });
});
