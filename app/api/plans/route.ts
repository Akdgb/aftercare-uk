import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPlansByUser } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const plans = await getPlansByUser(session.userId);
  return NextResponse.json({ plans });
}
