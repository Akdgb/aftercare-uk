// Applies db/schema.sql (idempotent — safe to run any number of times)
// to the database in DATABASE_URL (or POSTGRES_URL).
//   npm run db:migrate
import { readFileSync, existsSync } from "node:fs";
import postgres from "postgres";

// Load .env.local / .env so `npm run db:migrate` works without exporting variables
for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Add it to .env.local (see .env.example).");
  process.exit(1);
}

const sql = postgres(url, { max: 1, onnotice: () => {} });
try {
  await sql.unsafe(readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8"));
  console.log("✓ Database schema is up to date.");
} catch (e) {
  console.error("✗ Migration failed:", e.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
