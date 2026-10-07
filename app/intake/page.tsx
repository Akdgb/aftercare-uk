"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { FAITHS, HOMES, LOCATIONS, MONEY, RELATIONSHIPS, type Choice } from "@/lib/intake-options";
import { cn } from "@/lib/utils";
import { LOCAL_KEYS, writeLocal } from "@/lib/use-local-storage";
import type { FaithOption, IntakeFormData } from "@/types";

// Only questions that change the plan. Every screen after the first is a
// single tap that moves on by itself.
const initialData: IntakeFormData = {
  deceasedFirstName: "",
  deceasedLastName: "",
  dateOfDeath: "",
  locationOfDeath: "",
  currentLocation: "hospital",
  relationship: "",
  postcode: "",
  email: "",
  phone: "",
  funeralPreference: "unsure",
  faith: "prefer-not-to-say",
  faithConsent: false,
  housingType: "unsure",
  receivingBenefits: "unsure",
  needsFinancialHelp: "unsure",
};

const TOTAL = 6;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function IntakePage() {
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = useState(false);
  // Step 0 is the optional "keep your plan safe" email screen
  const [step, setStep] = useState(0);
  const [data, setData] = useState<IntakeFormData>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Only show a tick on answers the person actually chose (fields have defaults)
  const [answered, setAnswered] = useState<Set<keyof IntakeFormData>>(new Set());
  const picked = (key: keyof IntakeFormData) => (answered.has(key) ? String(data[key]) : "");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d?.email) return;
        setIsSignedIn(true);
        // Already signed in: no need to ask for an email
        setStep((s) => (s === 0 ? 1 : s));
      })
      .catch(() => {});
  }, []);

  const go = (next: number) => {
    setError(null);
    setStep(next);
    window.scrollTo({ top: 0 });
  };

  const finish = async (final: IntakeFormData) => {
    setSubmitting(true);
    // A new set of answers starts a fresh plan on this device
    writeLocal(LOCAL_KEYS.intake, JSON.stringify(final));
    writeLocal(LOCAL_KEYS.statuses, null);
    writeLocal(LOCAL_KEYS.linkSentTo, null);
    if (!isSignedIn && EMAIL_RE.test(final.email.trim())) {
      // Email a sign-in link; clicking it saves this plan to their account
      const email = final.email.trim();
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, next: "/dashboard" }),
      }).catch(() => null);
      if (res?.ok) {
        writeLocal(LOCAL_KEYS.pendingSave, "1");
        writeLocal(LOCAL_KEYS.linkSentTo, email);
      }
    }
    if (isSignedIn) {
      try {
        const res = await fetch("/api/save-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ intakeData: final, taskStatuses: {} }),
        });
        if (res.ok) {
          const { planId } = await res.json();
          writeLocal(LOCAL_KEYS.intake, null);
          router.push(`/plan/${planId}`);
          return;
        }
      } catch {}
    }
    router.push("/plan");
  };

  // Tap an answer → save it and move on
  const choose = <K extends keyof IntakeFormData>(key: K, value: IntakeFormData[K]) => {
    setData({ ...data, [key]: value });
    setAnswered((prev) => new Set(prev).add(key));
    if (step < TOTAL) go(step + 1);
  };

  const selectedFaiths = data.faiths ?? [];

  const toggleFaith = (value: FaithOption) => {
    const faiths = selectedFaiths.includes(value)
      ? selectedFaiths.filter((f) => f !== value)
      : [...selectedFaiths, value];
    setData({ ...data, faiths, faith: faiths[0] ?? "prefer-not-to-say", faithConsent: false });
    setError(null);
  };

  // "No religious needs" / "Skip" end the questions straight away
  const finishWithoutFaith = (value: FaithOption) =>
    finish({ ...data, faith: value, faiths: [], faithConsent: false });

  const submitEmail = () => {
    const email = data.email.trim();
    if (email && !EMAIL_RE.test(email)) return setError("That email address doesn't look right.");
    go(1);
  };

  const submitNames = () => {
    if (!data.deceasedFirstName.trim()) return setError("Please enter their first name.");
    if (!data.dateOfDeath) return setError("Please enter the date they died.");
    if (data.dateOfDeath > new Date().toISOString().slice(0, 10)) return setError("That date is in the future.");
    go(2);
  };

  if (submitting) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-ink-600">
        <Loader2 className="h-7 w-7 animate-spin" />
        <p>Building your plan…</p>
      </div>
    );
  }

  const first = data.deceasedFirstName.trim() || "them";

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-10 sm:pt-12 min-h-[80vh] flex flex-col">
      {/* Progress + back */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => (step > 1 || (step === 1 && !isSignedIn) ? go(step - 1) : router.push("/"))}
          className="p-2 -ml-2 rounded-full text-ink-600 hover:bg-stone-100"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.max(step, 0)} aria-valuemin={1} aria-valuemax={TOTAL}>
          <div className="h-full bg-ink-700 rounded-full transition-all duration-500" style={{ width: `${(Math.max(step, 0.3) / TOTAL) * 100}%` }} />
        </div>
        <span className="text-sm text-ink-500 tabular-nums">
          {step === 0 ? "Optional" : `${step}/${TOTAL}`}
        </span>
      </div>

      <div key={step} className="animate-fade-up flex-1">
        {step === 0 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitEmail();
            }}
          >
            <Title>Keep your plan safe</Title>
            <p className="text-ink-500 mb-6">Optional — add your email and we&apos;ll save the plan to an account for you.</p>
            <ul className="space-y-3 mb-6">
              {[
                ["Gentle reminders", "A short email if a task with a deadline is still open. Turn it off any time."],
                ["Open it anywhere", "Your phone, a laptop, a relative's computer — your progress follows you."],
                ["Share the load", "Invite family so everyone can see and tick off tasks."],
              ].map(([title, body]) => (
                <li key={title} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <span>
                    <span className="block font-medium text-ink-900">{title}</span>
                    <span className="block text-sm text-ink-600">{body}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Field label="Your email">
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                placeholder="you@example.com"
                className={inputClass}
              />
            </Field>
            <p className="text-xs text-ink-500 mt-2">No password. We&apos;ll email you a link to save your plan. We never share your email.</p>
            {error && <p className="text-sm text-rose-700 mt-3">{error}</p>}
            <button type="submit" className={primaryClass + " mt-6"} disabled={!data.email.trim()}>
              Continue <ArrowRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setData({ ...data, email: "" });
                go(1);
              }}
              className="w-full mt-3 py-3 text-ink-600 font-medium hover:text-ink-900"
            >
              Skip for now
            </button>
          </form>
        )}

        {step === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitNames();
            }}
          >
            <Title>Who is this plan for?</Title>
            <p className="text-ink-500 mb-6">We&apos;re so sorry for your loss. Tell us their name and when they died.</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name">
                <input
                  autoFocus
                  value={data.deceasedFirstName}
                  onChange={(e) => setData({ ...data, deceasedFirstName: e.target.value })}
                  className={inputClass}
                  autoComplete="off"
                />
              </Field>
              <Field label="Last name">
                <input
                  value={data.deceasedLastName}
                  onChange={(e) => setData({ ...data, deceasedLastName: e.target.value })}
                  className={inputClass}
                  autoComplete="off"
                />
              </Field>
            </div>
            <Field label="Date they died" className="mt-4">
              <input
                type="date"
                value={data.dateOfDeath}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setData({ ...data, dateOfDeath: e.target.value })}
                className={inputClass}
              />
            </Field>
            {error && <p className="text-sm text-rose-700 mt-3">{error}</p>}
            <button type="submit" className={primaryClass + " mt-8"}>
              Continue <ArrowRight className="h-5 w-5" />
            </button>
          </form>
        )}

        {step === 2 && (
          <Question title={`Where is ${first} now?`} options={LOCATIONS} selected={picked("currentLocation")} onPick={(v) => choose("currentLocation", v)} />
        )}

        {step === 3 && (
          <Question title={`How were you related to ${first}?`} options={RELATIONSHIPS} selected={picked("relationship")} onPick={(v) => choose("relationship", v)} />
        )}

        {step === 4 && (
          <Question title={`Where did ${first} live?`} options={HOMES} selected={picked("housingType")} onPick={(v) => choose("housingType", v)} />
        )}

        {step === 5 && (
          <Question
            title="Will you need help paying for the funeral?"
            options={MONEY}
            selected={picked("needsFinancialHelp")}
            onPick={(v) => choose("needsFinancialHelp", v)}
          />
        )}

        {step === 6 && (
          <div>
            <Title>Any faith or cultural traditions?</Title>
            <p className="text-ink-500 mb-6">Choose all that apply — we&apos;ll add the steps each one needs. Optional.</p>
            <div className="grid grid-cols-2 gap-2.5">
              {FAITHS.filter((f) => f.value !== "prefer-not-to-say" && f.value !== "none").map((f) => {
                const on = selectedFaiths.includes(f.value);
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => toggleFaith(f.value)}
                    aria-pressed={on}
                    className={cn(
                      "text-left px-4 py-3.5 rounded-2xl border-2 transition-all active:scale-[0.99] flex items-center justify-between gap-2",
                      on ? "border-ink-700 bg-ink-50" : "border-stone-200 bg-white hover:border-ink-300"
                    )}
                  >
                    <span className="font-medium text-ink-900 leading-snug">{f.label}</span>
                    <span
                      className={cn(
                        "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0",
                        on ? "bg-ink-700 border-ink-700" : "border-stone-300"
                      )}
                    >
                      {on && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedFaiths.length > 0 ? (
              <div className="mt-5 animate-fade-up">
                <label className="flex items-start gap-3 bg-white border border-stone-200 rounded-2xl p-4 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-5 w-5 flex-shrink-0"
                    checked={data.faithConsent ?? false}
                    onChange={(e) => setData({ ...data, faithConsent: e.target.checked })}
                  />
                  <span className="text-sm text-ink-700 leading-relaxed">
                    I agree to AfterCare using this to tailor the plan. It&apos;s only seen by me and family I invite,
                    and I can remove it at any time.{" "}
                    <a href="/privacy#special-category" target="_blank" className="underline">
                      Why we ask
                    </a>
                  </span>
                </label>
                {error && <p className="text-sm text-rose-700 mt-3">{error}</p>}
                <button
                  onClick={() =>
                    data.faithConsent ? finish(data) : setError('Please tick the box, or choose "Skip this question".')
                  }
                  className={primaryClass + " mt-4"}
                >
                  Show my plan <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 mt-5">
                <button
                  onClick={() => finishWithoutFaith("none")}
                  className="px-4 py-3.5 rounded-2xl border-2 border-stone-200 bg-white font-medium text-ink-900 hover:border-ink-300"
                >
                  No religious needs
                </button>
                <button
                  onClick={() => finishWithoutFaith("prefer-not-to-say")}
                  className="px-4 py-3.5 rounded-2xl border-2 border-stone-200 bg-white font-medium text-ink-900 hover:border-ink-300"
                >
                  Skip this question
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-center text-xs text-ink-400 mt-10">Private — nothing is shared unless you choose to.</p>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-stone-300 bg-white px-4 py-3.5 text-base text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-transparent";
const primaryClass =
  "w-full flex items-center justify-center gap-2 bg-ink-700 text-white text-lg font-medium py-4 rounded-2xl shadow-sm hover:bg-ink-800 active:scale-[0.99] transition-all";

function Title({ children }: { children: React.ReactNode }) {
  return <h1 className="text-3xl sm:text-4xl font-semibold text-ink-900 leading-tight mb-2">{children}</h1>;
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="block text-sm font-medium text-ink-700 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function Question<T extends string>({
  title,
  subtitle,
  options,
  selected,
  onPick,
  columns = false,
}: {
  title: string;
  subtitle?: string;
  options: Choice<T>[];
  selected: string;
  onPick: (value: T) => void;
  columns?: boolean;
}) {
  return (
    <div>
      <Title>{title}</Title>
      {subtitle ? <p className="text-ink-500 mb-6">{subtitle}</p> : <div className="mb-6" />}
      <div className={cn("gap-2.5", columns ? "grid grid-cols-1 sm:grid-cols-2" : "flex flex-col")}>
        {options.map((o) => {
          const on = selected === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onPick(o.value)}
              aria-pressed={on}
              className={cn(
                "w-full text-left px-5 py-4 rounded-2xl border-2 transition-all active:scale-[0.99] flex items-center justify-between gap-3",
                on ? "border-ink-700 bg-ink-50" : "border-stone-200 bg-white hover:border-ink-300"
              )}
            >
              <span>
                <span className="block text-base font-medium text-ink-900">{o.label}</span>
                {o.hint && <span className="block text-sm text-ink-500 mt-0.5">{o.hint}</span>}
              </span>
              {on ? (
                <Check className="h-5 w-5 text-ink-700 shrink-0" />
              ) : (
                <ArrowRight className="h-4 w-4 text-ink-300 shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
