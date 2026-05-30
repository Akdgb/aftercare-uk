import { createClient } from "@supabase/supabase-js";

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export interface SavedPlan {
  id: string;
  email: string;
  intake_data: Record<string, unknown>;
  task_statuses: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export async function savePlan(
  email: string,
  intakeData: Record<string, unknown>,
  taskStatuses: Record<string, string>
): Promise<string | null> {
  const db = getClient();
  if (!db) return null;

  const { data, error } = await db
    .from("saved_plans")
    .insert({ email, intake_data: intakeData, task_statuses: taskStatuses })
    .select("id")
    .single();

  if (error) { console.error("savePlan error:", error); return null; }
  return data.id as string;
}

export async function getPlan(id: string): Promise<SavedPlan | null> {
  const db = getClient();
  if (!db) return null;

  const { data, error } = await db
    .from("saved_plans")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as SavedPlan;
}

export async function updateTaskStatuses(
  id: string,
  taskStatuses: Record<string, string>
): Promise<boolean> {
  const db = getClient();
  if (!db) return false;

  const { error } = await db
    .from("saved_plans")
    .update({ task_statuses: taskStatuses, updated_at: new Date().toISOString() })
    .eq("id", id);

  return !error;
}
