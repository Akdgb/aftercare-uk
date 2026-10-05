import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { savePlan } from "@/lib/db";
import { appUrl, sendEmail } from "@/lib/email";
import { planConfirmationEmail } from "@/lib/email-templates";
import { generateActionPlan } from "@/lib/action-plan";
import { intakeSchema } from "@/lib/intake-schema";
import { TASK_STATUSES } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

    const body = (await req.json().catch(() => null)) ?? {};
    const parsed = intakeSchema.safeParse(body.intakeData);
    if (!parsed.success) return NextResponse.json({ error: "Invalid plan data" }, { status: 400 });
    const intake = parsed.data;

    // Carry over progress made on the unsaved local plan, keeping only known tasks
    const tasks = generateActionPlan(intake);
    const statuses: Record<string, string> = {};
    const incoming = (body.taskStatuses ?? {}) as Record<string, unknown>;
    for (const t of tasks) {
      const s = incoming[t.id];
      if (typeof s === "string" && (TASK_STATUSES as readonly string[]).includes(s)) statuses[t.id] = s;
    }

    const planId = await savePlan(session.userId, intake, statuses);
    if (!planId) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

    const planUrl = `${appUrl()}/plan/${planId}`;
    const name = `${intake.deceasedFirstName} ${intake.deceasedLastName}`.trim();
    const urgentCount = tasks.filter((t) => t.priority === "urgent" && statuses[t.id] !== "completed").length;
    const { subject, html, text } = planConfirmationEmail(name || "your loved one", planUrl, urgentCount);
    // Sent to the verified account email, not the free-text intake field
    await sendEmail(session.email, subject, html, text).catch(() => false);

    return NextResponse.json({ planId, planUrl });
  } catch (e) {
    console.error("save-plan:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
