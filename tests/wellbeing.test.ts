import { describe, expect, it } from "vitest";
import { addCheckIn, calendarFile, daysUntil, hasHardFortnight, nextOccurrence, parseList, type CheckIn } from "@/lib/wellbeing";

describe("wellbeing helpers", () => {
  it("keeps one check-in per day, replacing today's", () => {
    const first = addCheckIn([], { date: "2026-11-06", mood: 2, feelings: [] });
    const again = addCheckIn(first, { date: "2026-11-06", mood: 4, feelings: ["sleep"] });
    expect(again).toEqual([{ date: "2026-11-06", mood: 4, feelings: ["sleep"] }]);
  });

  it("flags a hard fortnight only with 4 or more low days in the last 14", () => {
    const low = (d: string): CheckIn => ({ date: d, mood: 2, feelings: [] });
    const three = [low("2026-11-01"), low("2026-11-03"), low("2026-11-05")];
    expect(hasHardFortnight(three, "2026-11-06")).toBe(false);
    expect(hasHardFortnight([...three, low("2026-11-06")], "2026-11-06")).toBe(true);
    // Older than 14 days does not count
    expect(hasHardFortnight([...three, low("2026-10-01")], "2026-11-06")).toBe(false);
  });

  it("finds the next yearly occurrence of a remembered date", () => {
    expect(nextOccurrence("1958-12-25", "2026-11-06")).toBe("2026-12-25");
    expect(nextOccurrence("2026-03-02", "2026-11-06")).toBe("2027-03-02");
    expect(nextOccurrence("2020-11-06", "2026-11-06")).toBe("2026-11-06");
    expect(daysUntil("2026-12-25", "2026-11-06")).toBe(49);
  });

  it("builds a yearly all-day calendar event without breaking on odd labels", () => {
    const ics = calendarFile("Dad's birthday; party,\nnew line", "2026-12-25");
    expect(ics).toContain("DTSTART;VALUE=DATE:20261225");
    expect(ics).toContain("RRULE:FREQ=YEARLY");
    expect(ics).not.toMatch(/SUMMARY:.*[;,\n]party/);
  });

  it("treats corrupt stored data as empty", () => {
    expect(parseList("not json")).toEqual([]);
    expect(parseList('{"a":1}')).toEqual([]);
  });
});
