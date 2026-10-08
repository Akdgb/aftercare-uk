import { db } from "@/lib/postgres";
import { randomBytes } from "crypto";

const LINK_TTL_MINUTES = 20;
const MAX_LINKS_PER_WINDOW = 5;
const WINDOW_MINUTES = 15;

/** True if this email has requested too many sign-in links recently. */
export async function isRateLimited(email: string): Promise<boolean> {
  const rows = await db()`
    SELECT COUNT(*)::int AS n FROM magic_links
    WHERE email = ${email} AND created_at > NOW() - make_interval(mins => ${WINDOW_MINUTES})
  `;
  return (rows[0]?.n ?? 0) >= MAX_LINKS_PER_WINDOW;
}

export async function createMagicLink(email: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + LINK_TTL_MINUTES * 60 * 1000);

  await db()`
    INSERT INTO magic_links (email, token, expires_at)
    VALUES (${email}, ${token}, ${expiresAt})
  `;

  return token;
}

export async function verifyMagicLink(
  token: string
): Promise<{ userId: string; email: string } | null> {
  // Claim the token atomically so a double-click cannot create two sessions
  const rows = await db()`
    UPDATE magic_links SET used_at = NOW()
    WHERE token = ${token} AND expires_at > NOW() AND used_at IS NULL
    RETURNING email
  `;

  if (!rows.length) return null;
  const email = rows[0].email as string;

  const userRows = await db()`
    INSERT INTO users (email)
    VALUES (${email})
    ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
    RETURNING id
  `;

  return { userId: userRows[0].id, email };
}
