import { NextRequest, NextResponse } from "next/server";
import { addComment } from "@/lib/db";
import { generateActionPlan } from "@/lib/action-plan";
import { requirePlanAccess } from "@/lib/plan-access";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const access = await requirePlanAccess(id);
  if (!access.ok) return access.response;

  const body = (await req.json().catch(() => null)) ?? {};
  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (!text || text.length > 2000) {
    return NextResponse.json({ error: "Notes must be between 1 and 2000 characters." }, { status: 400 });
  }
  if (typeof body.taskId !== "string" || !generateActionPlan(access.intake).some((t) => t.id === body.taskId)) {
    return NextResponse.json({ error: "Unknown task" }, { status: 400 });
  }

  const comment = await addComment(id, body.taskId, access.session.email, text);
  return NextResponse.json({ comment });
}
