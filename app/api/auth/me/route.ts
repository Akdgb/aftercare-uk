import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// Returns 200 with nulls when signed out so the header's check does not log errors
export async function GET() {
  const session = await getSession();
  return NextResponse.json({ email: session?.email ?? null, userId: session?.userId ?? null });
}
