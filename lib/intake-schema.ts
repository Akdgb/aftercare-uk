import { z } from "zod";
import { getFaiths } from "@/lib/faith";
import { isBackgroundId } from "@/lib/cultures";

const text = (max: number) => z.string().trim().max(max);

const faithEnum = z.enum([
  "christian",
  "christian-pentecostal",
  "christian-orthodox",
  "muslim",
  "hindu",
  "sikh",
  "jewish",
  "buddhist",
  "traditional",
  "humanist",
  "african-caribbean",
  "other",
  "none",
  "prefer-not-to-say",
]);

/** Server-side validation for intake data before it is stored in a saved plan. */
/** Changes whenever the consent wording on the setup and edit pages changes. */
export const CONSENT_VERSION = "2026-11-v1";

const baseIntakeSchema = z.object({
  deceasedFirstName: text(100).min(1),
  ageGroup: z.enum(["baby", "child", "adult"]).optional(),
  deceasedLastName: text(100),
  dateOfDeath: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  locationOfDeath: text(200),
  currentLocation: z.enum(["hospital", "hospice", "care-home", "home", "funeral-director"]),
  relationship: text(60).min(1),
  postcode: text(10),
  email: text(254),
  phone: text(30),
  funeralPreference: z.enum(["burial", "cremation", "unsure"]),
  faith: faithEnum,
  faiths: z.array(faithEnum).max(10).optional(),
  faithConsent: z.boolean().optional(),
  /** When consent was given and which wording was shown, as a record of consent. */
  faithConsentAt: z.string().max(40).optional(),
  faithConsentVersion: z.string().max(20).optional(),
  backgrounds: z.array(z.string().refine(isBackgroundId)).max(20).optional(),
  backgroundOther: text(100).optional(),
  burialPlace: z.enum(["uk", "abroad", "both", "unsure"]).optional(),
  housingType: z.enum(["owned", "private-rental", "council", "supported", "unsure"]),
  receivingBenefits: z.enum(["yes", "no", "unsure"]),
  needsFinancialHelp: z.enum(["yes", "no", "unsure"]),
});

/**
 * Faith and ethnic origin are special category data: without explicit consent
 * they are dropped (never stored) rather than rejecting the whole plan.
 */
export const intakeSchema = baseIntakeSchema.transform((data) => {
  const faiths = getFaiths(data);
  const backgrounds = [...new Set(data.backgrounds ?? [])];
  const backgroundOther = data.backgroundOther?.trim() || undefined;
  if ((faiths.length > 0 || backgrounds.length > 0 || backgroundOther) && data.faithConsent === true) {
    return {
      ...data,
      faith: faiths[0] ?? ("prefer-not-to-say" as const),
      faiths,
      backgrounds,
      backgroundOther,
      faithConsent: true,
      // Keep the original time consent was given; record it now if this is the first time
      faithConsentAt: data.faithConsentAt ?? new Date().toISOString(),
      faithConsentVersion: data.faithConsentVersion ?? CONSENT_VERSION,
    };
  }
  return {
    ...data,
    faith: "prefer-not-to-say" as const,
    faiths: [],
    backgrounds: [],
    backgroundOther: undefined,
    faithConsent: false,
    // Consent withdrawn or never given: no consent record is kept
    faithConsentAt: undefined,
    faithConsentVersion: undefined,
  };
});
