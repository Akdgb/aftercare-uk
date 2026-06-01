import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSession } from "@/lib/session";
import { savePlan } from "@/lib/db";
import { planConfirmationEmail } from "@/lib/email-templates";
import { generateActionPlan } from "@/lib/action-plan";
import type { IntakeFormData } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

    const { intakeData, taskStatuses } = await req.json();
    if (!intakeData) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const planId = await savePlan(session.userId, intakeData, taskStatuses ?? {});
    if (!planId) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const planUrl = `${baseUrl}/plan/${planId}`;

    if (process.env.RESEND_API_KEY && (intakeData as IntakeFormData).email) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const typed = intakeData as IntakeFormData;
      const name = `${typed.deceasedFirstName} ${typed.deceasedLastName}`.trim();
      const urgentCount = generateActionPlan(typed).filter(
        (t) => t.priority === "urgent" && !(taskStatuses ?? {})[t.id]
      ).length;
      const { subject, html } = planConfirmationEmail(name || "your loved one", planUrl, urgentCount);
      await resend.emails.send({
        from: "AfterCare <no-reply@aftercare-uk.co.uk>",
        to: typed.email,
        subject,
        html,
      }).catch(() => {});
    }

    return NextResponse.json({ planId, planUrl });
  } catch (e) {
    console.error("save-plan:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
