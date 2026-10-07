import type { DeceasedLocation, FaithOption, HousingType, YesNoUnsure } from "@/types";

// Answer options shared by the questions and the "Edit answers" page.
export type Choice<T extends string> = { value: T; label: string; hint?: string };

export const LOCATIONS: Choice<DeceasedLocation>[] = [
  { value: "hospital", label: "In hospital" },
  { value: "hospice", label: "In a hospice" },
  { value: "care-home", label: "In a care home" },
  { value: "home", label: "At home" },
  { value: "funeral-director", label: "Already with a funeral director" },
];

export const RELATIONSHIPS: Choice<string>[] = [
  { value: "Spouse / Partner", label: "Husband, wife or partner" },
  { value: "Son / Daughter", label: "Son or daughter" },
  { value: "Parent", label: "Parent" },
  { value: "Sibling", label: "Brother or sister" },
  { value: "Grandchild", label: "Grandchild" },
  { value: "Other relative", label: "Other relative" },
  { value: "Close friend", label: "Friend" },
];

export const HOMES: Choice<HousingType>[] = [
  { value: "owned", label: "They owned their home" },
  { value: "private-rental", label: "They rented privately" },
  { value: "council", label: "Council or housing association" },
  { value: "supported", label: "Care home or sheltered housing" },
  { value: "unsure", label: "Not sure" },
];

export const MONEY: Choice<YesNoUnsure>[] = [
  { value: "yes", label: "Yes, we'll need help", hint: "We'll add the government Funeral Expenses Payment" },
  { value: "unsure", label: "Not sure yet" },
  { value: "no", label: "No" },
];

export const FAITHS: Choice<FaithOption>[] = [
  { value: "prefer-not-to-say", label: "Skip this question" },
  { value: "none", label: "No religious needs" },
  { value: "christian", label: "Christian" },
  { value: "muslim", label: "Muslim" },
  { value: "jewish", label: "Jewish" },
  { value: "hindu", label: "Hindu" },
  { value: "sikh", label: "Sikh" },
  { value: "humanist", label: "Humanist" },
  { value: "african-caribbean", label: "African / Caribbean traditions" },
  { value: "other", label: "Other" },
];
