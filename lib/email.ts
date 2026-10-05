import { Resend } from "resend";

export function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

const FROM = () => process.env.EMAIL_FROM ?? "AfterCare <no-reply@aftercare-uk.co.uk>";

/**
 * Sends an email via Resend. Without RESEND_API_KEY (local dev) the email is
 * logged to the console instead so flows can still be exercised end to end.
 * Returns false only when a configured provider rejects the message.
 */
export async function sendEmail(to: string, subject: string, html: string, text?: string): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`\n✉️  EMAIL (dev, not sent) to=${to}\nSubject: ${subject}\n${text ?? ""}\n`);
    return true;
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({ from: FROM(), to, subject, html, text });
    if (error) {
      console.error("sendEmail error:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("sendEmail failed:", e);
    return false;
  }
}
