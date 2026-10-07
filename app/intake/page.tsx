"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LOCAL_KEYS, writeLocal } from "@/lib/use-local-storage";
import type { IntakeFormData, FuneralPreference, FaithOption, HousingType, YesNoUnsure, DeceasedLocation } from "@/types";

const STEP_NAMES = ["About them", "About you", "The funeral", "Faith", "Their home", "Money"];
const TOTAL_STEPS = STEP_NAMES.length;

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

function OptionCard({
  selected,
  onClick,
  children,
}: {
  value: string;
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all active:scale-[0.99]",
        selected
          ? "border-ink-700 bg-ink-50 text-ink-900"
          : "border-stone-200 bg-white text-ink-700 hover:border-ink-200 hover:bg-stone-50"
      )}
      aria-pressed={selected}
    >
      <div className="flex items-center justify-between gap-3">
        {children}
        <span
          className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
            selected ? "border-ink-700 bg-ink-700" : "border-stone-300"
          )}
        >
          {selected && <Check className="h-3 w-3 text-white animate-pop" strokeWidth={3} />}
        </span>
      </div>
    </button>
  );
}

export default function IntakePage() {
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [step, setStep] = useState(1);
  const [data, setData] = useState<IntakeFormData>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof IntakeFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setIsSignedIn(Boolean(d?.email)))
      .catch(() => {});
  }, []);

  const update = <K extends keyof IntakeFormData>(key: K, value: IntakeFormData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validateStep = (): boolean => {
    const newErrors: Partial<Record<keyof IntakeFormData, string>> = {};
    if (step === 1) {
      if (!data.deceasedFirstName.trim()) newErrors.deceasedFirstName = "First name is required";
      if (!data.deceasedLastName.trim()) newErrors.deceasedLastName = "Last name is required";
      if (!data.dateOfDeath) newErrors.dateOfDeath = "Date of death is required";
      if (!data.locationOfDeath.trim()) newErrors.locationOfDeath = "Location is required";
    }
    if (step === 4 && data.faith !== "prefer-not-to-say" && !data.faithConsent) {
      newErrors.faithConsent = "Please tick the box to let us use this, or choose \"Prefer not to say\".";
    }
    if (step === 2) {
      if (!data.relationship) newErrors.relationship = "Please select your relationship";
      if (!data.postcode.trim()) newErrors.postcode = "Postcode is required";
      if (data.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))
        newErrors.email = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    // A new intake starts a fresh local plan
    writeLocal(LOCAL_KEYS.intake, JSON.stringify(data));
    writeLocal(LOCAL_KEYS.statuses, null);

    if (isSignedIn) {
      try {
        const res = await fetch("/api/save-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ intakeData: data, taskStatuses: {} }),
        });
        if (res.ok) {
          const { planId } = await res.json();
          writeLocal(LOCAL_KEYS.intake, null);
          router.push(`/plan/${planId}`);
          return;
        }
      } catch {}
    }
    // Signed out (or saving failed): show the plan straight away; it can be saved from there
    router.push("/plan");
  };


  return (
    <div className="min-h-screen py-10 sm:py-14">
      <div className="max-w-xl mx-auto px-4">
        {/* Progress */}
        <div className="mb-8">
          <p className="text-sm text-ink-500 mb-3">
            Step {step} of {TOTAL_STEPS} · <span className="text-ink-700 font-medium">{STEP_NAMES[step - 1]}</span>
          </p>
          <ol className="flex gap-1.5" aria-label="Progress">
            {STEP_NAMES.map((label, i) => (
              <li key={label} className="flex-1" aria-current={i + 1 === step ? "step" : undefined}>
                <span
                  className={cn(
                    "block h-1.5 rounded-full transition-colors duration-500",
                    i + 1 < step ? "bg-ink-700" : i + 1 === step ? "bg-ink-400" : "bg-stone-200"
                  )}
                />
                <span className="sr-only">{label}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-[0_12px_40px_-20px_rgba(24,42,38,0.25)] p-6 sm:p-9">
          {step === 1 && (
            <div className="animate-fade-up">
              <p className="text-sm text-ink-500 mb-4">
                Take your time. If you&apos;re not sure about something, choose your best guess — you can always
                create a new plan later.
              </p>
              <h2 className="text-2xl font-semibold text-ink-900 mb-1">About the person who has died</h2>
              <p className="text-sm text-ink-500 mb-6">
                We use this to personalise your plan. This information stays private.
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="First name"
                    value={data.deceasedFirstName}
                    onChange={(e) => update("deceasedFirstName", e.target.value)}
                    error={errors.deceasedFirstName}
                    placeholder="e.g. John"
                  />
                  <Input
                    label="Last name"
                    value={data.deceasedLastName}
                    onChange={(e) => update("deceasedLastName", e.target.value)}
                    error={errors.deceasedLastName}
                    placeholder="e.g. Smith"
                  />
                </div>
                <Input
                  label="Date of death"
                  type="date"
                  value={data.dateOfDeath}
                  onChange={(e) => update("dateOfDeath", e.target.value)}
                  error={errors.dateOfDeath}
                />
                <Input
                  label="Town or city where they passed"
                  value={data.locationOfDeath}
                  onChange={(e) => update("locationOfDeath", e.target.value)}
                  error={errors.locationOfDeath}
                  placeholder="e.g. Manchester"
                />
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-2">
                    Where is the deceased currently?
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {([
                      { value: "hospital", label: "Hospital" },
                      { value: "hospice", label: "Hospice" },
                      { value: "care-home", label: "Care home" },
                      { value: "home", label: "At home" },
                      { value: "funeral-director", label: "With a funeral director" },
                    ] as { value: DeceasedLocation; label: string }[]).map((opt) => (
                      <OptionCard
                        key={opt.value}
                        value={opt.value}
                        selected={data.currentLocation === opt.value}
                        onClick={() => update("currentLocation", opt.value)}
                      >
                        {opt.label}
                      </OptionCard>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-up">
              <h2 className="text-2xl font-semibold text-ink-900 mb-1">About you</h2>
              <p className="text-sm text-ink-500 mb-6">
                We use your location to find nearby services and send your plan.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-2">
                    Your relationship to the deceased
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Son / Daughter",
                      "Spouse / Partner",
                      "Parent",
                      "Sibling",
                      "Grandchild",
                      "Other relative",
                      "Close friend",
                      "Other",
                    ].map((rel) => (
                      <OptionCard
                        key={rel}
                        value={rel}
                        selected={data.relationship === rel}
                        onClick={() => update("relationship", rel)}
                      >
                        {rel}
                      </OptionCard>
                    ))}
                  </div>
                  {errors.relationship && <p className="mt-1 text-xs text-red-600">{errors.relationship}</p>}
                </div>
                <Input
                  label="Your postcode"
                  value={data.postcode}
                  onChange={(e) => update("postcode", e.target.value.toUpperCase())}
                  error={errors.postcode}
                  placeholder="e.g. SW1A 1AA"
                  hint="Used to find your local services"
                />
                <Input
                  label="Your email address (optional)"
                  type="email"
                  value={data.email}
                  onChange={(e) => update("email", e.target.value)}
                  error={errors.email}
                  placeholder="you@example.com"
                  hint="Only used if you choose to save your plan to an account"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-up">
              <h2 className="text-2xl font-semibold text-ink-900 mb-1">Funeral preferences</h2>
              <p className="text-sm text-ink-500 mb-6">
                It&apos;s fine if you&apos;re not sure yet. We can guide you through both options.
              </p>
              <div className="space-y-3">
                {([
                  { value: "burial", label: "Burial", desc: "Traditional burial in a cemetery or churchyard" },
                  { value: "cremation", label: "Cremation", desc: "The body is cremated; ashes can be kept or scattered" },
                  { value: "unsure", label: "Not sure yet", desc: "We can help you understand both options" },
                ] as { value: FuneralPreference; label: string; desc: string }[]).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update("funeralPreference", opt.value)}
                    className={cn(
                      "w-full text-left px-4 py-4 rounded-xl border-2 transition-all",
                      data.funeralPreference === opt.value
                        ? "border-ink-700 bg-ink-50"
                        : "border-stone-200 bg-white hover:border-stone-300"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-ink-800">{opt.label}</p>
                        <p className="text-xs text-ink-500 mt-0.5">{opt.desc}</p>
                      </div>
                      {data.funeralPreference === opt.value && (
                        <Check className="h-4 w-4 text-ink-700 mt-0.5 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-fade-up">
              <h2 className="text-2xl font-semibold text-ink-900 mb-1">Faith &amp; cultural requirements</h2>
              <p className="text-sm text-ink-500 mb-6">
                Optional. This helps us include faith-specific steps — for example, some traditions
                hold the funeral within 24 hours.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: "christian", label: "Christian" },
                  { value: "muslim", label: "Muslim" },
                  { value: "hindu", label: "Hindu" },
                  { value: "sikh", label: "Sikh" },
                  { value: "jewish", label: "Jewish" },
                  { value: "humanist", label: "Humanist" },
                  { value: "african-caribbean", label: "African / Caribbean" },
                  { value: "other", label: "Other" },
                  { value: "none", label: "No religious requirements" },
                  { value: "prefer-not-to-say", label: "Prefer not to say" },
                ] as { value: FaithOption; label: string }[]).map((opt) => (
                  <OptionCard
                    key={opt.value}
                    value={opt.value}
                    selected={data.faith === opt.value}
                    onClick={() => {
                      update("faith", opt.value);
                      if (opt.value === "prefer-not-to-say") update("faithConsent", false);
                    }}
                  >
                    {opt.label}
                  </OptionCard>
                ))}
              </div>
              {data.faith !== "prefer-not-to-say" && (
                <label className="mt-5 flex items-start gap-3 bg-stone-50 border border-stone-200 rounded-xl p-4 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 flex-shrink-0"
                    checked={data.faithConsent ?? false}
                    onChange={(e) => update("faithConsent", e.target.checked)}
                  />
                  <span className="text-sm text-ink-600 leading-relaxed">
                    I agree to AfterCare using this answer to tailor the plan. If I save the plan, it is stored
                    securely and seen only by me and family members I invite. I can remove it at any time.{" "}
                    <a href="/privacy#special-category" target="_blank" className="underline">
                      Why we ask
                    </a>
                  </span>
                </label>
              )}
              {errors.faithConsent && <p className="mt-2 text-xs text-red-600">{errors.faithConsent}</p>}
            </div>
          )}

          {step === 5 && (
            <div className="animate-fade-up">
              <h2 className="text-2xl font-semibold text-ink-900 mb-1">Housing situation</h2>
              <p className="text-sm text-ink-500 mb-6">
                This helps us include the right guidance about property and tenancy rights.
              </p>
              <div className="space-y-2">
                {([
                  { value: "owned", label: "They owned a property", desc: "Freehold or leasehold ownership" },
                  { value: "private-rental", label: "They rented privately", desc: "Tenancy with a private landlord" },
                  { value: "council", label: "They lived in council housing", desc: "Social or council tenancy" },
                  {
                    value: "supported",
                    label: "They lived in supported accommodation",
                    desc: "Care home, sheltered housing, etc.",
                  },
                  { value: "unsure", label: "I'm not sure", desc: "We'll include general guidance" },
                ] as { value: HousingType; label: string; desc: string }[]).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update("housingType", opt.value)}
                    className={cn(
                      "w-full text-left px-4 py-4 rounded-xl border-2 transition-all",
                      data.housingType === opt.value
                        ? "border-ink-700 bg-ink-50"
                        : "border-stone-200 bg-white hover:border-stone-300"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-ink-800">{opt.label}</p>
                        <p className="text-xs text-ink-500 mt-0.5" dangerouslySetInnerHTML={{ __html: opt.desc }} />
                      </div>
                      {data.housingType === opt.value && (
                        <Check className="h-4 w-4 text-ink-700 mt-0.5 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="animate-fade-up">
              <h2 className="text-2xl font-semibold text-ink-900 mb-1">Benefits &amp; financial support</h2>
              <p className="text-sm text-ink-500 mb-6">
                This helps us check what financial support may be available to you.
              </p>

              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-ink-700 mb-2">
                    Was the deceased receiving any benefits?
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: "yes", label: "Yes" },
                      { value: "no", label: "No" },
                      { value: "unsure", label: "Not sure" },
                    ] as { value: YesNoUnsure; label: string }[]).map((opt) => (
                      <OptionCard
                        key={opt.value}
                        value={opt.value}
                        selected={data.receivingBenefits === opt.value}
                        onClick={() => update("receivingBenefits", opt.value)}
                      >
                        {opt.label}
                      </OptionCard>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-ink-700 mb-2">
                    Do you need help paying for funeral costs?
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: "yes", label: "Yes" },
                      { value: "no", label: "No" },
                      { value: "unsure", label: "Not sure" },
                    ] as { value: YesNoUnsure; label: string }[]).map((opt) => (
                      <OptionCard
                        key={opt.value}
                        value={opt.value}
                        selected={data.needsFinancialHelp === opt.value}
                        onClick={() => update("needsFinancialHelp", opt.value)}
                      >
                        {opt.label}
                      </OptionCard>
                    ))}
                  </div>
                </div>

                <div className="bg-ink-50 border border-ink-200 rounded-xl p-4 space-y-3">
                  <p className="text-xs text-ink-600 leading-relaxed">
                    <strong className="font-semibold">You&apos;re almost done.</strong> We&apos;ll save your plan automatically and email you a private link so you can return to it at any time.
                  </p>
                  <div className="border-t border-ink-200 pt-3">
                    <p className="text-xs text-ink-500 leading-relaxed">
                      By creating your plan you agree to AfterCare storing your information to generate and maintain your bereavement plan.
                      We will not sell your data or share it with third parties for marketing.
                      You can request deletion at any time.{" "}
                      <a href="/privacy" target="_blank" className="text-ink-700 underline font-medium">
                        Read our Privacy Policy
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-100">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleNext} loading={submitting} disabled={submitting}>
              {submitting ? "Saving your plan..." : step === TOTAL_STEPS ? "Create My Plan" : "Continue"}
              {!submitting && step < TOTAL_STEPS && <ArrowRight className="h-4 w-4" />}
              {!submitting && step === TOTAL_STEPS && <Check className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-ink-400 mt-5">
          Your information is protected and never shared with third parties.
        </p>
      </div>
    </div>
  );
}
