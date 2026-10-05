import type postgres from "postgres";
// Plain JS module so scripts/migrate.mjs can share it without a TS build step
import { SCHEMA_SQL } from "@/db/schema.mjs";

// Arbitrary constant identifying "AfterCare schema migration" in pg_locks
const MIGRATION_LOCK_ID = 727_001;

/**
 * Applies the idempotent schema. A transaction-scoped advisory lock makes
 * concurrent server instances (e.g. several serverless cold starts) take turns.
 */
export async function migrate(sql: postgres.Sql): Promise<void> {
  await sql.begin(async (tx) => {
    await tx`SELECT pg_advisory_xact_lock(${MIGRATION_LOCK_ID})`;
    await tx.unsafe(SCHEMA_SQL);
  });
}
