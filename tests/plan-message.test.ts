import { describe, expect, it } from "vitest";
import { planMessage } from "@/components/plan/plan-document";
import type { IntakeFormData } from "@/types";

const intake = {
  deceasedFirstName: "Grace", deceasedLastName: "Mensah", dateOfDeath: "2026-11-01", locationOfDeath: "", currentLocation: "hospital",
  relationship: "Son / Daughter", postcode: "", email: "", phone: "", funeralPreference: "unsure", faith: "prefer-not-to-say",
  housingType: "owned", receivingBenefits: "unsure", needsFinancialHelp: "unsure",
} as IntakeFormData;

describe("share as a message", () => {
  it("is short, numbered and links to the saved plan", () => {
    const text = planMessage(intake, {}, "https://aftercareuk.co.uk/plan/abc", true);
    expect(text.split("\n").filter((l) => /^\d\./.test(l))).toHaveLength(3);
    expect(text).not.toContain("☐");
    expect(text).toContain("See the full plan: https://aftercareuk.co.uk/plan/abc");
  });
  it("invites others to AfterCare when the plan is only on this device", () => {
    expect(planMessage(intake, {}, "https://aftercareuk.co.uk")).toContain("Made with AfterCare");
  });
});
