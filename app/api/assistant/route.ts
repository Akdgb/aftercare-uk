import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Only user/assistant turns are accepted from the browser — a client-supplied
// "system" message could otherwise override the instructions below.
const requestSchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(4000) }))
    .min(1)
    .max(30),
});

const SYSTEM_PROMPT = `You are an AfterCare bereavement assistant helping UK families navigate what to do after a loved one has died.

Your role is to:
- Provide clear, practical, compassionate guidance on bereavement administration
- Answer questions about registering a death, funeral options, probate, government benefits, council housing, pensions, and financial support
- Cite UK government sources (GOV.UK, DWP, HMRC) wherever possible
- Use plain English — no legal jargon
- Always clarify this is guidance, not legal advice

UK-specific knowledge you must apply:
- Deaths must be registered within 5 days (England/Wales/NI) or 8 days (Scotland)
- Tell Us Once is the government service for notifying multiple departments
- Bereavement Support Payment is available to spouses/civil partners whose partner paid NI
- Funeral Expenses Payment is available to people on qualifying benefits
- Council tenancy succession has specific legal rules — spouses have automatic rights, others must qualify
- Probate is usually required when the estate includes property or larger bank balances — each bank sets its own threshold (often £5,000–£50,000)
- The Competition and Markets Authority (CMA) Funeral Market Order requires funeral directors to publish standardised price lists

Always end responses with a source attribution like:
Source: GOV.UK or Source: [specific government/official body]

If someone seems to be in crisis or at risk, gently signpost Samaritans (116 123, free, 24/7) or NHS 111.

Keep responses focused and practical. Use bold for key terms. Use bullet points for lists. Be warm and compassionate throughout.`;

export async function POST(req: NextRequest) {
  try {
    const parsed = requestSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    // Keep the most recent turns to bound cost on long conversations
    const messages = parsed.data.messages.slice(-12);

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });
    }

    // OpenAI's REST API directly — no SDK needed for a single endpoint
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        max_tokens: 800,
        temperature: 0.3,
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text().catch(() => "")}`);
    const completion = await res.json();

    const content: string =
      completion.choices?.[0]?.message?.content ?? "I was unable to generate a response. Please try again.";

    return NextResponse.json({ content, sources: [] });
  } catch (error) {
    console.error("OpenAI error:", error);
    return NextResponse.json(
      { error: "AI service unavailable" },
      { status: 503 }
    );
  }
}
