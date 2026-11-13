"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { FAITH_CHOICES, HOMES, LOCATIONS, MONEY, RELATIONSHIPS, type Choice } from "@/lib/intake-options";
import { BURIAL_PLACES } from "@/lib/cultures";
import { BackgroundPicker } from "@/components/plan/background-picker";
import { AgeQuestion, ALLOWED_AGE_BANDS, useAgeBand } from "@/components/auth/age-question";
import { cn } from "@/lib/utils";
import { LOCAL_KEYS, writeLocal } from "@/lib/use-local-storage";
import type { FaithOption, IntakeFormData } from "@/types";

// Only questions that change the plan. Most screens are a single tap that moves
// on by itself. Saving with an email is offered later, on the plan itself.
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

const TOTAL = 8;
// Faiths most often chosen in the UK are shown first; the rest sit behind "Show more"
const COMMON_FAITHS: FaithOption[] = ["christian", "christian-pentecostal", "muslim", "hindu", "sikh", "jewish"];
// A short pause so the person sees their answer ticked before the next question
const ADVANCE_DELAY_MS = 300;

type Errors = Partial<Record<"firstName" | "dateOfDeath" | "consent", string>>;

type Draft = { step: number; data: IntakeFormData; answered: (keyof IntakeFormData)[] };

function readDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEYS.intakeDraft);
    const d = raw ? (JSON.parse(raw) as Draft) : null;
    // Older drafts may start at step 0, the email screen that has since moved to the plan
    return d && typeof d.step === "number" && d.data
      ? { ...d, step: Math.min(Math.max(d.step, 1), TOTAL), data: { ...initialData, ...d.data } }
      : null;
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
  const [step, setStep] = useState(draft?.step ?? 1);
  const [data, setData] = useState<IntakeFormData>(draft?.data ?? initialData);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmingStartOver, setConfirmingStartOver] = useState(false);
  const [showAllFaiths, setShowAllFaiths] = useState(false);
  // After the last question: the finished answers, waiting on the optional email screen
  const [ready, setReady] = useState<IntakeFormData | null>(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [sendFailed, setSendFailed] = useState(false);
  const [sending, setSending] = useState(false);
  const [ageBand, setAgeBand] = useAgeBand();
  // Ignore extra taps while the tick is showing, so a double tap cannot skip a question
  const advancing = useRef(false);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
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
        if (d?.email) setIsSignedIn(true);
      })
      .catch(() => {});
  }, []);

  const go = (next: number) => {
    advancing.current = false;
    setErrors({});
    setStep(next);
    if (next > step) window.history.pushState({ ...window.history.state, intakeStep: next, intakePushed: true }, "");
    else window.history.replaceState({ ...window.history.state, intakeStep: next }, "");
    window.scrollTo({ top: 0 });
  };

  const startOver = () => {
    writeLocal(LOCAL_KEYS.intakeDraft, null);
    setData(initialData);
    setAnswered(new Set());
    setErrors({});
    setConfirmingStartOver(false);
    setStep(1);
    window.history.replaceState({ ...window.history.state, intakeStep: 1, intakePushed: false }, "");
    window.scrollTo({ top: 0 });
  };

  const finish = async (final: IntakeFormData) => {
    setSubmitting(true);
    writeLocal(LOCAL_KEYS.intakeDraft, null);
    // A new set of answers starts a fresh plan on this device
    writeLocal(LOCAL_KEYS.intake, JSON.stringify(final));
    writeLocal(LOCAL_KEYS.statuses, null);
    writeLocal(LOCAL_KEYS.linkSentTo, null);
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
    if (advancing.current) return;
    advancing.current = true;
    setData({ ...data, [key]: value });
    setAnswered((prev) => new Set(prev).add(key));
    const next = step + 1;
    setTimeout(() => go(Math.min(next, TOTAL)), ADVANCE_DELAY_MS);
  };

  const selectedFaiths = data.faiths ?? [];

  const toggleFaith = (value: FaithOption) => {
    const faiths = selectedFaiths.includes(value)
      ? selectedFaiths.filter((f) => f !== value)
      : [...selectedFaiths, value];
    setData({ ...data, faiths, faith: faiths[0] ?? "prefer-not-to-say", faithConsent: false });
  };

  const needsConsent =
    selectedFaiths.length > 0 || (data.backgrounds?.length ?? 0) > 0 || Boolean(data.backgroundOther?.trim());

  const submitTraditions = () => {
    if (needsConsent && !data.faithConsent) {
      setErrors({ consent: "Tick the box to agree, or go back and remove your faith and background choices" });
      requestAnimationFrame(() => consentRef.current?.focus());
      return;
    }
    const final = needsConsent
      ? data
      : { ...data, faiths: [], backgrounds: [], backgroundOther: undefined, faithConsent: false };
    // Signed-in people are already saved; everyone else is offered the email screen
    if (isSignedIn) return finish(final);
    setReady(final);
    go(TOTAL + 1);
  };

  const savePlanByEmail = async () => {
    if (!ready) return;
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError(value ? "Enter an email address in the correct format, like name@example.com" : "Enter your email address");
      requestAnimationFrame(() => document.getElementById("save-email")?.focus());
      return;
    }
    if (!ageBand) {
      setEmailError("Tell us your age to continue");
      return;
    }
    if (!ALLOWED_AGE_BANDS.includes(ageBand)) return;
    setSending(true);
    const res = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: value, next: "/dashboard", ageBand }),
    }).catch(() => null);
    setSending(false);
    if (!res?.ok) {
      setSendFailed(true);
      return;
    }
    await finish(ready);
    // Clicking the emailed link saves this plan to their email address
    writeLocal(LOCAL_KEYS.pendingSave, "1");
    writeLocal(LOCAL_KEYS.linkSentTo, value);
  };

  const submitNames = () => {
    const next: Errors = {};
    if (!data.deceasedFirstName.trim()) next.firstName = "Enter their first name";
    if (!data.dateOfDeath) next.dateOfDeath = "Enter the date they died";
    else if (data.dateOfDeath > new Date().toISOString().slice(0, 10)) next.dateOfDeath = "The date they died must be today or in the past";
    setErrors(next);
    if (next.firstName) return requestAnimationFrame(() => firstNameRef.current?.focus());
    if (next.dateOfDeath) return requestAnimationFrame(() => dateRef.current?.focus());
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
    <div className="max-w-lg mx-auto px-4 pt-6 pb-28 md:pb-10 sm:pt-12 min-h-[80vh] flex flex-col">
      {/* Progress + back */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => {
            if (step <= 1) return router.push("/");
            // Use real browser history where we added it, so both back buttons agree
            if (window.history.state?.intakePushed) window.history.back();
            else go(step - 1);
          }}
          className="p-2.5 -ml-2.5 rounded-full text-ink-600 hover:bg-stone-100"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden" role="progressbar" aria-label="Progress through the questions" aria-valuenow={Math.min(step, TOTAL)} aria-valuemin={1} aria-valuemax={TOTAL}>
          <div className="h-full bg-ink-700 rounded-full transition-all duration-500" style={{ width: `${(Math.min(step, TOTAL) / TOTAL) * 100}%` }} />
        </div>
        <span className="text-sm text-ink-500 tabular-nums">
          {step > TOTAL ? "Last step" : `${step} of ${TOTAL}`}
        </span>
      </div>

      <div key={step} className="animate-fade-up flex-1">
        {step === 1 && (
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              submitNames();
            }}
          >
            <Title>Who is this plan for?</Title>
            <p className="text-ink-500 mb-6">We are sorry for your loss. Tell us their name and the date they died.</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name" id="first-name" error={errors.firstName}>
                <input
                  ref={firstNameRef}
                  id="first-name"
                  autoFocus
                  value={data.deceasedFirstName}
                  onChange={(e) => setData({ ...data, deceasedFirstName: e.target.value })}
                  className={inputClass(Boolean(errors.firstName))}
                  autoComplete="off"
                  aria-invalid={Boolean(errors.firstName) || undefined}
                  aria-describedby={errors.firstName ? "first-name-error" : undefined}
                />
              </Field>
              <Field label="Last name" id="last-name">
                <input
                  id="last-name"
                  value={data.deceasedLastName}
                  onChange={(e) => setData({ ...data, deceasedLastName: e.target.value })}
                  className={inputClass(false)}
                  autoComplete="off"
                />
              </Field>
            </div>
            <Field label="Date they died" id="date-of-death" error={errors.dateOfDeath} className="mt-4">
              <input
                ref={dateRef}
                id="date-of-death"
                type="date"
                value={data.dateOfDeath}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setData({ ...data, dateOfDeath: e.target.value })}
                className={inputClass(Boolean(errors.dateOfDeath))}
                aria-invalid={Boolean(errors.dateOfDeath) || undefined}
                aria-describedby={errors.dateOfDeath ? "date-of-death-error" : undefined}
              />
            </Field>
            <button type="submit" className={primaryClass + " mt-8"}>
              Continue
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
              {FAITH_CHOICES.filter(
                (f) => showAllFaiths || COMMON_FAITHS.includes(f.value) || selectedFaiths.includes(f.value)
              ).map((f) => {
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
            {!showAllFaiths && (
              <button
                type="button"
                onClick={() => setShowAllFaiths(true)}
                aria-expanded={false}
                className="mt-3 text-sm font-medium text-ink-700 underline underline-offset-4 decoration-ink-300 hover:decoration-ink-700 py-1"
              >
                Show more faiths and beliefs
              </button>
            )}
            {selectedFaiths.length > 0 ? (
              <button onClick={() => go(7)} className={primaryClass + " mt-5"}>
                Continue
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
              }}
              other={data.backgroundOther ?? ""}
              onOtherChange={(backgroundOther) => setData({ ...data, backgroundOther, faithConsent: false })}
            />
            <button onClick={() => go(8)} className={primaryClass + " mt-6"}>
              {(data.backgrounds?.length ?? 0) > 0 || data.backgroundOther?.trim() ? "Continue" : "Skip this question"}
            </button>
          </div>
        )}

        {step === 8 && (
          <div>
            <Title>Where will {first} be buried or cremated?</Title>
            <p className="text-ink-500 mb-6">If the funeral or burial will be in another country, we will add the extra steps.</p>
            <fieldset>
              <legend className="sr-only">Where will {first} be buried or cremated?</legend>
              <div className="grid grid-cols-1 gap-2.5">
                {BURIAL_PLACES.map((p) => {
                  const on = data.burialPlace === p.value;
                  return (
                    <label
                      key={p.value}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 font-medium text-ink-900 cursor-pointer transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ink-400",
                        on ? "border-ink-700 bg-ink-50" : "border-stone-200 bg-white hover:border-ink-300"
                      )}
                    >
                      <input
                        type="radio"
                        name="burial-place"
                        value={p.value}
                        checked={on}
                        onChange={() => setData({ ...data, burialPlace: p.value })}
                        className="h-5 w-5 shrink-0 accent-ink-700"
                      />
                      {p.label}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {needsConsent && (
              <div className="mt-6">
                {errors.consent && (
                  <p id="consent-error" className="text-sm font-semibold text-rose-800 mb-2">
                    <span className="sr-only">Error: </span>
                    {errors.consent}
                  </p>
                )}
              <label
                className={cn(
                  "flex items-start gap-3 bg-white border-2 rounded-2xl p-4 cursor-pointer",
                  errors.consent ? "border-rose-700" : "border-stone-200"
                )}
              >
                <input
                  ref={consentRef}
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 flex-shrink-0 accent-ink-700"
                  checked={data.faithConsent ?? false}
                  aria-invalid={Boolean(errors.consent) || undefined}
                  aria-describedby={errors.consent ? "consent-error" : undefined}
                  onChange={(e) => {
                    setData({ ...data, faithConsent: e.target.checked });
                    setErrors({});
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
              </div>
            )}
            <button onClick={submitTraditions} className={primaryClass + " mt-6"}>
              Show my plan
            </button>
          </div>
        )}
        {step === TOTAL + 1 && ready && (
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              savePlanByEmail();
            }}
          >
            <Title>Keep your plan safe</Title>
            <p className="text-ink-500 mb-6">
              Enter your email so you do not lose your plan and can come back to your answers at any time. We will
              send you a link to it. No password needed.
            </p>
            {sendFailed ? (
              <div role="alert" className="rounded-2xl border border-stone-300 bg-white p-4">
                <p className="font-semibold text-ink-900">We could not send the email just now</p>
                <p className="text-sm text-ink-700 mt-1">
                  Your plan is still saved on this device. You can save it to your email later from the plan.
                </p>
              </div>
            ) : (
              <>
                <label htmlFor="save-email" className="block text-sm font-medium text-ink-700 mb-1.5">
                  Your email address
                </label>
                {emailError && (
                  <p id="save-email-error" className="text-sm font-semibold text-rose-800 mb-1.5">
                    <span className="sr-only">Error: </span>
                    {emailError}
                  </p>
                )}
                <input
                  id="save-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  aria-invalid={Boolean(emailError) || undefined}
                  aria-describedby={emailError ? "save-email-error" : undefined}
                  className={inputClass(Boolean(emailError))}
                />
                {email.trim() && (
                  <div className="mt-4">
                    <AgeQuestion value={ageBand} onChange={(v) => { setAgeBand(v); setEmailError(""); }} />
                  </div>
                )}
                <p className="text-xs text-ink-500 mt-3">
                  We only use your email to send you your plan and reminders you ask for.{" "}
                  <a href="/privacy" target="_blank" className="underline">Privacy</a>
                </p>
              </>
            )}
            {sendFailed ? (
              <button type="button" onClick={() => finish(ready)} className={primaryClass + " mt-6"}>
                Show my plan
              </button>
            ) : (
              <>
                <button type="submit" disabled={sending || ageBand === "under-16"} className={primaryClass + " mt-6 disabled:opacity-60"}>
                  {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : null} Save my plan
                </button>
                <button
                  type="button"
                  onClick={() => finish(ready)}
                  className="w-full mt-3 py-3 text-ink-600 font-medium hover:text-ink-900"
                >
                  Skip for now
                </button>
              </>
            )}
          </form>
        )}
      </div>

      <p className="text-center text-xs text-ink-500 mt-10">
        Your answers are saved on this device as you go. Nothing is shared unless you choose to.
        {step > 1 && !confirmingStartOver && (
          <>
            {" "}
            <button
              type="button"
              onClick={() => setConfirmingStartOver(true)}
              className="underline underline-offset-2 hover:text-ink-800"
            >
              Start over
            </button>
          </>
        )}
      </p>
      {confirmingStartOver && (
        <div role="alert" className="mt-3 rounded-2xl border border-stone-200 bg-white p-4 text-center">
          <p className="text-sm text-ink-800">Clear all your answers and start again?</p>
          <div className="flex justify-center gap-3 mt-3">
            <button
              type="button"
              onClick={startOver}
              className="px-4 py-2 rounded-xl bg-ink-700 text-white text-sm font-medium hover:bg-ink-800"
            >
              Yes, start over
            </button>
            <button
              type="button"
              onClick={() => setConfirmingStartOver(false)}
              className="px-4 py-2 rounded-xl border border-stone-300 text-sm font-medium text-ink-800 hover:bg-stone-50"
            >
              Keep my answers
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass = (invalid: boolean) =>
  cn(
    "w-full rounded-xl border bg-white px-4 py-3.5 text-base text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-transparent",
    invalid ? "border-2 border-rose-700" : "border-stone-300"
  );
const primaryClass =
  "w-full flex items-center justify-center gap-2 bg-ink-700 text-white text-lg font-medium py-4 rounded-2xl shadow-sm hover:bg-ink-800 active:scale-[0.99] transition-all";

function Title({ children }: { children: React.ReactNode }) {
  return <h1 className="text-3xl sm:text-4xl font-semibold text-ink-900 leading-tight mb-2">{children}</h1>;
}

/** A labelled field. Errors sit between the label and the input, as on GOV.UK. */
function Field({
  label,
  id,
  error,
  children,
  className,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("block", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-ink-700 mb-1.5">
        {label}
      </label>
      {error && (
        <p id={`${id}-error`} className="text-sm font-semibold text-rose-800 mb-1.5">
          <span className="sr-only">Error: </span>
          {error}
        </p>
      )}
      {children}
    </div>
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
