import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { FEEDBACK_ANSWERS, FEEDBACK_SECTIONS, FEEDBACK_TEXT, type FeedbackAnswer } from "@/lib/feedback";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const clip = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

/** Sends a tester's feedback form to the owner's inbox. Nothing is stored. */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) ?? {};
  if (clip(body.website, 200)) return NextResponse.json({ ok: true }); // spam trap filled in: ignore quietly
  const to = process.env.FORWARD_EMAIL_TO;
  if (!to) return NextResponse.json({ error: "Feedback is not set up yet." }, { status: 503 });

  const name = clip(body.name, 80) || "Someone";
  const device = clip(body.device, 120) || "Not given";
  const score = Number.isInteger(body.score) && body.score >= 1 && body.score <= 10 ? body.score : null;
  const answers = (body.answers && typeof body.answers === "object" ? body.answers : {}) as Record<string, unknown>;

  const rows = FEEDBACK_SECTIONS.map(
    (s) =>
      `<tr><td colspan="2" style="padding:10px 0 4px;font-weight:600">${s.title}</td></tr>` +
      s.items
        .map((i) => {
          const a = answers[i.id] as FeedbackAnswer;
          const text = FEEDBACK_ANSWERS[a] ?? "No answer";
          const colour = a === "no" ? "#9f1239" : a === "yes" ? "#166534" : "#587469";
          return `<tr><td style="padding:2px 12px 2px 0">${esc(i.label)}</td><td style="color:${colour};font-weight:600">${text}</td></tr>`;
        })
        .join("")
  ).join("");
  const notes = FEEDBACK_TEXT.map((f) => {
    const v = clip(body[f.id], 3000);
    return `<p style="margin:14px 0 4px;font-weight:600">${f.label}</p><p style="white-space:pre-wrap;margin:0">${v ? esc(v) : "<em>Nothing</em>"}</p>`;
  }).join("");
  const problems = FEEDBACK_SECTIONS.flatMap((s) => s.items).filter((i) => answers[i.id] === "no").length;

  const html = `<div style="font:14px sans-serif;color:#1d2b28;max-width:640px">
<p><strong>${esc(name)}</strong> on ${esc(device)}${score ? `, score <strong>${score}/10</strong>` : ""}</p>
<table style="border-collapse:collapse;font-size:14px">${rows}</table>${notes}</div>`;
  const text = `${name} on ${device}${score ? `, score ${score}/10` : ""}\n\n` + FEEDBACK_SECTIONS.flatMap((s) => s.items).map((i) => `${i.label}: ${FEEDBACK_ANSWERS[answers[i.id] as FeedbackAnswer] ?? "No answer"}`).join("\n") + "\n\n" + FEEDBACK_TEXT.map((f) => `${f.label}:\n${clip(body[f.id], 3000) || "Nothing"}`).join("\n\n");

  const subject = `[AfterCare feedback] ${name}${score ? `, ${score}/10` : ""}${problems ? `, ${problems} not working` : ""}`;
  const sent = await sendEmail(to, subject, html, text);
  if (!sent) return NextResponse.json({ error: "We could not send your feedback. Please try again." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
