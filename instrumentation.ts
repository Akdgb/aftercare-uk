// Runs once when each server instance starts, before it handles requests.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) return;

  // Create/upgrade database tables automatically, so deploying never needs a
  // manual migration step. Failures are logged, not thrown: pages that don't
  // need the database (guidance, cost estimator…) keep working regardless.
  try {
    const [{ db }, { migrate }] = await Promise.all([import("@/lib/postgres"), import("@/lib/migrate")]);
    await migrate(db());
  } catch (e) {
    console.error("Database migration failed:", e);
  }
}
