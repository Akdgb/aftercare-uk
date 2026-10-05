import { sql } from "@vercel/postgres";

export interface SavedPlan {
  id: string;
  user_id: string;
  intake_data: Record<string, unknown>;
  task_statuses: Record<string, string>;
  task_assignees: Record<string, string>;
  last_reminded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlanMember {
  email: string;
  name: string;
  created_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  author_email: string;
  body: string;
  created_at: string;
}

export type PlanRole = "owner" | "member";

export const TASK_STATUSES = ["pending", "in-progress", "completed"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

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

async function getPlan(id: string): Promise<SavedPlan | null> {
  try {
    const result = await sql`SELECT * FROM saved_plans WHERE id = ${id}`;
    return (result.rows[0] as SavedPlan) ?? null;
  } catch {
    // Invalid UUIDs throw — treat as not found
    return null;
  }
}

/**
 * Loads a plan only if the user owns it or has been invited to it.
 * Every plan route must go through this rather than reading plans directly.
 */
export async function getPlanForUser(
  id: string,
  user: { userId: string; email: string }
): Promise<{ plan: SavedPlan; role: PlanRole } | null> {
  const plan = await getPlan(id);
  if (!plan) return null;
  if (plan.user_id === user.userId) return { plan, role: "owner" };

  const member = await sql`
    SELECT 1 FROM plan_members WHERE plan_id = ${id} AND email = ${user.email.toLowerCase()}
  `;
  return member.rows.length ? { plan, role: "member" } : null;
}

export async function getPlansForUser(
  user: { userId: string; email: string }
): Promise<(SavedPlan & { role: PlanRole })[]> {
  try {
    const result = await sql`
      SELECT p.*, 'owner' AS role FROM saved_plans p WHERE p.user_id = ${user.userId}
      UNION ALL
      SELECT p.*, 'member' AS role FROM saved_plans p
        JOIN plan_members m ON m.plan_id = p.id
        WHERE m.email = ${user.email.toLowerCase()} AND p.user_id <> ${user.userId}
      ORDER BY created_at DESC
    `;
    return result.rows as (SavedPlan & { role: PlanRole })[];
  } catch (e) {
    console.error("getPlansForUser error:", e);
    return [];
  }
}

export async function getPlanOwnerEmail(planId: string): Promise<string | null> {
  const result = await sql`
    SELECT u.email FROM saved_plans p JOIN users u ON u.id = p.user_id WHERE p.id = ${planId}
  `;
  return result.rows[0]?.email ?? null;
}

// Single-key JSONB merges so two family members ticking different tasks
// at the same time never overwrite each other's changes.
export async function setTaskStatus(planId: string, taskId: string, status: TaskStatus) {
  await sql`
    UPDATE saved_plans
    SET task_statuses = task_statuses || jsonb_build_object(${taskId}::text, ${status}::text),
        updated_at = NOW()
    WHERE id = ${planId}
  `;
}

export async function setTaskAssignee(planId: string, taskId: string, email: string | null) {
  if (email) {
    await sql`
      UPDATE saved_plans
      SET task_assignees = task_assignees || jsonb_build_object(${taskId}::text, ${email}::text),
          updated_at = NOW()
      WHERE id = ${planId}
    `;
  } else {
    await sql`
      UPDATE saved_plans
      SET task_assignees = task_assignees - ${taskId}::text, updated_at = NOW()
      WHERE id = ${planId}
    `;
  }
}

export async function deletePlan(id: string, userId: string): Promise<boolean> {
  const result = await sql`DELETE FROM saved_plans WHERE id = ${id} AND user_id = ${userId}`;
  return (result.rowCount ?? 0) > 0;
}

// ── Family members ──────────────────────────────────────────────────────────

export async function getMembers(planId: string): Promise<PlanMember[]> {
  const result = await sql`
    SELECT email, name, created_at FROM plan_members
    WHERE plan_id = ${planId} ORDER BY created_at
  `;
  return result.rows as PlanMember[];
}

export async function addMember(planId: string, email: string, name: string): Promise<boolean> {
  const result = await sql`
    INSERT INTO plan_members (plan_id, email, name)
    VALUES (${planId}, ${email.toLowerCase()}, ${name})
    ON CONFLICT (plan_id, email) DO NOTHING
  `;
  return (result.rowCount ?? 0) > 0;
}

export async function removeMember(planId: string, email: string) {
  const lower = email.toLowerCase();
  await sql`DELETE FROM plan_members WHERE plan_id = ${planId} AND email = ${lower}`;
  // Unassign anything that was given to them
  await sql`
    UPDATE saved_plans
    SET task_assignees = COALESCE(
      (SELECT jsonb_object_agg(key, value) FROM jsonb_each(task_assignees) WHERE value <> to_jsonb(${lower}::text)),
      '{}'::jsonb
    )
    WHERE id = ${planId}
  `;
}

// ── Comments ────────────────────────────────────────────────────────────────

export async function getComments(planId: string): Promise<TaskComment[]> {
  const result = await sql`
    SELECT id, task_id, author_email, body, created_at FROM task_comments
    WHERE plan_id = ${planId} ORDER BY created_at
  `;
  return result.rows as TaskComment[];
}

export async function addComment(
  planId: string,
  taskId: string,
  authorEmail: string,
  body: string
): Promise<TaskComment> {
  const result = await sql`
    INSERT INTO task_comments (plan_id, task_id, author_email, body)
    VALUES (${planId}, ${taskId}, ${authorEmail}, ${body})
    RETURNING id, task_id, author_email, body, created_at
  `;
  return result.rows[0] as TaskComment;
}

// ── Account ─────────────────────────────────────────────────────────────────

export async function getUserPreferences(userId: string): Promise<{ reminders_enabled: boolean } | null> {
  const result = await sql`SELECT reminders_enabled FROM users WHERE id = ${userId}`;
  return (result.rows[0] as { reminders_enabled: boolean }) ?? null;
}

export async function setRemindersEnabled(userId: string, enabled: boolean) {
  await sql`UPDATE users SET reminders_enabled = ${enabled} WHERE id = ${userId}`;
}

/** Erases the user, their plans (cascading members/comments), memberships and login tokens. */
export async function deleteAccount(userId: string, email: string) {
  const lower = email.toLowerCase();
  await sql`DELETE FROM plan_members WHERE email = ${lower}`;
  await sql`DELETE FROM magic_links WHERE email = ${lower}`;
  await sql`DELETE FROM users WHERE id = ${userId}`;
}

// ── Scheduled jobs ──────────────────────────────────────────────────────────

/** Plans at least 2 days old whose owner wants reminders and hasn't had one this week. */
export async function getPlansDueReminder(): Promise<(SavedPlan & { owner_email: string })[]> {
  const result = await sql`
    SELECT p.*, u.email AS owner_email
    FROM saved_plans p JOIN users u ON u.id = p.user_id
    WHERE u.reminders_enabled
      AND p.created_at < NOW() - INTERVAL '2 days'
      AND p.created_at > NOW() - INTERVAL '90 days'
      AND (p.last_reminded_at IS NULL OR p.last_reminded_at < NOW() - INTERVAL '7 days')
  `;
  return result.rows as (SavedPlan & { owner_email: string })[];
}

export async function markReminded(planId: string) {
  await sql`UPDATE saved_plans SET last_reminded_at = NOW() WHERE id = ${planId}`;
}

/** Enforces the retention periods stated in the privacy policy. */
export async function purgeExpiredData() {
  const plans = await sql`DELETE FROM saved_plans WHERE created_at < NOW() - INTERVAL '3 years'`;
  const links = await sql`DELETE FROM magic_links WHERE created_at < NOW() - INTERVAL '1 day'`;
  return { plans: plans.rowCount ?? 0, magicLinks: links.rowCount ?? 0 };
}
