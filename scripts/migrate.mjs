// Applies db/schema.sql (idempotent) to the database in POSTGRES_URL.
// Usage: POSTGRES_URL=... npm run db:migrate   (or `vercel env pull` first)
import { readFileSync } from "node:fs";
import { sql } from "@vercel/postgres";

if (!process.env.POSTGRES_URL) {
  console.error("POSTGRES_URL is not set. Run `vercel env pull .env.local` and `export $(cat .env.local | xargs)`, or set it directly.");
  process.exit(1);
}

const statements = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8")
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n")
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

for (const statement of statements) {
  await sql.query(statement);
  console.log("✓", statement.split("\n")[0].slice(0, 80));
}
console.log(`Applied ${statements.length} statements.`);
process.exit(0);
