import { describe, expect, it } from "vitest";
import { escapeHtml, normaliseEmail, safeNextPath } from "@/lib/security";
import { inviteEmail, planConfirmationEmail, reminderEmail } from "@/lib/email-templates";
import { intakeSchema } from "@/lib/intake-schema";

describe("safeNextPath", () => {
  it("allows same-site paths", () => {
    expect(safeNextPath("/plan/abc")).toBe("/plan/abc");
    expect(safeNextPath("/dashboard?tab=account")).toBe("/dashboard?tab=account");
  });

  it.each(["//evil.com", "/\\evil.com", "https://evil.com", "evil.com", "/ok\r\nSet-Cookie: x", "", null, undefined])(
    "rejects %j",
    (value) => {
      expect(safeNextPath(value as string)).toBe("/dashboard");
    }
  );
});

describe("normaliseEmail", () => {
  it("trims and lowercases valid addresses", () => {
    expect(normaliseEmail("  Jane.Doe@Example.co.uk ")).toBe("jane.doe@example.co.uk");
  });
  it("rejects invalid input", () => {
    expect(normaliseEmail("not-an-email")).toBeNull();
    expect(normaliseEmail(42)).toBeNull();
    expect(normaliseEmail(`${"a".repeat(250)}@x.com`)).toBeNull();
  });
});

describe("email templates", () => {
  const evil = `<img src=x onerror="alert(1)">`;

  it("escapes user-supplied text", () => {
    expect(escapeHtml(evil)).not.toContain("<img");
    for (const { html } of [
      planConfirmationEmail(evil, "https://app/plan/1", 2),
      reminderEmail(evil, "https://app/plan/1", [evil], 3, "https://app/unsubscribe?token=t"),
      inviteEmail(evil, evil, evil, "https://app/auth/signin"),
    ]) {
      expect(html).not.toContain("<img");
      expect(html).toContain("&lt;img");
    }
  });

  it("includes an unsubscribe link in reminders", () => {
    const { html, text } = reminderEmail("Jean", "https://app/plan/1", ["Register the death"], 3, "https://app/u?t=1");
    expect(html).toContain("https://app/u?t=1");
    expect(text).toContain("https://app/u?t=1");
  });
});

describe("intakeSchema", () => {
  const valid = {
    deceasedFirstName: "Jean",
    deceasedLastName: "Smith",
    dateOfDeath: "2026-09-30",
    locationOfDeath: "Home",
    currentLocation: "home",
    relationship: "Son / Daughter",
    postcode: "SE1 7EH",
    email: "",
    phone: "",
    funeralPreference: "cremation",
    faith: "none",
    housingType: "owned",
    receivingBenefits: "no",
    needsFinancialHelp: "no",
  };

  it("accepts a complete intake", () => {
    expect(intakeSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects unknown enum values and missing names", () => {
    expect(intakeSchema.safeParse({ ...valid, faith: "pastafarian" }).success).toBe(false);
    expect(intakeSchema.safeParse({ ...valid, deceasedFirstName: "  " }).success).toBe(false);
  });

  it("keeps a faith answer only with explicit consent", () => {
    const withConsent = intakeSchema.parse({ ...valid, faith: "muslim", faithConsent: true });
    expect(withConsent.faith).toBe("muslim");

    for (const faithConsent of [false, undefined]) {
      const parsed = intakeSchema.parse({ ...valid, faith: "muslim", faithConsent });
      expect(parsed.faith).toBe("prefer-not-to-say");
      expect(parsed.faithConsent).toBe(false);
    }
  });

  it("strips unexpected fields", () => {
    const parsed = intakeSchema.parse({ ...valid, isAdmin: true });
    expect(parsed).not.toHaveProperty("isAdmin");
  });
});
