import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return NextResponse.json({ plans: [] });

    const db = createClient(url, key);
    const { data, error } = await db
      .from("saved_plans")
      .select("id, intake_data, task_statuses, created_at, updated_at")
      .eq("email", email.toLowerCase().trim())
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ plans: [] });
    return NextResponse.json({ plans: data ?? [] });
  } catch {
    return NextResponse.json({ plans: [] });
  }
}
