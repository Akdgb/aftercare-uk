import { sql } from "@vercel/postgres";
import { randomBytes } from "crypto";

export async function createMagicLink(email: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes

  await sql`
    INSERT INTO magic_links (email, token, expires_at)
    VALUES (${email.toLowerCase().trim()}, ${token}, ${expiresAt.toISOString()})
  `;

  return token;
}

export async function verifyMagicLink(
  token: string
): Promise<{ userId: string; email: string } | null> {
  const result = await sql`
    SELECT email FROM magic_links
    WHERE token = ${token}
      AND expires_at > NOW()
      AND used_at IS NULL
  `;

  if (!result.rows.length) return null;

  const { email } = result.rows[0];

  // Mark used
  await sql`UPDATE magic_links SET used_at = NOW() WHERE token = ${token}`;

  // Upsert user
  const userResult = await sql`
    INSERT INTO users (email)
    VALUES (${email})
    ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
    RETURNING id
  `;

  return { userId: userResult.rows[0].id, email };
}
