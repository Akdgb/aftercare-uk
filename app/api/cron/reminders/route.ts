import { NextRequest, NextResponse } from "next/server";
import { getPlansDueReminder, markReminded, purgeExpiredData } from "@/lib/db";
import { generateActionPlan, normaliseTaskKeys } from "@/lib/action-plan";
import { appUrl, sendEmail } from "@/lib/email";
import { reminderEmail } from "@/lib/email-templates";
import { createUnsubscribeToken } from "@/lib/session";
import type { IntakeFormData } from "@/types";

/**
 * Daily job (see vercel.json): sends at most one reminder per plan per week
 * listing urgent and this-week tasks still open, then enforces data retention.
 * Vercel Cron authenticates with `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let sent = 0;
  let failed = 0;
  for (const plan of await getPlansDueReminder()) {
    // One bad plan must not stop everyone else's reminders
    try {
      const intake = plan.intake_data as unknown as IntakeFormData;
      const statuses = normaliseTaskKeys(intake, plan.task_statuses);
      const pending = generateActionPlan(intake)
        .filter((t) => (t.priority === "urgent" || t.priority === "this-week") && statuses[t.id] !== "completed")
        .map((t) => t.title);
      if (pending.length === 0) continue;

      const daysSince = Math.floor((Date.now() - new Date(plan.created_at).getTime()) / 86_400_000);
      const unsubscribe = `${appUrl()}/unsubscribe?token=${await createUnsubscribeToken(plan.user_id)}`;
      const name = `${intake.deceasedFirstName} ${intake.deceasedLastName}`.trim();
      const { subject, html, text } = reminderEmail(name, `${appUrl()}/plan/${plan.id}`, pending, daysSince, unsubscribe);

      if (await sendEmail(plan.owner_email, subject, html, text)) {
        await markReminded(plan.id);
        sent++;
      }
    } catch (e) {
      failed++;
      console.error(`reminder failed for plan ${plan.id}:`, e);
    }
  }

  const purged = await purgeExpiredData();
  return NextResponse.json({ sent, failed, purged });
}
