"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { FAITH_CHOICES, HOMES, LOCATIONS, MONEY, RELATIONSHIPS, type Choice } from "@/lib/intake-options";
import { BURIAL_PLACES } from "@/lib/cultures";
import { BackgroundPicker } from "@/components/plan/background-picker";
import { getFaiths } from "@/lib/faith";
import { LOCAL_KEYS, useLocalStorage, writeLocal } from "@/lib/use-local-storage";
import { cn } from "@/lib/utils";
import type { FaithOption, IntakeFormData } from "@/types";

/** One page with every answer, so mistakes can be fixed in a few taps. ?plan=<id> or ?plan=local */
export default function EditAnswersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-ink-400" />
        </div>
      }
    >
      <EditAnswers />
    </Suspense>
  );
}

function EditAnswers() {
  const router = useRouter();
  const planParam = useSearchParams().get("plan") ?? "local";
  const isLocal = planParam === "local";
  const backHref = isLocal ? "/plan" : `/plan/${planParam}`;

  const [rawLocal] = useLocalStorage(LOCAL_KEYS.intake);
  const [remote, setRemote] = useState<IntakeFormData | null>(null);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  // Edits live in `draft`; until the first change we show the stored answers
  const [draft, setDraft] = useState<IntakeFormData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLocal) return;
    fetch(`/api/plan/${planParam}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((plan) => {
        if (plan.role !== "owner") setRemoteError("Only the person who created this plan can change its answers.");
        else setRemote(plan.intake_data);
      })
      .catch(() => setRemoteError("We could not load this plan."));
  }, [isLocal, planParam]);

  let stored: IntakeFormData | null = remote;
  let loadError = remoteError;
  if (isLocal && rawLocal !== undefined) {
    try {
      stored = rawLocal ? (JSON.parse(rawLocal) as IntakeFormData) : null;
    } catch {
      stored = null;
    }
    if (!stored) loadError = "There's no plan on this device to edit.";
  }
  const data = draft ?? stored;
  const setData = setDraft;

  if (loadError) {
    return (
      <div className="max-w-md mx-auto px-5 py-20 text-center">
        <p className="text-ink-700">{loadError}</p>
        <Link href={backHref} className="inline-block mt-6 font-medium text-ink-800 underline underline-offset-4">
          Back to the plan
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-ink-400" />
      </div>
    );
  }

  // "African / Caribbean traditions" was replaced by the specific background question
  const hadLegacyTradition = getFaiths(data).includes("african-caribbean");
  const faiths: FaithOption[] = getFaiths(data).filter((f) => f !== "african-caribbean");
  const backgrounds = data.backgrounds ?? [];
  const sensitive = faiths.length > 0 || backgrounds.length > 0 || Boolean(data.backgroundOther?.trim());
  const set = (patch: Partial<IntakeFormData>) => {
    setData({ ...data, ...patch });
    setError(null);
  };
  const toggleFaith = (f: FaithOption) => {
    const next = faiths.includes(f) ? faiths.filter((x) => x !== f) : [...faiths, f];
    // Changing these answers needs fresh consent
    set({ faiths: next, faith: next[0] ?? "prefer-not-to-say", faithConsent: false });
  };

  const save = async () => {
    if (!data.deceasedFirstName.trim()) return setError("Please enter their first name.");
    if (!data.dateOfDeath) return setError("Please enter the date they died.");
    if (sensitive && !data.faithConsent) {
      return setError("Please tick the box to agree to us using your faith and background answers, or remove them.");
    }
    const final: IntakeFormData = {
      ...data,
      faiths,
      faith: faiths[0] ?? (data.faith === "none" ? "none" : "prefer-not-to-say"),
      backgrounds: sensitive ? backgrounds : [],
      backgroundOther: sensitive ? data.backgroundOther?.trim() || undefined : undefined,
      faithConsent: sensitive && Boolean(data.faithConsent),
    };
    setSaving(true);
    if (isLocal) {
      writeLocal(LOCAL_KEYS.intake, JSON.stringify(final));
      router.push("/plan");
      return;
    }
    const res = await fetch(`/api/plan/${planParam}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intakeData: final }),
    }).catch(() => null);
    if (res?.ok) router.push(backHref);
    else {
      setSaving(false);
      setError("We could not save your changes. Please try again.");
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-52 md:pb-32">
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Back to the plan
      </Link>
      <h1 className="text-3xl font-semibold text-ink-900 mt-3">Edit answers</h1>
      <p className="text-ink-600 mt-1">
        Change anything that&apos;s wrong. Your plan updates straight away, and tasks you&apos;ve already ticked stay
        ticked.
      </p>

      <Section title="Who this plan is for">
        <div className="grid grid-cols-2 gap-3">
          <TextField label="First name" value={data.deceasedFirstName} onChange={(v) => set({ deceasedFirstName: v })} />
          <TextField label="Last name" value={data.deceasedLastName} onChange={(v) => set({ deceasedLastName: v })} />
        </div>
        <label className="block mt-3">
          <span className="block text-sm font-medium text-ink-700 mb-1.5">Date they died</span>
          <input
            type="date"
            value={data.dateOfDeath}
            onChange={(e) => set({ dateOfDeath: e.target.value })}
            className={inputClass}
          />
        </label>
      </Section>

      <Section title="Where they are now">
        <Pills options={LOCATIONS} value={data.currentLocation} onChange={(v) => set({ currentLocation: v })} />
      </Section>
      <Section title="Your relationship">
        <Pills options={RELATIONSHIPS} value={data.relationship} onChange={(v) => set({ relationship: v })} />
      </Section>
      <Section title="Where they lived">
        <Pills options={HOMES} value={data.housingType} onChange={(v) => set({ housingType: v })} />
      </Section>
      <Section title="Help paying for the funeral">
        <Pills options={MONEY} value={data.needsFinancialHelp} onChange={(v) => set({ needsFinancialHelp: v })} />
      </Section>

      <Section title="Faith or beliefs" hint="Choose all that apply, or none.">
        <div className="flex flex-wrap gap-2">
          {FAITH_CHOICES.map((f) => {
            const on = faiths.includes(f.value);
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => toggleFaith(f.value)}
                aria-pressed={on}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-sm font-medium transition-colors",
                  on ? "bg-ink-700 border-ink-700 text-white" : "bg-white border-stone-300 text-ink-800 hover:border-ink-300"
                )}
              >
                {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                {f.label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Cultural background" hint="Choose any that apply. We add the customs they usually involve.">
        {hadLegacyTradition && (
          <p className="text-sm text-ink-700 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
            You previously chose &ldquo;African or Caribbean traditions&rdquo;. Please choose the specific background
            below so the plan can include the right customs.
          </p>
        )}
        <BackgroundPicker
          value={backgrounds}
          onChange={(next) => set({ backgrounds: next, faithConsent: false })}
          other={data.backgroundOther ?? ""}
          onOtherChange={(text) => set({ backgroundOther: text, faithConsent: false })}
        />
      </Section>

      <Section title="Where they will be buried or cremated">
        <div className="flex flex-wrap gap-2" role="radiogroup">
          {BURIAL_PLACES.map((p) => {
            const on = data.burialPlace === p.value;
            return (
              <button
                key={p.value}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => set({ burialPlace: on ? undefined : p.value })}
                className={cn(
                  "px-3.5 py-2 rounded-full border text-sm font-medium transition-colors text-left",
                  on ? "bg-ink-700 border-ink-700 text-white" : "bg-white border-stone-300 text-ink-800 hover:border-ink-300"
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </Section>

      {sensitive && (
        <label className="mt-6 flex items-start gap-3 bg-white border border-stone-200 rounded-2xl p-4 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 h-5 w-5 shrink-0"
            checked={Boolean(data.faithConsent)}
            onChange={(e) => set({ faithConsent: e.target.checked })}
          />
          <span className="text-sm text-ink-700">
            I agree to AfterCare using my answers about faith and cultural background to tailor the plan. Only I and
            family members I invite can see them.
          </span>
        </label>
      )}

      {/* Sticky save bar sits above the phone tab bar */}
      <div className="fixed inset-x-0 bottom-[4.5rem] md:bottom-0 z-30 bg-stone-50/95 backdrop-blur border-t border-stone-200">
        <div className="max-w-lg mx-auto px-4 py-3">
          {error && <p className="text-sm text-rose-700 mb-2">{error}</p>}
          <button
            onClick={save}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-ink-700 text-white text-lg font-medium py-3.5 rounded-2xl hover:bg-ink-800 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />} Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-transparent";

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 bg-white border border-stone-200 rounded-2xl p-4">
      <h2 className="font-sans text-base font-semibold text-ink-900">{title}</h2>
      {hint && <p className="text-sm text-ink-500 mt-0.5">{hint}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink-700 mb-1.5">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} autoComplete="off" />
    </label>
  );
}

function Pills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Choice<T>[];
  value: string;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={cn(
              "px-3.5 py-2 rounded-full border text-sm font-medium transition-colors",
              on ? "bg-ink-700 border-ink-700 text-white" : "bg-white border-stone-300 text-ink-800 hover:border-ink-300"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
