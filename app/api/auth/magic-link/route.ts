import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createMagicLink } from "@/lib/auth-db";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const token = await createMagicLink(email);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const link = `${baseUrl}/api/auth/verify?token=${token}`;

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "AfterCare <no-reply@aftercare-uk.co.uk>",
        to: email,
        subject: "Sign in to AfterCare",
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 16px;">
            <h2 style="color:#1c1917;font-size:20px;margin-bottom:8px;">Sign in to AfterCare</h2>
            <p style="color:#57534e;font-size:15px;line-height:1.6;margin-bottom:24px;">
              Click the button below to sign in. This link expires in 20 minutes.
            </p>
            <a href="${link}"
              style="display:inline-block;background:#334155;color:#fff;font-size:15px;font-weight:600;
                     text-decoration:none;padding:14px 28px;border-radius:10px;">
              Sign in to AfterCare →
            </a>
            <p style="color:#a8a29e;font-size:12px;margin-top:24px;">
              If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        `,
      });
    } else {
      // Dev fallback — log link to console
      console.log("\n🔑 MAGIC LINK (dev):", link, "\n");
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("magic-link error:", e);
    return NextResponse.json({ error: "Failed to send link" }, { status: 500 });
  }
}
