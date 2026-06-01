import { sql } from "@vercel/postgres";

export interface SavedPlan {
  id: string;
  user_id: string;
  intake_data: Record<string, unknown>;
  task_statuses: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export async function savePlan(
  userId: string,
  intakeData: Record<string, unknown>,
  taskStatuses: Record<string, string> = {}
): Promise<string | null> {
  try {
    const result = await sql`
      INSERT INTO saved_plans (user_id, intake_data, task_statuses)
      VALUES (${userId}, ${JSON.stringify(intakeData)}, ${JSON.stringify(taskStatuses)})
      RETURNING id
    `;
    return result.rows[0]?.id ?? null;
  } catch (e) {
    console.error("savePlan error:", e);
    return null;
  }
}

export async function getPlan(id: string): Promise<SavedPlan | null> {
  try {
    const result = await sql`
      SELECT * FROM saved_plans WHERE id = ${id}
    `;
    return (result.rows[0] as SavedPlan) ?? null;
  } catch {
    return null;
  }
}

export async function getPlansByUser(userId: string): Promise<SavedPlan[]> {
  try {
    const result = await sql`
      SELECT * FROM saved_plans
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return result.rows as SavedPlan[];
  } catch {
    return [];
  }
}

export async function updateTaskStatuses(
  id: string,
  userId: string,
  taskStatuses: Record<string, string>
): Promise<boolean> {
  try {
    await sql`
      UPDATE saved_plans
      SET task_statuses = ${JSON.stringify(taskStatuses)},
          updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
    `;
    return true;
  } catch {
    return false;
  }
}

export async function deletePlan(id: string, userId: string): Promise<boolean> {
  try {
    await sql`
      DELETE FROM saved_plans WHERE id = ${id} AND user_id = ${userId}
    `;
    return true;
  } catch {
    return false;
  }
}
