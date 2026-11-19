import { sendEmail } from "@/lib/email";
import { accountDeletedEmail } from "@/lib/email-templates";
import { NextRequest, NextResponse } from "next/server";
import { clearSession, getSession } from "@/lib/session";
import { deleteAccount, getUserPreferences, setRemindersEnabled } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const prefs = await getUserPreferences(session.userId);
  return NextResponse.json({ email: session.email, remindersEnabled: prefs?.reminders_enabled ?? true });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const body = (await req.json().catch(() => null)) ?? {};
  if (typeof body.remindersEnabled !== "boolean") {
    return NextResponse.json({ error: "remindersEnabled must be true or false" }, { status: 400 });
  }
  await setRemindersEnabled(session.userId, body.remindersEnabled);
  return NextResponse.json({ ok: true });
}

/** Right to erasure: removes the account, every plan it owns, and its memberships. */
export async function DELETE() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  await deleteAccount(session.userId, session.email);
  await clearSession();
  // Confirm by email, so the person has a record that their data was deleted
  const { subject, html, text } = accountDeletedEmail();
  await sendEmail(session.email, subject, html, text).catch(() => false);
  return NextResponse.json({ ok: true });
}
