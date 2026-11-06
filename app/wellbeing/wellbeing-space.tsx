"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarHeart, Check, ChevronDown, ExternalLink, Feather, Footprints, Phone, Trash2, Wind, Eye } from "lucide-react";
import { LOCAL_KEYS, useLocalStorage } from "@/lib/use-local-storage";
import { getFaiths } from "@/lib/faith";
import {
  FEELINGS,
  GRIEF_CARDS,
  MOODS,
  SMALL_STEPS,
  WELLBEING_KEYS,
  WRITING_PROMPTS,
  addCheckIn,
  calendarFile,
  daysUntil,
  hasHardFortnight,
  nextOccurrence,
  parseList,
  todayIso,
  type CheckIn,
  type HardDate,
  type JournalEntry,
  type Mood,
  type SmallStep,
} from "@/lib/wellbeing";
import { cn, formatDate } from "@/lib/utils";
import { NHS_GRIEF_URL, NHS_TALKING_THERAPIES_URL } from "@/lib/support";
import { InstallPrompt } from "@/components/app/install-prompt";
import type { IntakeFormData } from "@/types";

type Exercise = "breathe" | "ground" | "write" | "step";

export function WellbeingSpace() {
  const [rawIntake] = useLocalStorage(LOCAL_KEYS.intake);
  const [rawCheckIns, setRawCheckIns] = useLocalStorage(WELLBEING_KEYS.checkIns);
  const checkIns = parseList<CheckIn>(rawCheckIns);
  const today = todayIso();
  const todays = checkIns.find((c) => c.date === today);

  let intake: IntakeFormData | null = null;
  try {
    intake = rawIntake ? (JSON.parse(rawIntake) as IntakeFormData) : null;
  } catch {
    intake = null;
  }
  const muslim = intake?.faithConsent ? getFaiths(intake).includes("muslim") : false;

  const [exercise, setExercise] = useState<Exercise | null>(null);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-12">
      <h1 className="text-3xl font-semibold text-ink-900">Looking after you</h1>
      <p className="text-ink-600 mt-2">{greeting(intake)}</p>

      <CheckInCard
        todays={todays}
        onSave={(entry) => setRawCheckIns(JSON.stringify(addCheckIn(checkIns, entry)))}
      />

      {checkIns.length > 0 && <WeekStrip checkIns={checkIns} today={today} />}

      <InstallPrompt className="mt-4" />

      {hasHardFortnight(checkIns, today) && (
        <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-ink-800">
          <p className="font-semibold">You have had a lot of hard days recently.</p>
          <p className="mt-1">
            You do not have to manage this on your own. Talking to someone can help, whether that is a friend, your GP,
            a bereavement charity or a free NHS talking therapy.
          </p>
        </div>
      )}

      {/* Something to do right now */}
      <h2 className="font-sans text-sm font-semibold text-ink-500 uppercase tracking-wide mt-8 mb-2">Try something now</h2>
      <div className="grid grid-cols-2 gap-3">
        {(
          [
            ["breathe", Wind, "Breathe", "One calm minute"],
            ["ground", Eye, "Ground yourself", "For anxious moments"],
            ["write", Feather, "Write to them", "Private, on this device"],
            ["step", Footprints, "One small step", "Something for today"],
          ] as const
        ).map(([id, Icon, title, desc]) => (
          <button
            key={id}
            type="button"
            onClick={() => setExercise(exercise === id ? null : id)}
            aria-expanded={exercise === id}
            className={cn(
              "text-left rounded-2xl border p-4 transition-colors",
              exercise === id ? "bg-ink-700 border-ink-700 text-white" : "bg-white border-stone-200 hover:border-ink-300"
            )}
          >
            <Icon className={cn("h-5 w-5", exercise === id ? "text-white" : "text-ink-600")} />
            <span className="block font-semibold mt-2">{title}</span>
            <span className={cn("block text-sm", exercise === id ? "text-ink-100" : "text-ink-500")}>{desc}</span>
          </button>
        ))}
      </div>
      {exercise && (
        <div className="mt-3 rounded-2xl bg-white border border-stone-200 p-5 animate-fade-up">
          {exercise === "breathe" && <Breathe />}
          {exercise === "ground" && <Ground />}
          {exercise === "write" && <Write />}
          {exercise === "step" && <SmallStepCard />}
        </div>
      )}

      {/* Understanding grief */}
      <h2 className="font-sans text-sm font-semibold text-ink-500 uppercase tracking-wide mt-8 mb-2">Understanding grief</h2>
      <div className="bg-white border border-stone-200 rounded-2xl divide-y divide-stone-100">
        {GRIEF_CARDS.map((c) => (
          <details key={c.title} className="group px-4 py-3.5">
            <summary className="flex items-center justify-between gap-3 cursor-pointer list-none font-medium text-ink-900">
              {c.title}
              <ChevronDown className="h-4 w-4 text-ink-400 transition-transform group-open:rotate-180 shrink-0" />
            </summary>
            <p className="text-sm text-ink-600 mt-2 leading-relaxed">{c.body}</p>
          </details>
        ))}
      </div>

      <HardDates />

      {/* Talk to someone */}
      <h2 className="font-sans text-sm font-semibold text-ink-500 uppercase tracking-wide mt-8 mb-2">Talk to someone</h2>
      <ul className="bg-white border border-stone-200 rounded-2xl divide-y divide-stone-100">
        <SupportRow
          name="NHS Talking Therapies"
          detail="Free NHS counselling. In England you can refer yourself online if you are registered with a GP. Elsewhere in the UK, ask your GP."
          href={NHS_TALKING_THERAPIES_URL}
        />
        <SupportRow name="Your GP" detail="They can talk to you about how you are coping and refer you for support." />
        <SupportRow name="NHS advice on grief" detail="What is normal, and when to get help" href={NHS_GRIEF_URL} />
        <li className="px-4 py-3">
          <Link href="/help/support" className="text-sm font-medium text-ink-800 underline underline-offset-4">
            {muslim ? "Free helplines, including support for Muslim women" : "Free national helplines"}
          </Link>
        </li>
      </ul>

      <ClearData />
    </div>
  );
}

function greeting(intake: IntakeFormData | null): string {
  const name = intake?.deceasedFirstName?.trim();
  if (!name || !intake?.dateOfDeath) {
    return "For the weeks and months after a death. Everything you add here stays on this device.";
  }
  const days = Math.floor((Date.parse(todayIso()) - Date.parse(intake.dateOfDeath)) / 86_400_000);
  if (days < 0) return "Everything you add here stays on this device.";
  const when =
    days < 14
      ? "only a few days"
      : days < 60
        ? `about ${Math.round(days / 7)} weeks`
        : days < 730
          ? `about ${Math.round(days / 30.4)} months`
          : `about ${Math.round(days / 365)} years`;
  return `It has been ${when} since ${name} died. However you are feeling is okay. Everything you add here stays on this device.`;
}

// ── Daily check-in ──────────────────────────────────────────────────────────

function CheckInCard({ todays, onSave }: { todays?: CheckIn; onSave: (c: CheckIn) => void }) {
  const [mood, setMood] = useState<Mood | null>(null);
  const [feelings, setFeelings] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);

  if (todays && !editing) return <CheckInResponse entry={todays} onChange={() => {
    setMood(todays.mood);
    setFeelings(todays.feelings);
    setEditing(true);
  }} />;

  return (
    <section className="mt-6 rounded-2xl bg-white border border-stone-200 p-5" aria-labelledby="checkin">
      <h2 id="checkin" className="font-sans text-lg font-semibold text-ink-900">How are you today?</h2>
      <div className="flex flex-col gap-2 mt-3" role="radiogroup" aria-label="How are you today?">
        {MOODS.map((m) => (
          <button
            key={m.value}
            type="button"
            role="radio"
            aria-checked={mood === m.value}
            onClick={() => setMood(m.value)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left font-medium transition-colors",
              mood === m.value ? "border-ink-700 bg-ink-50 text-ink-900" : "border-stone-200 text-ink-800 hover:border-ink-300"
            )}
          >
            <span className={cn("w-3.5 h-3.5 rounded-full shrink-0", m.colour)} aria-hidden="true" />
            {m.label}
          </button>
        ))}
      </div>
      {mood !== null && (
        <div className="mt-4 animate-fade-up">
          <p className="text-sm font-medium text-ink-700">What is hardest today? (optional)</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {FEELINGS.map((f) => {
              const on = feelings.includes(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFeelings(on ? feelings.filter((x) => x !== f.id) : [...feelings, f.id])}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium",
                    on ? "bg-ink-700 border-ink-700 text-white" : "bg-white border-stone-300 text-ink-800"
                  )}
                >
                  {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  {f.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => {
              onSave({ date: todayIso(), mood, feelings });
              setEditing(false);
            }}
            className="mt-4 w-full bg-ink-700 text-white font-medium py-3 rounded-xl hover:bg-ink-800"
          >
            Save
          </button>
        </div>
      )}
    </section>
  );
}

function CheckInResponse({ entry, onChange }: { entry: CheckIn; onChange: () => void }) {
  const mood = MOODS.find((m) => m.value === entry.mood)!;
  const tips = FEELINGS.filter((f) => entry.feelings.includes(f.id));
  return (
    <section className="mt-6 space-y-3" aria-live="polite">
      {entry.mood === 1 && <UrgentSupport />}
      <div className="rounded-2xl bg-white border border-stone-200 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-semibold text-ink-900">
            <span className={cn("w-3.5 h-3.5 rounded-full", mood.colour)} aria-hidden="true" />
            Today: {mood.label}
          </p>
          <button type="button" onClick={onChange} className="text-sm text-ink-600 underline underline-offset-4">
            Change
          </button>
        </div>
        <p className="text-sm text-ink-600 mt-2">{moodMessage(entry.mood)}</p>
        {tips.length > 0 && (
          <ul className="mt-4 space-y-3">
            {tips.map((t) => (
              <li key={t.id} className="text-sm text-ink-700 bg-stone-50 rounded-xl p-3">
                <span className="font-semibold text-ink-900">{t.label}. </span>
                {t.tip}
                {t.href && (
                  <>
                    {" "}
                    {t.href.startsWith("/") ? (
                      <Link href={t.href} className="font-medium underline underline-offset-4">{t.linkText}</Link>
                    ) : (
                      <a href={t.href} target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-4">
                        {t.linkText}
                      </a>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function moodMessage(mood: Mood): string {
  switch (mood) {
    case 1:
      return "Thank you for being honest. Please reach out to someone today. You do not have to cope with this alone.";
    case 2:
      return "Low days are part of grief. Try one small thing below, and be gentle with yourself.";
    case 3:
      return "Getting through the day is enough. One of the short exercises below might help.";
    case 4:
      return "It is good to have steadier days. They do not mean you have stopped missing them.";
    default:
      return "Good days are allowed. Enjoying something does not mean you have stopped caring.";
  }
}

function UrgentSupport() {
  return (
    <div className="rounded-2xl bg-rose-50 border border-rose-200 p-5 text-ink-900" role="status">
      <p className="font-semibold">If you are struggling to cope, please talk to someone now.</p>
      <div className="flex flex-wrap gap-2 mt-3">
        <a href="tel:111" className="inline-flex items-center gap-2 bg-ink-800 text-white font-medium px-4 py-2.5 rounded-xl">
          <Phone className="h-4 w-4" /> Call NHS 111
        </a>
        <a href="tel:999" className="inline-flex items-center gap-2 bg-white border border-stone-300 font-medium px-4 py-2.5 rounded-xl">
          <Phone className="h-4 w-4" /> 999 if you are in danger
        </a>
      </div>
      <p className="text-sm text-ink-700 mt-3">
        In England or Wales, choose option 2 for mental health. In Scotland, NHS 24 answers on 111. If you might act on
        thoughts of ending your life, call 999. You can also call Samaritans free on 116 123, day or night.
      </p>
    </div>
  );
}

function WeekStrip({ checkIns, today }: { checkIns: CheckIn[]; today: string }) {
  const days = Array.from({ length: 7 }, (_, i) => new Date(Date.parse(today) - (6 - i) * 86_400_000).toISOString().slice(0, 10));
  return (
    <div className="mt-4 rounded-2xl bg-white border border-stone-200 px-4 py-3">
      <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">Your last 7 days</p>
      <ol className="grid grid-cols-7 gap-1 mt-2">
        {days.map((d) => {
          const c = checkIns.find((x) => x.date === d);
          const m = c ? MOODS.find((x) => x.value === c.mood) : undefined;
          const label = new Date(d).toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" });
          return (
            <li key={d} className="flex flex-col items-center gap-1">
              <span
                className={cn("w-6 h-6 rounded-full", m ? m.colour : "bg-stone-100 border border-dashed border-stone-300")}
                title={m ? m.label : "No check-in"}
              />
              <span className="text-[11px] text-ink-500">{label}</span>
              <span className="sr-only">{m ? m.label : "No check-in"}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ── Exercises ───────────────────────────────────────────────────────────────

function Breathe() {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [round, setRound] = useState(0);
  const ROUNDS = 6;

  useEffect(() => {
    if (!running) return;
    // Breathe in for 4 seconds, out for 6: a slower out-breath calms the body
    const t = setTimeout(
      () => {
        if (phase === "in") setPhase("out");
        else if (round + 1 >= ROUNDS) setRunning(false);
        else {
          setRound(round + 1);
          setPhase("in");
        }
      },
      phase === "in" ? 4000 : 6000
    );
    return () => clearTimeout(t);
  }, [running, phase, round]);

  return (
    <div className="text-center">
      <p className="text-sm text-ink-600">Breathe in through your nose for 4, and out slowly for 6. About one minute.</p>
      <div className="h-48 flex items-center justify-center my-4">
        <div
          className={cn(
            "rounded-full bg-ink-100 flex items-center justify-center text-ink-800 font-medium motion-safe:transition-all",
            running && phase === "in" ? "w-40 h-40 motion-safe:duration-[4000ms]" : "w-20 h-20 motion-safe:duration-[6000ms]"
          )}
          aria-live="polite"
        >
          {running ? (phase === "in" ? "Breathe in" : "Breathe out") : round > 0 ? "Well done" : ""}
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          setRound(0);
          setPhase("in");
          setRunning(!running);
        }}
        className="bg-ink-700 text-white font-medium px-6 py-3 rounded-xl hover:bg-ink-800"
      >
        {running ? "Stop" : round > 0 ? "Again" : "Start"}
      </button>
    </div>
  );
}

const GROUND_STEPS = [
  "Name 5 things you can see.",
  "Notice 4 things you can feel, like your feet on the floor.",
  "Listen for 3 things you can hear.",
  "Find 2 things you can smell.",
  "Notice 1 thing you can taste.",
];

function Ground() {
  const [i, setI] = useState(0);
  const done = i >= GROUND_STEPS.length;
  return (
    <div className="text-center">
      <p className="text-sm text-ink-600">This brings your attention back to the present when your thoughts are racing.</p>
      <p className="text-xl font-semibold text-ink-900 my-6 min-h-14" aria-live="polite">
        {done ? "Take one slow breath. You are here, and you are okay right now." : GROUND_STEPS[i]}
      </p>
      <button
        type="button"
        onClick={() => setI(done ? 0 : i + 1)}
        className="bg-ink-700 text-white font-medium px-6 py-3 rounded-xl hover:bg-ink-800"
      >
        {done ? "Start again" : i === GROUND_STEPS.length - 1 ? "Finish" : "Next"}
      </button>
    </div>
  );
}

function Write() {
  const [raw, setRaw] = useLocalStorage(WELLBEING_KEYS.journal);
  const entries = parseList<JournalEntry>(raw);
  const [prompt, setPrompt] = useState(WRITING_PROMPTS[0]);
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <p className="text-sm text-ink-600">Only you can see this. It is saved on this device and never sent to us.</p>
      <div className="flex flex-wrap gap-2 mt-3">
        {WRITING_PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPrompt(p)}
            aria-pressed={prompt === p}
            className={cn(
              "px-3 py-1.5 rounded-full border text-sm",
              prompt === p ? "bg-ink-700 border-ink-700 text-white" : "bg-white border-stone-300 text-ink-800"
            )}
          >
            {p}
          </button>
        ))}
      </div>
      <label className="block mt-4">
        <span className="block font-medium text-ink-900 mb-1.5">{prompt}</span>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setSaved(false);
          }}
          rows={6}
          maxLength={5000}
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-400"
        />
      </label>
      <button
        type="button"
        disabled={!text.trim()}
        onClick={() => {
          const entry: JournalEntry = { id: crypto.randomUUID(), at: new Date().toISOString(), prompt, text: text.trim() };
          setRaw(JSON.stringify([entry, ...entries].slice(0, 200)));
          setText("");
          setSaved(true);
        }}
        className="mt-3 bg-ink-700 text-white font-medium px-5 py-2.5 rounded-xl hover:bg-ink-800 disabled:opacity-50"
      >
        Save
      </button>
      {saved && <span className="ml-3 text-sm text-emerald-700" role="status">Saved on this device</span>}
      {entries.length > 0 && (
        <details className="mt-5">
          <summary className="cursor-pointer text-sm font-medium text-ink-700">Your writing ({entries.length})</summary>
          <ul className="mt-3 space-y-3">
            {entries.map((e) => (
              <li key={e.id} className="bg-stone-50 rounded-xl p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs text-ink-500">
                    {formatDate(e.at.slice(0, 10))} · {e.prompt}
                  </p>
                  <button
                    type="button"
                    onClick={() => setRaw(JSON.stringify(entries.filter((x) => x.id !== e.id)))}
                    aria-label="Delete this entry"
                    className="text-ink-400 hover:text-rose-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-ink-800 mt-1 whitespace-pre-wrap">{e.text}</p>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function SmallStepCard() {
  const [raw, setRaw] = useLocalStorage(WELLBEING_KEYS.step);
  let step: SmallStep | null = null;
  try {
    step = raw ? (JSON.parse(raw) as SmallStep) : null;
  } catch {
    step = null;
  }
  const today = todayIso();
  const current = step?.date === today ? step : null;
  const [custom, setCustom] = useState("");
  const choose = (text: string) => setRaw(JSON.stringify({ date: today, text, done: false } satisfies SmallStep));

  if (current) {
    return (
      <div className="text-center">
        <p className="text-sm text-ink-600">Your step for today</p>
        <p className="text-xl font-semibold text-ink-900 mt-2">{current.text}</p>
        {current.done ? (
          <p className="mt-4 text-emerald-700 font-medium" role="status">
            Done. That counts.
          </p>
        ) : (
          <button
            type="button"
            onClick={() => setRaw(JSON.stringify({ ...current, done: true }))}
            className="mt-4 inline-flex items-center gap-2 bg-ink-700 text-white font-medium px-6 py-3 rounded-xl hover:bg-ink-800"
          >
            <Check className="h-4 w-4" /> I did it
          </button>
        )}
        <button type="button" onClick={() => setRaw(null)} className="block mx-auto mt-3 text-sm text-ink-600 underline">
          Choose a different step
        </button>
      </div>
    );
  }
  return (
    <div>
      <p className="text-sm text-ink-600">
        When everything feels too much, one small action can help you feel a little more in control. Pick one for today.
      </p>
      <div className="flex flex-wrap gap-2 mt-3">
        {SMALL_STEPS.map((s) => (
          <button key={s} type="button" onClick={() => choose(s)} className="px-3 py-2 rounded-full border border-stone-300 bg-white text-sm text-ink-800 hover:border-ink-400">
            {s}
          </button>
        ))}
      </div>
      <form
        className="flex gap-2 mt-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (custom.trim()) choose(custom.trim().slice(0, 80));
        }}
      >
        <label className="sr-only" htmlFor="own-step">Or write your own</label>
        <input
          id="own-step"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Or write your own"
          maxLength={80}
          className="flex-1 rounded-xl border border-stone-300 bg-white px-3 py-2 text-base"
        />
        <button type="submit" className="bg-ink-700 text-white font-medium px-4 rounded-xl">Add</button>
      </form>
    </div>
  );
}

// ── Remembered dates ────────────────────────────────────────────────────────

function HardDates() {
  const [raw, setRaw] = useLocalStorage(WELLBEING_KEYS.dates);
  const dates = parseList<HardDate>(raw);
  const [label, setLabel] = useState("");
  const [date, setDate] = useState("");
  const today = todayIso();
  const upcoming = dates
    .map((d) => ({ ...d, next: nextOccurrence(d.date, today) }))
    .sort((a, b) => a.next.localeCompare(b.next));

  const download = (d: HardDate) => {
    const blob = new Blob([calendarFile(d.label, d.date)], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "remembered-date.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="mt-8" aria-labelledby="dates">
      <h2 id="dates" className="font-sans text-sm font-semibold text-ink-500 uppercase tracking-wide mb-2">Dates that may be hard</h2>
      <div className="bg-white border border-stone-200 rounded-2xl p-4">
        <p className="text-sm text-ink-600">
          Birthdays, anniversaries and festivals such as Eid or Christmas can bring grief back. Knowing they are coming
          helps you plan something small, or ask someone to be with you.
        </p>
        {upcoming.length > 0 && (
          <ul className="mt-3 divide-y divide-stone-100">
            {upcoming.map((d) => {
              const n = daysUntil(d.next, today);
              return (
                <li key={d.id} className="flex items-center gap-3 py-2.5">
                  <CalendarHeart className="h-5 w-5 text-ink-400 shrink-0" />
                  <span className="flex-1 min-w-0">
                    <span className="block font-medium text-ink-900">{d.label}</span>
                    <span className="block text-sm text-ink-500">
                      {formatDate(d.next)} · {n === 0 ? "today" : n === 1 ? "tomorrow" : `in ${n} days`}
                    </span>
                  </span>
                  <button type="button" onClick={() => download(d)} className="text-sm font-medium text-ink-700 underline underline-offset-4">
                    Add to calendar
                  </button>
                  <button
                    type="button"
                    onClick={() => setRaw(JSON.stringify(dates.filter((x) => x.id !== d.id)))}
                    aria-label={`Remove ${d.label}`}
                    className="text-ink-400 hover:text-rose-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <form
          className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 mt-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!label.trim() || !date) return;
            const entry: HardDate = { id: crypto.randomUUID(), label: label.trim().slice(0, 60), date };
            setRaw(JSON.stringify([...dates, entry].slice(0, 30)));
            setLabel("");
            setDate("");
          }}
        >
          <label className="sr-only" htmlFor="date-label">What is the date?</label>
          <input
            id="date-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="For example, Dad's birthday"
            maxLength={60}
            className="rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-base"
          />
          <label className="sr-only" htmlFor="date-value">Date</label>
          <input
            id="date-value"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-base"
          />
          <button type="submit" className="bg-ink-700 text-white font-medium px-4 py-2.5 rounded-xl" disabled={!label.trim() || !date}>
            Add
          </button>
        </form>
      </div>
    </section>
  );
}

function SupportRow({ name, detail, phone, href }: { name: string; detail: string; phone?: string; href?: string }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span className="flex-1 min-w-0">
        <span className="block font-medium text-ink-900">{name}</span>
        <span className="block text-sm text-ink-500">{detail}</span>
      </span>
      {phone && (
        <a href={`tel:${phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 text-sm font-semibold bg-ink-700 text-white px-3 py-2 rounded-lg whitespace-nowrap">
          <Phone className="h-4 w-4" /> {phone}
        </a>
      )}
      {href && (
        <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-ink-700 underline underline-offset-4">
          Visit <ExternalLink className="h-3.5 w-3.5" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      )}
    </li>
  );
}

function ClearData() {
  const [, setCheckIns] = useLocalStorage(WELLBEING_KEYS.checkIns);
  const [, setDates] = useLocalStorage(WELLBEING_KEYS.dates);
  const [, setJournal] = useLocalStorage(WELLBEING_KEYS.journal);
  const [, setStep] = useLocalStorage(WELLBEING_KEYS.step);
  return (
    <p className="text-xs text-ink-500 mt-8">
      Your check-ins, writing and dates are stored only on this device. We never receive them.{" "}
      <button
        type="button"
        className="underline"
        onClick={() => {
          if (!confirm("Delete your check-ins, writing and dates from this device?")) return;
          setCheckIns(null);
          setDates(null);
          setJournal(null);
          setStep(null);
        }}
      >
        Delete them
      </button>
    </p>
  );
}
