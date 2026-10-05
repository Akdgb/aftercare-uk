import { sql } from "@vercel/postgres";
import { randomBytes } from "crypto";

const LINK_TTL_MINUTES = 20;
const MAX_LINKS_PER_WINDOW = 5;
const WINDOW_MINUTES = 15;

/** True if this email has requested too many sign-in links recently. */
export async function isRateLimited(email: string): Promise<boolean> {
  const result = await sql`
    SELECT COUNT(*)::int AS n FROM magic_links
    WHERE email = ${email} AND created_at > NOW() - make_interval(mins => ${WINDOW_MINUTES})
  `;
  return (result.rows[0]?.n ?? 0) >= MAX_LINKS_PER_WINDOW;
}

export async function createMagicLink(email: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + LINK_TTL_MINUTES * 60 * 1000);

  await sql`
    INSERT INTO magic_links (email, token, expires_at)
    VALUES (${email}, ${token}, ${expiresAt.toISOString()})
  `;

  return token;
}

export async function verifyMagicLink(
  token: string
): Promise<{ userId: string; email: string } | null> {
  // Claim the token atomically so a double-click can't create two sessions
  const result = await sql`
    UPDATE magic_links SET used_at = NOW()
    WHERE token = ${token} AND expires_at > NOW() AND used_at IS NULL
    RETURNING email
  `;

  if (!result.rows.length) return null;
  const { email } = result.rows[0];

  const userResult = await sql`
    INSERT INTO users (email)
    VALUES (${email})
    ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
    RETURNING id
  `;

  return { userId: userResult.rows[0].id, email };
}
