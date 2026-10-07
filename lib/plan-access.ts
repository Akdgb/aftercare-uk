import { NextResponse } from "next/server";
import { getSession, type Session } from "@/lib/session";
import { getPlanForUser, type PlanRole, type SavedPlan } from "@/lib/db";
import type { IntakeFormData } from "@/types";

type Access =
  | { ok: true; session: Session; plan: SavedPlan; intake: IntakeFormData; role: PlanRole }
  | { ok: false; response: NextResponse };

/** Resolves the signed-in user's access to a plan, or a ready-made 401/404 response. */
export async function requirePlanAccess(planId: string): Promise<Access> {
  const session = await getSession();
  if (!session) {
    return { ok: false, response: NextResponse.json({ error: "Not signed in" }, { status: 401 }) };
  }
  const found = await getPlanForUser(planId, session);
  if (!found) {
    // Same response whether the plan does not exist or is not shared with them
    return { ok: false, response: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }
  return {
    ok: true,
    session,
    plan: found.plan,
    intake: found.plan.intake_data as unknown as IntakeFormData,
    role: found.role,
  };
}
