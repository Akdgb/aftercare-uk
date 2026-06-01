import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPlansByUser } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const plans = await getPlansByUser(userId);
  return NextResponse.json({ plans });
}
