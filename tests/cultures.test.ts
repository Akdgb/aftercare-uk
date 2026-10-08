import { describe, expect, it } from "vitest";
import { generateActionPlan } from "@/lib/action-plan";
import { REGIONS, getBackgrounds } from "@/lib/cultures";
import { intakeSchema } from "@/lib/intake-schema";
import type { IntakeFormData } from "@/types";

const base: IntakeFormData = {
  deceasedFirstName: "Kwame",
  deceasedLastName: "Mensah",
  dateOfDeath: "2026-09-30",
  locationOfDeath: "",
  currentLocation: "hospital",
  relationship: "Son / Daughter",
  postcode: "",
  email: "",
  phone: "",
  funeralPreference: "unsure",
  faith: "prefer-not-to-say",
  housingType: "owned",
  receivingBenefits: "unsure",
  needsFinancialHelp: "unsure",
};
const ids = (d: Partial<IntakeFormData>) => generateActionPlan({ ...base, ...d }).map((t) => t.id);

describe("cultural backgrounds", () => {
  it("has unique background ids", () => {
    const all = REGIONS.flatMap((r) => r.backgrounds.map((b) => b.id));
    expect(new Set(all).size).toBe(all.length);
  });

  it("ignores backgrounds without consent", () => {
    expect(getBackgrounds({ backgrounds: ["jamaican"], faithConsent: false })).toEqual([]);
    expect(ids({ backgrounds: ["jamaican"] })).not.toContain("plan-nine-night");
  });

  it("gives Ghanaian and Jamaican families different customs", () => {
    const ghana = ids({ backgrounds: ["ghanaian-akan"], faithConsent: true });
    const jamaica = ids({ backgrounds: ["jamaican"], faithConsent: true });
    expect(ghana).toContain("plan-one-week-gathering");
    expect(ghana).toContain("call-family-meeting");
    expect(ghana).not.toContain("plan-nine-night");
    expect(jamaica).toContain("plan-nine-night");
    expect(jamaica).toContain("check-cemetery-rules");
    expect(jamaica).not.toContain("plan-one-week-gathering");
  });

  it("adds repatriation steps when burial is abroad, even without other answers", () => {
    const abroad = ids({ burialPlace: "abroad" });
    expect(abroad).toEqual(expect.arrayContaining(["start-repatriation", "notify-coroner-repatriation", "check-repatriation-documents"]));
    expect(ids({ burialPlace: "uk" })).not.toContain("start-repatriation");
  });

  it("asks families to agree the burial place until it is decided", () => {
    expect(ids({ backgrounds: ["nigerian-igbo"], faithConsent: true })).toContain("decide-burial-place");
    expect(ids({ backgrounds: ["nigerian-igbo"], faithConsent: true, burialPlace: "abroad" })).not.toContain("decide-burial-place");
  });

  it("lets faith drive urgent timing", () => {
    const plan = ids({ faith: "muslim", faiths: ["muslim"], backgrounds: ["nigerian-yoruba"], faithConsent: true });
    expect(plan).toContain("request-urgent-release");
    expect(plan).toContain("contact-mosque");
    expect(ids({ backgrounds: ["nigerian-yoruba"], faithConsent: true })).not.toContain("request-urgent-release");
  });

  it("strips faith and backgrounds on save without consent, and rejects unknown ids", () => {
    const stripped = intakeSchema.parse({ ...base, backgrounds: ["somali"], backgroundOther: "x", faithConsent: false });
    expect(stripped.backgrounds).toEqual([]);
    expect(stripped.backgroundOther).toBeUndefined();
    const kept = intakeSchema.parse({ ...base, backgrounds: ["somali"], faithConsent: true, burialPlace: "both" });
    expect(kept.backgrounds).toEqual(["somali"]);
    expect(kept.burialPlace).toBe("both");
    expect(intakeSchema.safeParse({ ...base, backgrounds: ["made-up"], faithConsent: true }).success).toBe(false);
  });

  it("never produces duplicate task ids", () => {
    const every = REGIONS.flatMap((r) => r.backgrounds.map((b) => b.id));
    const plan = ids({ backgrounds: every, faiths: ["muslim", "jewish", "hindu", "christian-orthodox"], faith: "muslim", faithConsent: true, burialPlace: "both" });
    expect(new Set(plan).size).toBe(plan.length);
  });
});
