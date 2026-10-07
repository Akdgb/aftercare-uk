import { z } from "zod";
import { getFaiths } from "@/lib/faith";

const text = (max: number) => z.string().trim().max(max);

const faithEnum = z.enum(["christian", "muslim", "hindu", "sikh", "jewish", "humanist", "african-caribbean", "other", "none", "prefer-not-to-say"]);

/** Server-side validation for intake data before it is stored in a saved plan. */
const baseIntakeSchema = z.object({
  deceasedFirstName: text(100).min(1),
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
  housingType: z.enum(["owned", "private-rental", "council", "supported", "unsure"]),
  receivingBenefits: z.enum(["yes", "no", "unsure"]),
  needsFinancialHelp: z.enum(["yes", "no", "unsure"]),
});

/**
 * Faith is special category data: without explicit consent it is dropped
 * (never stored) rather than rejecting the whole plan.
 */
export const intakeSchema = baseIntakeSchema.transform((data) => {
  const faiths = getFaiths(data);
  if (faiths.length > 0 && data.faithConsent === true) {
    return { ...data, faith: faiths[0], faiths, faithConsent: true };
  }
  return { ...data, faith: "prefer-not-to-say" as const, faiths: [], faithConsent: false };
});
