import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getPlan } from "@/lib/db";
import { reminderEmail } from "@/lib/email-templates";
import { generateActionPlan } from "@/lib/action-plan";
import type { IntakeFormData } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { planId } = await req.json();
    if (!planId) return NextResponse.json({ error: "Missing planId" }, { status: 400 });

    const plan = await getPlan(planId);
    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "Email not configured" }, { status: 503 });
    }

    const intake = plan.intake_data as unknown as IntakeFormData;
    const tasks = generateActionPlan(intake);
    const urgentPending = tasks
      .filter((t) => t.priority === "urgent" && plan.task_statuses?.[t.id] !== "completed")
      .map((t) => t.title);

    if (urgentPending.length === 0) {
      return NextResponse.json({ message: "No urgent tasks remaining" });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aftercare-uk.vercel.app";
    const planUrl = `${baseUrl}/plan/${planId}`;
    const deceasedName = `${intake.deceasedFirstName} ${intake.deceasedLastName}`.trim();

    const daysSince = Math.floor(
      (Date.now() - new Date(plan.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { subject, html } = reminderEmail(deceasedName, planUrl, urgentPending, daysSince);

    await resend.emails.send({
      from: "AfterCare <no-reply@aftercare-uk.co.uk>",
      to: plan.email,
      subject,
      html,
    });

    return NextResponse.json({ sent: true, urgentCount: urgentPending.length });
  } catch (error) {
    console.error("send-reminder error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
