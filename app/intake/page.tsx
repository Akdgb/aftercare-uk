"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { FAITH_CHOICES, HOMES, LOCATIONS, MONEY, RELATIONSHIPS, type Choice } from "@/lib/intake-options";
import { BURIAL_PLACES } from "@/lib/cultures";
import { BackgroundPicker } from "@/components/plan/background-picker";
import { AgeQuestion, ALLOWED_AGE_BANDS, useAgeBand } from "@/components/auth/age-question";
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

const TOTAL = 7;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Draft = { step: number; data: IntakeFormData; answered: (keyof IntakeFormData)[] };

function readDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEYS.intakeDraft);
    const d = raw ? (JSON.parse(raw) as Draft) : null;
    return d && typeof d.step === "number" && d.data ? { ...d, data: { ...initialData, ...d.data } } : null;
  } catch {
    return null;
  }
}

const noopSubscribe = () => () => {};

export default function IntakePage() {
  // Answers in progress are kept on the device, so following a link and coming
  // back returns the person to the same question. Rendered on the client only.
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);
  if (!isClient) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-ink-400" />
      </div>
    );
  }
  return <Intake draft={readDraft()} />;
}

function Intake({ draft }: { draft: Draft | null }) {
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = useState(false);
  // Step 0 is the optional "keep your plan safe" email screen
  const [step, setStep] = useState(draft?.step ?? 0);
  const [data, setData] = useState<IntakeFormData>(draft?.data ?? initialData);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ageBand, setAgeBand] = useAgeBand();
  // Only show a tick on answers the person actually chose (fields have defaults)
  const [answered, setAnswered] = useState<Set<keyof IntakeFormData>>(new Set(draft?.answered ?? []));

  // Save progress after every change
  useEffect(() => {
    if (submitting) return;
    writeLocal(LOCAL_KEYS.intakeDraft, JSON.stringify({ step, data, answered: [...answered] }));
  }, [step, data, answered, submitting]);

  // The browser back button moves back one question instead of leaving
  useEffect(() => {
    window.history.replaceState({ ...window.history.state, intakeStep: step }, "");
    const onPop = (e: PopStateEvent) => {
      const s = e.state?.intakeStep;
      if (typeof s === "number") setStep(s);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // Only on mount: later steps are pushed by go()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
    if (next > step) window.history.pushState({ ...window.history.state, intakeStep: next, intakePushed: true }, "");
    else window.history.replaceState({ ...window.history.state, intakeStep: next }, "");
    window.scrollTo({ top: 0 });
  };

  const startOver = () => {
    writeLocal(LOCAL_KEYS.intakeDraft, null);
    setData(initialData);
    setAnswered(new Set());
    setError(null);
    setStep(isSignedIn ? 1 : 0);
  };

  const finish = async (final: IntakeFormData) => {
    setSubmitting(true);
    writeLocal(LOCAL_KEYS.intakeDraft, null);
    // A new set of answers starts a fresh plan on this device
    writeLocal(LOCAL_KEYS.intake, JSON.stringify(final));
    writeLocal(LOCAL_KEYS.statuses, null);
    writeLocal(LOCAL_KEYS.linkSentTo, null);
    if (!isSignedIn && EMAIL_RE.test(final.email.trim()) && ageBand && ALLOWED_AGE_BANDS.includes(ageBand)) {
      // Email a sign-in link; clicking it saves this plan to their account
      const email = final.email.trim();
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, next: "/dashboard", ageBand }),
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

  const needsConsent =
    selectedFaiths.length > 0 || (data.backgrounds?.length ?? 0) > 0 || Boolean(data.backgroundOther?.trim());

  const submitTraditions = () => {
    if (needsConsent && !data.faithConsent) {
      return setError("Please tick the box to agree, or remove your choices to continue without them.");
    }
    if (!needsConsent) return finish({ ...data, faiths: [], backgrounds: [], backgroundOther: undefined, faithConsent: false });
    finish(data);
  };

  const submitEmail = () => {
    const email = data.email.trim();
    if (email && !EMAIL_RE.test(email)) return setError("Enter an email address in the correct format, like name@example.com");
    if (email && !ageBand) return setError("Please tell us your age to continue.");
    if (email && !ALLOWED_AGE_BANDS.includes(ageBand as never)) {
      // Under 13: no account, so the email address is not kept
      setData({ ...data, email: "" });
      return go(1);
    }
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
        <p>Preparing your plan…</p>
      </div>
    );
  }

  const first = data.deceasedFirstName.trim() || "them";

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-10 sm:pt-12 min-h-[80vh] flex flex-col">
      {/* Progress + back */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => {
            if (!(step > 1 || (step === 1 && !isSignedIn))) return router.push("/");
            // Use real browser history where we added it, so both back buttons agree
            if (window.history.state?.intakePushed) window.history.back();
            else go(step - 1);
          }}
          className="p-2 -ml-2 rounded-full text-ink-600 hover:bg-stone-100"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden" role="progressbar" aria-label="Progress through the questions" aria-valuenow={Math.max(step, 0)} aria-valuemin={1} aria-valuemax={TOTAL}>
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
            <p className="text-ink-500 mb-6">This step is optional. Add your email address and we will save the plan to an account for you.</p>
            <ul className="space-y-3 mb-6">
              {[
                ["Gentle reminders", "A short email if a task with a deadline is still open. Turn it off any time."],
                ["Open it anywhere", "Use your phone, a laptop or a relative's computer. Your progress is the same everywhere."],
                ["Share the work", "Invite family so everyone can see and tick off tasks."],
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
            {data.email.trim() && (
              <div className="mt-4">
                <AgeQuestion value={ageBand} onChange={(v) => { setAgeBand(v); setError(null); }} />
              </div>
            )}
            <p className="text-xs text-ink-500 mt-2">There is no password. We will email you a link to save your plan. We never share your email address. See our{" "}
              <a href="/privacy" target="_blank" className="underline">privacy policy</a>.</p>
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
            <p className="text-ink-500 mb-6">We are sorry for your loss. Tell us their name and the date they died.</p>
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
            <Title>Any faith or beliefs?</Title>
            <p className="text-ink-500 mb-6">
              Choose all that apply. Faith often affects how quickly the funeral needs to happen. This question is optional.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {FAITH_CHOICES.map((f) => {
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
              <button onClick={() => go(7)} className={primaryClass + " mt-5"}>
                Continue <ArrowRight className="h-5 w-5" />
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 mt-5">
                <button
                  onClick={() => {
                    setData({ ...data, faith: "none", faiths: [] });
                    go(7);
                  }}
                  className="px-4 py-3.5 rounded-2xl border-2 border-stone-200 bg-white font-medium text-ink-900 hover:border-ink-300"
                >
                  No religious needs
                </button>
                <button
                  onClick={() => {
                    setData({ ...data, faith: "prefer-not-to-say", faiths: [] });
                    go(7);
                  }}
                  className="px-4 py-3.5 rounded-2xl border-2 border-stone-200 bg-white font-medium text-ink-900 hover:border-ink-300"
                >
                  Skip this question
                </button>
              </div>
            )}
          </div>
        )}

        {step === 7 && (
          <div>
            <Title>Cultural background</Title>
            <p className="text-ink-500 mb-6">
              Many families follow customs from their heritage, such as a nine night, a one-week gathering or burial in
              another country. Choose any that apply and we will add the steps they usually involve. This question is
              optional.
            </p>
            <BackgroundPicker
              value={data.backgrounds ?? []}
              onChange={(backgrounds) => {
                setData({ ...data, backgrounds, faithConsent: false });
                setError(null);
              }}
              other={data.backgroundOther ?? ""}
              onOtherChange={(backgroundOther) => setData({ ...data, backgroundOther, faithConsent: false })}
            />

            <fieldset className="mt-6">
              <legend className="font-semibold text-ink-900 mb-2">Where will {first} be buried or cremated?</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {BURIAL_PLACES.map((p) => {
                  const on = data.burialPlace === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setData({ ...data, burialPlace: on ? undefined : p.value })}
                      className={cn(
                        "text-left px-4 py-3 rounded-2xl border-2 text-sm font-medium transition-colors",
                        on ? "border-ink-700 bg-ink-50 text-ink-900" : "border-stone-200 bg-white text-ink-800 hover:border-ink-300"
                      )}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {needsConsent && (
              <label className="mt-5 flex items-start gap-3 bg-white border border-stone-200 rounded-2xl p-4 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 flex-shrink-0"
                  checked={data.faithConsent ?? false}
                  onChange={(e) => {
                    setData({ ...data, faithConsent: e.target.checked });
                    setError(null);
                  }}
                />
                <span className="text-sm text-ink-700 leading-relaxed">
                  I agree to AfterCare using my answers about faith and cultural background to tailor the plan. Only I
                  and family members I invite can see them, and I can remove them at any time.{" "}
                  <a href="/privacy#special-category" target="_blank" className="underline">
                    Why we ask
                  </a>
                </span>
              </label>
            )}
            {error && <p className="text-sm text-rose-700 mt-3">{error}</p>}
            <button onClick={submitTraditions} className={primaryClass + " mt-5"}>
              Show my plan <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-ink-500 mt-10">
        Your answers are saved on this device as you go. Nothing is shared unless you choose to.
        {step > 1 && (
          <>
            {" "}
            <button type="button" onClick={startOver} className="underline underline-offset-2 hover:text-ink-800">
              Start over
            </button>
          </>
        )}
      </p>
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
