import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPlansForUser } from "@/lib/db";
import { normaliseTaskKeys } from "@/lib/action-plan";
import type { IntakeFormData } from "@/types";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const plans = await getPlansForUser(session);
  return NextResponse.json({
    plans: plans.map((p) => {
      const intake = p.intake_data as unknown as IntakeFormData;
      return {
        id: p.id,
        role: p.role,
        intake_data: intake,
        task_statuses: normaliseTaskKeys(intake, p.task_statuses),
        created_at: p.created_at,
        updated_at: p.updated_at,
      };
    }),
  });
}
