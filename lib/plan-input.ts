import { generateActionPlan } from "@/lib/action-plan";
import { intakeSchema } from "@/lib/intake-schema";
import { TASK_STATUSES } from "@/lib/db";
import type { z } from "zod";

export type PlanInput = { intake: z.output<typeof intakeSchema>; statuses: Record<string, string> };

/**
 * Checks plan answers and progress sent from the browser: answers must pass the
 * intake schema (which also enforces consent for faith and background), and
 * only known tasks with known statuses are kept.
 */
export function parsePlanInput(intakeData: unknown, taskStatuses: unknown): PlanInput | null {
  const parsed = intakeSchema.safeParse(intakeData);
  if (!parsed.success) return null;
  const intake = parsed.data;
  const incoming = (taskStatuses && typeof taskStatuses === "object" ? taskStatuses : {}) as Record<string, unknown>;
  const statuses: Record<string, string> = {};
  for (const t of generateActionPlan(intake)) {
    const s = incoming[t.id];
    if (typeof s === "string" && (TASK_STATUSES as readonly string[]).includes(s)) statuses[t.id] = s;
  }
  return { intake, statuses };
}
