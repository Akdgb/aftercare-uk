/**
 * Runs the data layer against a real Postgres. Skipped unless TEST_DATABASE_URL
 * is set (CI provides one; locally: `docker compose up -d` then
 * TEST_DATABASE_URL=postgres://aftercare:aftercare@localhost:5432/aftercare npm test).
 * WARNING: truncates all AfterCare tables in that database.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("database layer (real Postgres)", async () => {
  process.env.DATABASE_URL = url;
  const { db } = await import("@/lib/postgres");
  const store = await import("@/lib/db");
  const auth = await import("@/lib/auth-db");

  const owner = { userId: "", email: "owner@example.com" };
  const sister = { userId: "", email: "sis@example.com" };
  const stranger = { userId: "", email: "stranger@example.com" };
  let planId = "";

  beforeAll(async () => {
    const sql = db();
    // Run the real startup migration twice: it must be safe to repeat
    const { migrate } = await import("@/lib/migrate");
    await Promise.all([migrate(sql), migrate(sql)]);
    await sql`TRUNCATE users, magic_links, saved_plans, plan_members, task_comments CASCADE`;
    for (const u of [owner, sister, stranger]) {
      const user = await auth.verifyMagicLink(await auth.createMagicLink(u.email));
      u.userId = user!.userId;
    }
  });

  afterAll(async () => {
    await db().end();
  });

  it("magic links work once only", async () => {
    const token = await auth.createMagicLink("once@example.com");
    expect(await auth.verifyMagicLink(token)).not.toBeNull();
    expect(await auth.verifyMagicLink(token)).toBeNull();
  });

  it("stores intake data as a JSON object, not a double-encoded string", async () => {
    planId = (await store.savePlan(owner.userId, { deceasedFirstName: "Jean" }, { "1": "completed" }))!;
    const [row] = await db()`SELECT jsonb_typeof(intake_data) AS t, jsonb_typeof(task_statuses) AS s FROM saved_plans`;
    expect(row).toEqual({ t: "object", s: "object" });
    const found = await store.getPlanForUser(planId, owner);
    expect(found?.plan.intake_data).toEqual({ deceasedFirstName: "Jean" });
  });

  it("merges task status updates instead of overwriting", async () => {
    await store.setTaskStatus(planId, "notify-hmrc", "completed");
    await store.setTaskStatus(planId, "notify-banks", "in-progress");
    const found = await store.getPlanForUser(planId, owner);
    expect(found?.plan.task_statuses).toEqual({ "1": "completed", "notify-hmrc": "completed", "notify-banks": "in-progress" });
  });

  it("removes the faith answer when consent is withdrawn, keeping the rest", async () => {
    const id = (await store.savePlan(owner.userId, { deceasedFirstName: "Ann", faith: "jewish", faithConsent: true }))!;
    await store.removeFaith(id);
    const found = await store.getPlanForUser(id, owner);
    expect(found?.plan.intake_data).toEqual({ deceasedFirstName: "Ann", faith: "prefer-not-to-say", faithConsent: false });
    await store.deletePlan(id, owner.userId);
  });

  it("only lets the owner and invited members see a plan", async () => {
    expect((await store.getPlanForUser(planId, owner))?.role).toBe("owner");
    expect(await store.getPlanForUser(planId, sister)).toBeNull();
    expect(await store.getPlanForUser(planId, stranger)).toBeNull();
    expect(await store.getPlanForUser("not-a-uuid", owner)).toBeNull();

    expect(await store.addMember(planId, "SIS@example.com", "Sis")).toBe(true);
    expect(await store.addMember(planId, "sis@example.com", "Sis")).toBe(false);
    expect((await store.getPlanForUser(planId, sister))?.role).toBe("member");
    expect(await store.getPlanForUser(planId, stranger)).toBeNull();
    expect((await store.getPlansForUser(sister)).map((p) => [p.id, p.role])).toEqual([[planId, "member"]]);
  });

  it("assigns tasks and unassigns them when a member is removed", async () => {
    await store.setTaskAssignee(planId, "notify-banks", "sis@example.com");
    await store.setTaskAssignee(planId, "locate-will", "owner@example.com");
    await store.addComment(planId, "notify-banks", "sis@example.com", "Barclays need a certified copy");
    expect((await store.getComments(planId)).map((c) => c.body)).toEqual(["Barclays need a certified copy"]);

    await store.removeMember(planId, "sis@example.com");
    expect((await store.getPlanForUser(planId, owner))?.plan.task_assignees).toEqual({ "locate-will": "owner@example.com" });
    expect(await store.getPlanForUser(planId, sister)).toBeNull();

    await store.setTaskAssignee(planId, "locate-will", null);
    expect((await store.getPlanForUser(planId, owner))?.plan.task_assignees).toEqual({});
  });

  it("rate limits sign-in links per email", async () => {
    for (let i = 0; i < 5; i++) await auth.createMagicLink("spam@example.com");
    expect(await auth.isRateLimited("spam@example.com")).toBe(true);
    expect(await auth.isRateLimited("someone-else@example.com")).toBe(false);
  });

  it("deleting an account removes its plans, members and comments", async () => {
    await store.addMember(planId, "sis@example.com", "Sis");
    await store.deleteAccount(owner.userId, owner.email);
    const [counts] = await db()`
      SELECT (SELECT count(*) FROM saved_plans)::int AS plans,
             (SELECT count(*) FROM plan_members)::int AS members,
             (SELECT count(*) FROM task_comments)::int AS comments`;
    expect(counts).toEqual({ plans: 0, members: 0, comments: 0 });
  });
});
