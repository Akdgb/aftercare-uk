import { db } from "@/lib/postgres";
import { createHash, randomBytes } from "crypto";

const LINK_TTL_MINUTES = 20;
const MAX_LINKS_PER_WINDOW = 5;
const WINDOW_MINUTES = 15;
const MAX_LINKS_PER_REQUESTER_PER_HOUR = 20;

/** Only a hash of each sign-in token is stored, so a copy of the database cannot be used to sign in. */
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/**
 * True if this email, or this device (a keyed hash of its IP address), has
 * requested too many sign-in links recently. Stops one person flooding an
 * inbox and stops automated sending to many addresses.
 */
export async function isRateLimited(email: string, requester?: string): Promise<boolean> {
  const rows = await db()`
    SELECT
      COUNT(*) FILTER (WHERE email = ${email} AND created_at > NOW() - make_interval(mins => ${WINDOW_MINUTES}))::int AS by_email,
      COUNT(*) FILTER (WHERE ${requester ?? null}::text IS NOT NULL AND requester = ${requester ?? null} AND created_at > NOW() - INTERVAL '1 hour')::int AS by_requester
    FROM magic_links
    WHERE email = ${email} OR (${requester ?? null}::text IS NOT NULL AND requester = ${requester ?? null})
  `;
  const r = rows[0] ?? { by_email: 0, by_requester: 0 };
  return r.by_email >= MAX_LINKS_PER_WINDOW || r.by_requester >= MAX_LINKS_PER_REQUESTER_PER_HOUR;
}

export async function createMagicLink(email: string, requester?: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + LINK_TTL_MINUTES * 60 * 1000);

  await db()`
    INSERT INTO magic_links (email, token, expires_at, requester)
    VALUES (${email}, ${hashToken(token)}, ${expiresAt}, ${requester ?? null})
  `;

  return token;
}

export async function verifyMagicLink(
  token: string
): Promise<{ userId: string; email: string } | null> {
  // Claim the token atomically so a double-click cannot create two sessions
  const rows = await db()`
    UPDATE magic_links SET used_at = NOW()
    WHERE token = ${hashToken(token)} AND expires_at > NOW() AND used_at IS NULL
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
