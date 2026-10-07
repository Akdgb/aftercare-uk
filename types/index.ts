export type FuneralPreference = "burial" | "cremation" | "unsure";
export type FaithOption =
  | "christian"
  | "muslim"
  | "hindu"
  | "sikh"
  | "jewish"
  | "humanist"
  | "christian-orthodox"
  | "christian-pentecostal"
  | "buddhist"
  | "traditional"
  /** Older plans only: replaced by the more specific cultural background question. */
  | "african-caribbean"
  | "other"
  | "none"
  | "prefer-not-to-say";
export type HousingType =
  | "owned"
  | "private-rental"
  | "council"
  | "supported"
  | "unsure";
export type BurialPlace = "uk" | "abroad" | "both" | "unsure";
export type YesNoUnsure = "yes" | "no" | "unsure";
export type DeceasedLocation = "hospital" | "hospice" | "care-home" | "home" | "funeral-director";

export interface IntakeFormData {
  // About the deceased
  deceasedFirstName: string;
  deceasedLastName: string;
  dateOfDeath: string;
  locationOfDeath: string;
  currentLocation: DeceasedLocation;

  // About the user
  relationship: string;
  postcode: string;
  email: string;
  phone: string;

  // Funeral preferences
  funeralPreference: FuneralPreference;

  // Faith — religious/philosophical belief is "special category" data under
  // UK GDPR, so it is only kept with explicit consent (faithConsent)
  faith: FaithOption;
  /** All faiths/traditions chosen (people often identify with more than one). */
  faiths?: FaithOption[];
  /** Consent covers faith and cultural background (both special category data). */
  faithConsent?: boolean;
  /** Cultural backgrounds (ids from lib/cultures.ts). Only kept with consent. */
  backgrounds?: string[];
  /** Anything about their background we have not listed, in their own words. */
  backgroundOther?: string;
  /** Where they will be buried or cremated, which decides the repatriation steps. */
  burialPlace?: BurialPlace;

  // Housing
  housingType: HousingType;

  // Benefits / financial
  receivingBenefits: YesNoUnsure;
  needsFinancialHelp: YesNoUnsure;
}

export interface ActionPlanTask {
  id: string;
  title: string;
  description: string;
  category: "immediate" | "legal" | "financial" | "government" | "housing" | "personal";
  priority: "urgent" | "this-week" | "this-month" | "future";
  status: "pending" | "in-progress" | "completed";
  assignedTo?: string;
  dueDate?: string;
  link?: string;
  phone?: string;
}

export interface LocalResource {
  id: string;
  type: "registry-office" | "council" | "cemetery" | "crematorium" | "funeral-director" | "faith-organisation";
  name: string;
  address: string;
  phone?: string;
  website?: string;
  email?: string;
  lat?: number;
  lng?: number;
  distance?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: string[];
}

export interface GuidanceArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  readTime: number;
  category: string;
}
