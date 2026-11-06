// "Looking after you": support for the weeks and months after a death.
// Everything here is kept on the person's own device. Mood and feelings are
// health data, so nothing in this file is ever sent to our servers.

export type Mood = 1 | 2 | 3 | 4 | 5;
export type CheckIn = { date: string; mood: Mood; feelings: string[] };
export type HardDate = { id: string; label: string; date: string };
export type JournalEntry = { id: string; at: string; prompt: string; text: string };
export type SmallStep = { date: string; text: string; done: boolean };

export const WELLBEING_KEYS = {
  checkIns: "aftercare_wellbeing_checkins",
  dates: "aftercare_wellbeing_dates",
  journal: "aftercare_wellbeing_journal",
  step: "aftercare_wellbeing_step",
} as const;

export const MOODS: { value: Mood; label: string; colour: string }[] = [
  { value: 1, label: "Really struggling", colour: "bg-rose-400" },
  { value: 2, label: "Low", colour: "bg-amber-400" },
  { value: 3, label: "Getting through", colour: "bg-stone-400" },
  { value: 4, label: "Okay", colour: "bg-emerald-300" },
  { value: 5, label: "A good day", colour: "bg-emerald-500" },
];

/** What is hardest today. Each one points to something that may help. */
export const FEELINGS: { id: string; label: string; tip: string; href?: string; linkText?: string }[] = [
  {
    id: "sleep",
    label: "Sleep",
    tip: "Grief often disturbs sleep. Try to keep the same wake-up time, get outside in daylight and avoid screens late at night. If poor sleep goes on for weeks, talk to your GP.",
  },
  {
    id: "work",
    label: "Work or study",
    tip: "It is common to find concentrating hard for months. Ask your employer or college about a phased return, lighter duties or time off. Your GP can give you a fit note if you are not well enough to work.",
  },
  {
    id: "lonely",
    label: "Loneliness",
    tip: "Support often fades after the funeral, just when it is needed most. Talking to other people who have been bereaved can help. Sue Ryder runs a free online community that is open day and night.",
    href: "https://community.sueryder.org",
    linkText: "Sue Ryder online community",
  },
  {
    id: "guilt",
    label: "Guilt",
    tip: "Many people go over what they could have said or done differently. Guilt is a very common part of grief, even when there was nothing you could have changed. Writing it down, or saying it to someone you trust, can ease it.",
  },
  {
    id: "anger",
    label: "Anger",
    tip: "Anger at the situation, at others, or even at the person who died is a normal part of grief. Physical activity, such as a brisk walk, can help release it.",
  },
  {
    id: "numb",
    label: "Feeling numb",
    tip: "Feeling nothing, or feeling as if it has not really happened, is a common way the mind protects itself. It usually changes with time. Be patient with yourself.",
  },
  {
    id: "anxious",
    label: "Anxiety",
    tip: "A death can leave the world feeling unsafe. Slow breathing can calm your body in a minute or two. Try the breathing exercise below.",
  },
  {
    id: "money",
    label: "Money worries",
    tip: "Money worries make grief harder. You may be able to get bereavement benefits or help with funeral costs.",
    href: "/financial-support",
    linkText: "Check what you could claim",
  },
  {
    id: "family",
    label: "Family tension",
    tip: "Families grieve in different ways and at different speeds, and disagreements about the funeral or the estate are common. It can help to talk to someone outside the family first.",
  },
];

export const WRITING_PROMPTS = [
  "Write to them about your day.",
  "A memory of them that makes you smile.",
  "Something you wish you had said.",
  "What they would tell you to do today.",
  "Something you are finding hard right now.",
];

export const SMALL_STEPS = [
  "Go outside for ten minutes",
  "Eat a proper meal",
  "Message a friend",
  "Have a shower and get dressed",
  "Do one task from the plan",
  "Go to bed at a regular time",
];

export const GRIEF_CARDS: { title: string; body: string }[] = [
  {
    title: "There is no timetable",
    body: "Grief does not follow neat stages. Many people move back and forth between feeling the loss and getting on with daily life. Both are normal and both are needed.",
  },
  {
    title: "Why the months after can feel harder",
    body: "In the first weeks there is a lot to do and people around you. Later, the tasks stop, friends go back to their lives and the loss can feel more real. Many people find this the hardest time.",
  },
  {
    title: "Good days are allowed",
    body: "Laughing or enjoying something does not mean you have stopped caring. Small moments of relief help you carry the loss.",
  },
  {
    title: "Going back to work",
    body: "Tell your manager what would help, such as a phased return or flexible hours. If your child has died, you have the right to 2 weeks' parental bereavement leave, and pay if you qualify. For other relatives there is not yet a legal right to bereavement leave, so ask about compassionate leave. If grief is affecting your health, your GP can give you a fit note.",
  },
  {
    title: "When to get more help",
    body: "If, six months or more after the death, grief still stops you doing everyday things, or you feel hopeless, talk to your GP. Talking therapies are free on the NHS and can help.",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────

export const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function parseList<T>(raw: string | null | undefined): T[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? (v as T[]) : [];
  } catch {
    return [];
  }
}

/** Saves today's check-in, replacing any earlier one from today. Keeps a year. */
export function addCheckIn(list: CheckIn[], entry: CheckIn): CheckIn[] {
  return [...list.filter((c) => c.date !== entry.date), entry].sort((a, b) => a.date.localeCompare(b.date)).slice(-366);
}

/** True when at least 4 of the check-ins in the last 14 days were "Low" or "Really struggling". */
export function hasHardFortnight(list: CheckIn[], today = todayIso()): boolean {
  const since = new Date(Date.parse(today) - 13 * 86_400_000).toISOString().slice(0, 10);
  return list.filter((c) => c.date >= since && c.date <= today && c.mood <= 2).length >= 4;
}

/** The next time a remembered date comes round (birthdays and anniversaries repeat yearly). */
export function nextOccurrence(isoDate: string, today = todayIso()): string {
  const [, m, d] = isoDate.split("-");
  const year = Number(today.slice(0, 4));
  const thisYear = `${year}-${m}-${d}`;
  return thisYear >= today ? thisYear : `${year + 1}-${m}-${d}`;
}

export function daysUntil(isoDate: string, today = todayIso()): number {
  return Math.round((Date.parse(isoDate) - Date.parse(today)) / 86_400_000);
}

/** A yearly all-day calendar event, so a hard date can go in the person's own calendar. */
export function calendarFile(label: string, isoDate: string): string {
  const day = isoDate.replace(/-/g, "");
  const next = new Date(Date.parse(isoDate) + 86_400_000).toISOString().slice(0, 10).replace(/-/g, "");
  const safe = label.replace(/[\\;,\n]/g, " ").slice(0, 100);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AfterCare UK//Remembered dates//EN",
    "BEGIN:VEVENT",
    `UID:${day}-${Math.random().toString(36).slice(2)}@aftercare-uk`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART;VALUE=DATE:${day}`,
    `DTEND;VALUE=DATE:${next}`,
    "RRULE:FREQ=YEARLY",
    `SUMMARY:${safe}`,
    "DESCRIPTION:A day that may be hard. Be gentle with yourself.",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
