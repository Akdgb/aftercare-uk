import postgres from "postgres";

// One shared connection pool per server instance. Kept on globalThis so
// Next.js hot reloads in development do not open a new pool on every edit.
const globalForDb = globalThis as unknown as { __aftercareDb?: postgres.Sql };

/**
 * Returns the Postgres client. Works with any Postgres: local Docker, Neon,
 * Supabase, Railway, RDS… Put `?sslmode=require` on hosted URLs.
 */
export function db(): postgres.Sql {
  if (!globalForDb.__aftercareDb) {
    const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    globalForDb.__aftercareDb = postgres(url, {
      // Small pool: serverless functions each get their own
      max: 5,
      idle_timeout: 20,
      // Required for transaction-mode poolers (Neon, Supabase, PgBouncer)
      prepare: false,
      // Ignore informational notices such as "already exists, skipping"
      onnotice: () => {},
    });
  }
  return globalForDb.__aftercareDb;
}
