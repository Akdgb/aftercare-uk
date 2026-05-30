export type FuneralPreference = "burial" | "cremation" | "unsure";
export type FaithOption =
  | "christian"
  | "muslim"
  | "hindu"
  | "sikh"
  | "jewish"
  | "humanist"
  | "african-caribbean"
  | "other"
  | "none";
export type HousingType =
  | "owned"
  | "private-rental"
  | "council"
  | "supported"
  | "unsure";
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

  // Faith
  faith: FaithOption;

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
