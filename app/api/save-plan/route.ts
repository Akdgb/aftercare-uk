import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { savePlan } from "@/lib/db";
import { planConfirmationEmail } from "@/lib/email-templates";
import { generateActionPlan } from "@/lib/action-plan";
import type { IntakeFormData } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { email, intakeData, taskStatuses } = await req.json();

    if (!email || !intakeData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Save to Supabase
    const planId = await savePlan(email, intakeData, taskStatuses ?? {});

    if (!planId) {
      return NextResponse.json({ error: "Could not save plan — database not configured" }, { status: 503 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aftercare-uk.vercel.app";
    const planUrl = `${baseUrl}/plan/${planId}`;

    // Count urgent incomplete tasks
    const tasks = generateActionPlan(intakeData as unknown as IntakeFormData);
    const urgentCount = tasks.filter(
      (t) => t.priority === "urgent" && taskStatuses?.[t.id] !== "completed"
    ).length;

    // Send confirmation email via Resend
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const typed = intakeData as unknown as IntakeFormData;
      const deceasedName = `${typed.deceasedFirstName} ${typed.deceasedLastName}`.trim();
      const { subject, html } = planConfirmationEmail(deceasedName || "your loved one", planUrl, urgentCount);

      await resend.emails.send({
        from: "AfterCare <no-reply@aftercare-uk.co.uk>",
        to: email,
        subject,
        html,
      });
    }

    return NextResponse.json({ planId, planUrl });
  } catch (error) {
    console.error("save-plan error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
