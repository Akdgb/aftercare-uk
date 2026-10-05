import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);

/** Server-side validation for intake data before it is stored in a saved plan. */
export const intakeSchema = z.object({
  deceasedFirstName: text(100).min(1),
  deceasedLastName: text(100).min(1),
  dateOfDeath: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  locationOfDeath: text(200).min(1),
  currentLocation: z.enum(["hospital", "hospice", "care-home", "home", "funeral-director"]),
  relationship: text(60).min(1),
  postcode: text(10),
  email: text(254),
  phone: text(30),
  funeralPreference: z.enum(["burial", "cremation", "unsure"]),
  faith: z.enum(["christian", "muslim", "hindu", "sikh", "jewish", "humanist", "african-caribbean", "other", "none"]),
  housingType: z.enum(["owned", "private-rental", "council", "supported", "unsure"]),
  receivingBenefits: z.enum(["yes", "no", "unsure"]),
  needsFinancialHelp: z.enum(["yes", "no", "unsure"]),
});
