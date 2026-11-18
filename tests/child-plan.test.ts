import { describe, expect, it } from "vitest";
import { generateActionPlan } from "@/lib/action-plan";
import type { IntakeFormData } from "@/types";

const base: IntakeFormData = {
  deceasedFirstName: "Sam",
  deceasedLastName: "",
  dateOfDeath: "2026-11-01",
  locationOfDeath: "",
  currentLocation: "hospital",
  relationship: "Mother",
  postcode: "",
  email: "",
  phone: "",
  funeralPreference: "unsure",
  faith: "prefer-not-to-say",
  faithConsent: false,
  housingType: "owned",
  receivingBenefits: "unsure",
  needsFinancialHelp: "unsure",
};
const ADULT_ONLY = ["apply-probate", "locate-will", "value-estate", "notify-pensions", "notify-mortgage", "notify-banks", "funeral-expenses-payment"];

describe("plans when a child or baby has died", () => {
  it("a child's plan has no adult estate, housing or pension steps", () => {
    const ids = generateActionPlan({ ...base, ageGroup: "child" }).map((t) => t.id);
    for (const id of ADULT_ONLY) expect(ids).not.toContain(id);
    expect(ids).toEqual(expect.arrayContaining(["child-funeral-fund", "child-bereavement-leave", "child-school", "child-benefit", "child-register-death"]));
  });

  it("a baby's plan registers the baby and talks to the bereavement midwife", () => {
    const ids = generateActionPlan({ ...base, ageGroup: "baby" }).map((t) => t.id);
    expect(ids).toEqual(expect.arrayContaining(["child-register-baby", "child-bereavement-midwife", "child-funeral-fund"]));
    expect(ids).not.toContain("child-school");
    expect(ids).not.toContain("apply-probate");
  });

  it("plans saved before the question existed stay adult plans", () => {
    const ids = generateActionPlan(base).map((t) => t.id);
    expect(ids).toContain("apply-probate");
    expect(ids).not.toContain("child-funeral-fund");
  });

  it("task ids are unique", () => {
    for (const ageGroup of ["baby", "child", "adult"] as const) {
      const ids = generateActionPlan({ ...base, ageGroup, faiths: ["muslim"], faith: "muslim", faithConsent: true }).map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});
