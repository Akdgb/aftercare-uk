import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Resend } from "resend";
import { savePlan } from "@/lib/db";
import { planConfirmationEmail } from "@/lib/email-templates";
import { generateActionPlan } from "@/lib/action-plan";
import type { IntakeFormData } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

    const { intakeData, taskStatuses } = await req.json();
    if (!intakeData) return NextResponse.json({ error: "Missing intake data" }, { status: 400 });

    const planId = await savePlan(userId, intakeData, taskStatuses ?? {});
    if (!planId) return NextResponse.json({ error: "Database not configured yet" }, { status: 503 });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aftercare-uk.vercel.app";
    const planUrl = `${baseUrl}/plan/${planId}`;

    // Optional confirmation email
    if (process.env.RESEND_API_KEY && intakeData.email) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const typed = intakeData as IntakeFormData;
      const deceasedName = `${typed.deceasedFirstName} ${typed.deceasedLastName}`.trim();
      const urgentCount = generateActionPlan(typed).filter(
        (t) => t.priority === "urgent" && (taskStatuses ?? {})[t.id] !== "completed"
      ).length;
      const { subject, html } = planConfirmationEmail(deceasedName || "your loved one", planUrl, urgentCount);
      await resend.emails.send({
        from: "AfterCare <no-reply@aftercare-uk.co.uk>",
        to: typed.email,
        subject,
        html,
      }).catch(() => {}); // don't fail if email fails
    }

    return NextResponse.json({ planId, planUrl });
  } catch (e) {
    console.error("save-plan error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
