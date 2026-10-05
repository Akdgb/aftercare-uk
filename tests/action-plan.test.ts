import { describe, expect, it } from "vitest";
import { generateActionPlan, normaliseTaskKeys } from "@/lib/action-plan";
import type { IntakeFormData } from "@/types";
import { generateActionPlan as generateLegacyActionPlan } from "./fixtures/legacy-action-plan";

const base: IntakeFormData = {
  deceasedFirstName: "Jean",
  deceasedLastName: "Smith",
  dateOfDeath: "2026-09-30",
  locationOfDeath: "St Thomas' Hospital",
  currentLocation: "hospital",
  relationship: "Spouse / Partner",
  postcode: "SE1 7EH",
  email: "",
  phone: "",
  funeralPreference: "unsure",
  faith: "muslim",
  housingType: "council",
  receivingBenefits: "yes",
  needsFinancialHelp: "yes",
};

describe("generateActionPlan", () => {
  it("gives every task a unique, stable slug id", () => {
    const tasks = generateActionPlan(base);
    const ids = tasks.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z][a-z-]+$/);
    expect(generateActionPlan(base).map((t) => t.id)).toEqual(ids);
  });

  it("tailors tasks to the intake answers", () => {
    const ids = generateActionPlan(base).map((t) => t.id);
    expect(ids).toContain("collect-mccd");
    expect(ids).toContain("bereavement-support-payment");
    expect(ids).toContain("council-tenancy-succession");
    expect(ids).toContain("contact-mosque");

    const other = generateActionPlan({
      ...base,
      currentLocation: "funeral-director",
      relationship: "Son / Daughter",
      housingType: "owned",
      faith: "none",
      needsFinancialHelp: "no",
    }).map((t) => t.id);
    expect(other).not.toContain("collect-mccd");
    expect(other).not.toContain("contact-funeral-director");
    expect(other).not.toContain("bereavement-support-payment");
    expect(other).not.toContain("funeral-expenses-payment");
    expect(other).toContain("notify-land-registry");
  });

  it("does not leak the internal legacyId field", () => {
    for (const t of generateActionPlan(base)) expect(t).not.toHaveProperty("legacyId");
  });
});

describe("normaliseTaskKeys", () => {
  it("maps legacy sequential ids from older saved plans onto slugs", () => {
    // Pre-slug numbering for this intake: 1 = MCCD, 2 = funeral director, 3 = register death
    const out = normaliseTaskKeys(base, { "1": "completed", "3": "completed" });
    expect(out).toEqual({ "collect-mccd": "completed", "register-death": "completed" });
  });

  it("maps every legacy id to the same task as the pre-slug implementation, for all intake variants", () => {
    const variants: Partial<IntakeFormData>[] = [];
    for (const currentLocation of ["hospital", "hospice", "care-home", "home", "funeral-director"] as const)
      for (const housingType of ["owned", "private-rental", "council", "supported", "unsure"] as const)
        for (const faith of ["muslim", "jewish", "hindu", "sikh", "christian", "none"] as const)
          for (const needsFinancialHelp of ["yes", "no", "unsure"] as const)
            for (const relationship of ["Spouse / Partner", "Son / Daughter"])
              variants.push({ currentLocation, housingType, faith, needsFinancialHelp, relationship });

    for (const v of variants) {
      const intake = { ...base, ...v };
      const titleToSlug = new Map(generateActionPlan(intake).map((t) => [t.title, t.id]));
      for (const old of generateLegacyActionPlan(intake)) {
        expect(normaliseTaskKeys(intake, { [old.id]: "completed" })).toEqual({
          [titleToSlug.get(old.title)!]: "completed",
        });
      }
    }
  });

  it("prefers slug keys over legacy keys", () => {
    const out = normaliseTaskKeys(base, { "1": "completed", "collect-mccd": "pending" });
    expect(out["collect-mccd"]).toBe("pending");
  });

  it("drops keys for tasks that are not in the plan", () => {
    expect(normaliseTaskKeys(base, { "999": "completed", bogus: "completed" })).toEqual({});
    expect(normaliseTaskKeys(base, null)).toEqual({});
  });
});
