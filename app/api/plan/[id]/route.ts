import { NextRequest, NextResponse } from "next/server";
import {
  deletePlan,
  getComments,
  getMembers,
  getPlanOwnerEmail,
  removeFaith,
  setTaskAssignee,
  setTaskStatus,
  TASK_STATUSES,
  type TaskStatus,
} from "@/lib/db";
import { generateActionPlan, normaliseTaskKeys } from "@/lib/action-plan";
import { requirePlanAccess } from "@/lib/plan-access";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const access = await requirePlanAccess(id);
  if (!access.ok) return access.response;
  const { plan, intake, role, session } = access;

  const [members, comments, ownerEmail] = await Promise.all([
    getMembers(id),
    getComments(id),
    getPlanOwnerEmail(id),
  ]);

  // Family members don't need the owner's personal contact details
  const intakeData = role === "owner" ? intake : { ...intake, email: "", phone: "" };

  return NextResponse.json({
    id: plan.id,
    role,
    me: session.email,
    ownerEmail,
    intake_data: intakeData,
    task_statuses: normaliseTaskKeys(intake, plan.task_statuses),
    task_assignees: normaliseTaskKeys(intake, plan.task_assignees),
    members,
    comments,
    created_at: plan.created_at,
    updated_at: plan.updated_at,
  });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const access = await requirePlanAccess(id);
  if (!access.ok) return access.response;
  const { intake } = access;

  const raw = await req.json().catch(() => null);
  const body: Record<string, unknown> = raw && typeof raw === "object" ? raw : {};

  if (body.removeFaith === true) {
    if (access.role !== "owner") {
      return NextResponse.json({ error: "Only the plan owner can change this" }, { status: 403 });
    }
    await removeFaith(id);
    return NextResponse.json({ ok: true });
  }

  const taskId = body.taskId;
  if (typeof taskId !== "string" || !generateActionPlan(intake).some((t) => t.id === taskId)) {
    return NextResponse.json({ error: "Unknown task" }, { status: 400 });
  }

  if ("status" in body) {
    if (typeof body.status !== "string" || !(TASK_STATUSES as readonly string[]).includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    await setTaskStatus(id, taskId, body.status as TaskStatus);
  }

  if ("assignee" in body) {
    const assignee = body.assignee === null ? null : String(body.assignee).toLowerCase();
    if (assignee) {
      const allowed = new Set([
        (await getPlanOwnerEmail(id))?.toLowerCase(),
        ...(await getMembers(id)).map((m) => m.email),
      ]);
      if (!allowed.has(assignee)) {
        return NextResponse.json({ error: "Can only assign to people on this plan" }, { status: 400 });
      }
    }
    await setTaskAssignee(id, taskId, assignee);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const access = await requirePlanAccess(id);
  if (!access.ok) return access.response;
  if (access.role !== "owner") {
    return NextResponse.json({ error: "Only the plan owner can delete it" }, { status: 403 });
  }
  await deletePlan(id, access.session.userId);
  return NextResponse.json({ ok: true });
}
