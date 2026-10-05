import { NextRequest, NextResponse } from "next/server";
import { addMember, getMembers, removeMember } from "@/lib/db";
import { appUrl, sendEmail } from "@/lib/email";
import { inviteEmail } from "@/lib/email-templates";
import { normaliseEmail } from "@/lib/security";
import { requirePlanAccess } from "@/lib/plan-access";

type Params = { params: Promise<{ id: string }> };

const MAX_MEMBERS = 20;

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const access = await requirePlanAccess(id);
  if (!access.ok) return access.response;
  if (access.role !== "owner") {
    return NextResponse.json({ error: "Only the plan owner can invite people" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) ?? {};
  const email = normaliseEmail(body.email);
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
  if (!email || !name) {
    return NextResponse.json({ error: "Please enter a name and a valid email address." }, { status: 400 });
  }
  if (email === access.session.email.toLowerCase()) {
    return NextResponse.json({ error: "You're already the owner of this plan." }, { status: 400 });
  }
  if ((await getMembers(id)).length >= MAX_MEMBERS) {
    return NextResponse.json({ error: `A plan can have up to ${MAX_MEMBERS} family members.` }, { status: 400 });
  }

  const added = await addMember(id, email, name);
  if (!added) return NextResponse.json({ error: "That person has already been invited." }, { status: 409 });

  const deceased = `${access.intake.deceasedFirstName} ${access.intake.deceasedLastName}`.trim();
  const link = new URL("/auth/signin", appUrl());
  link.searchParams.set("next", `/plan/${id}`);
  link.searchParams.set("email", email);
  const { subject, html, text } = inviteEmail(access.session.email, name, deceased, link.toString());
  const sent = await sendEmail(email, subject, html, text);

  return NextResponse.json({ ok: true, emailSent: sent, members: await getMembers(id) });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const access = await requirePlanAccess(id);
  if (!access.ok) return access.response;

  const email = normaliseEmail(req.nextUrl.searchParams.get("email"));
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  // Owners can remove anyone; members can only remove themselves (leave the plan)
  const isSelf = email === access.session.email.toLowerCase();
  if (access.role !== "owner" && !isSelf) {
    return NextResponse.json({ error: "Only the plan owner can remove people" }, { status: 403 });
  }

  await removeMember(id, email);
  return NextResponse.json({ ok: true, members: await getMembers(id) });
}
