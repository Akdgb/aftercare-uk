/** Contact details and review dates shown across the site, kept in one place. */
export const SITE = {
  name: "AfterCare UK",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://aftercare-uk.vercel.app",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@aftercare-uk.co.uk",
  privacyEmail: process.env.NEXT_PUBLIC_PRIVACY_EMAIL ?? "privacy@aftercare-uk.co.uk",
  /** When the guidance was last checked against official sources. Update after each content review. */
  contentReviewed: "7 October 2026",
} as const;
