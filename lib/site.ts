/**
 * The site's public address. Tolerates the setting being empty or missing
 * "https://" (for example "aftercare-uk.vercel.app"), which would otherwise
 * break link previews and the build.
 */
export function normaliseSiteUrl(raw: string | undefined, fallback = "https://aftercare-uk.vercel.app"): string {
  const value = (raw ?? "").trim().replace(/\/+$/, "");
  if (!value) return fallback;
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    return new URL(withProtocol).origin;
  } catch {
    return fallback;
  }
}

/** Contact details and review dates shown across the site, kept in one place. */
export const SITE = {
  name: "AfterCare UK",
  url: normaliseSiteUrl(process.env.NEXT_PUBLIC_APP_URL),
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@aftercare-uk.co.uk",
  privacyEmail: process.env.NEXT_PUBLIC_PRIVACY_EMAIL ?? "privacy@aftercare-uk.co.uk",
  /** The person or company legally responsible for AfterCare (set in Vercel once decided). */
  operator: process.env.NEXT_PUBLIC_OPERATOR_NAME ?? "",
  /** ICO registration number, shown once the data protection fee is paid. */
  icoNumber: process.env.NEXT_PUBLIC_ICO_NUMBER ?? "",
  /** When the guidance was last checked against official sources. Update after each content review. */
  contentReviewed: "7 October 2026",
} as const;
