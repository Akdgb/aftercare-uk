import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPlan, updateTaskStatuses } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = await getPlan(id);
  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(plan);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { taskStatuses } = await req.json();
  const ok = await updateTaskStatuses(id, session.userId, taskStatuses);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Update failed" }, { status: 500 });
}
