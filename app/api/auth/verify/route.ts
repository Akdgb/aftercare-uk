import { NextRequest, NextResponse } from "next/server";
import { verifyMagicLink } from "@/lib/auth-db";
import { createSession } from "@/lib/session";
import { safeNextPath } from "@/lib/security";
import { ALLOWED_AGE_BANDS, type AgeBand } from "@/lib/age";
import { savePlan } from "@/lib/db";
import { parsePlanInput } from "@/lib/plan-input";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const next = safeNextPath(req.nextUrl.searchParams.get("next"), "/plan");

  if (!token) {
    return NextResponse.redirect(new URL("/auth/signin?error=missing", req.url));
  }

  const age = req.nextUrl.searchParams.get("age") as AgeBand | null;
  const user = await verifyMagicLink(token, { ageAllowed: Boolean(age && ALLOWED_AGE_BANDS.includes(age)) }).catch(() => null);

  if (!user) {
    const retry = new URL("/auth/signin", req.url);
    retry.searchParams.set("error", "expired");
    retry.searchParams.set("next", next);
    return NextResponse.redirect(retry);
  }

  await createSession({ userId: user.userId, email: user.email });

  // Save the plan sent with this link, then open it
  const pending = user.pendingPlan as { intake?: unknown; statuses?: unknown } | null;
  const plan = pending ? parsePlanInput(pending.intake, pending.statuses) : null;
  if (plan) {
    const planId = await savePlan(user.userId, plan.intake, plan.statuses).catch(() => null);
    if (planId) return NextResponse.redirect(new URL(`/plan/${planId}?saved=1`, req.url));
  }

  return NextResponse.redirect(new URL(next, req.url));
}
