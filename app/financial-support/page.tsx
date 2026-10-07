"use client";
import { useState } from "react";
import { AlertCircle, ArrowRight, Check, CheckCircle2, ExternalLink, Info, PoundSterling, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type YNUnsure = "yes" | "no" | "unsure";

interface CheckerState {
  relationship: string;
  partnerPaidNI: YNUnsure;
  receivingBenefits: YNUnsure;
  whichBenefits: string[];
  funeralCostHelp: YNUnsure;
  hasChildren: YNUnsure;
  childAge: string;
}

const initialState: CheckerState = {
  relationship: "",
  partnerPaidNI: "unsure",
  receivingBenefits: "unsure",
  whichBenefits: [],
  funeralCostHelp: "unsure",
  hasChildren: "unsure",
  childAge: "",
};

interface SupportProgram {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  amount: string;
  how: string;
  link: string;
  eligible: "likely" | "possible" | "unlikely";
}

function OptionBtn({
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
        "flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all w-full text-left",
        selected
          ? "border-ink-700 bg-ink-50 text-ink-800"
          : "border-stone-200 bg-white text-ink-600 hover:border-stone-300"
      )}
    >
      {children}
      {selected && <Check className="h-4 w-4 text-ink-700" />}
    </button>
  );
}

const QUALIFYING_BENEFITS = [
  "Universal Credit",
  "Income Support",
  "Pension Credit",
  "Income-based Jobseeker's Allowance",
  "Income-related Employment and Support Allowance",
  "Housing Benefit",
];

export default function FinancialSupportPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<CheckerState>(initialState);
  const [results, setResults] = useState<SupportProgram[] | null>(null);

  const update = <K extends keyof CheckerState>(key: K, value: CheckerState[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const toggleBenefit = (b: string) => {
    setData((prev) => ({
      ...prev,
      whichBenefits: prev.whichBenefits.includes(b)
        ? prev.whichBenefits.filter((x) => x !== b)
        : [...prev.whichBenefits, b],
    }));
  };

  const calculateResults = (): SupportProgram[] => {
    const programs: SupportProgram[] = [];

    const isSpouse = data.relationship === "spouse-partner";
    const paidNI = data.partnerPaidNI === "yes";
    const onBenefits = data.receivingBenefits === "yes";
    const needsFuneralHelp = data.funeralCostHelp === "yes";
    const hasKids = data.hasChildren === "yes";

    programs.push({
      id: "bsp",
      name: "Bereavement Support Payment",
      description:
        "A first payment followed by up to 18 monthly payments if your husband, wife, civil partner or partner died.",
      eligibility:
        "You may qualify if you were married, in a civil partnership, or living together with children; the person who died paid National Insurance contributions for at least 25 weeks (or died because of their work); and you were under State Pension age when they died.",
      amount: "Higher rate: £3,500 first payment, then 18 monthly payments of £350. Lower rate: £2,500 first payment, then 18 monthly payments of £100.",
      how: "Claim within 3 months of the death to get the full amount. You can claim up to 21 months after the death, but after 12 months you will not get the first payment. Call the DWP Bereavement Service on 0800 151 2012 (Relay UK: 18001 then 0800 731 0469; Welsh language: 0800 731 0453).",
      link: "https://www.gov.uk/bereavement-support-payment",
      eligible: isSpouse && paidNI ? "likely" : isSpouse && data.partnerPaidNI === "unsure" ? "possible" : "unlikely",
    });

    programs.push({
      id: "fep",
      name: "Funeral Expenses Payment",
      description:
        "A payment to help with funeral costs if you get certain benefits and are responsible for the funeral. Available in England, Wales and Northern Ireland.",
      eligibility:
        "You may qualify if you were the partner, a close relative or close friend of the person who died, or the parent of a baby or child who died, and you or your partner get Universal Credit, Pension Credit, Income Support, income-based Jobseeker's Allowance, income-related Employment and Support Allowance or Housing Benefit.",
      amount: "Necessary burial or cremation fees, plus up to £1,000 for other funeral costs (£120 if there is a funeral plan).",
      how: "Claim within 6 months of the funeral. Call the DWP Bereavement Service on 0800 151 2012. In Northern Ireland, apply through the Department for Communities. In Scotland, apply for a Funeral Support Payment from Social Security Scotland instead (0800 182 2222, mygov.scot/funeral-support-payment). It pays burial or cremation costs plus £1,327.75 for other costs (£162.05 with a funeral plan).",
      link: "https://www.gov.uk/funeral-payments",
      eligible: onBenefits && needsFuneralHelp ? "likely" : needsFuneralHelp ? "possible" : "unlikely",
    });

    if (hasKids) {
      programs.push({
        id: "guardian",
        name: "Guardian's Allowance",
        description:
          "A tax-free payment if you are bringing up a child whose parents have died.",
        eligibility: "You need to be getting Child Benefit for the child. Usually both parents must have died, but in some cases you may be able to get it if only one parent has died.",
        amount: "£22.95 a week (2026/27 rate).",
        how: "Claim through HMRC using form BG1.",
        link: "https://www.gov.uk/guardians-allowance",
        eligible: "possible",
      });
    }

    programs.push({
      id: "child-benefit",
      name: "Child Benefit",
      description:
        "If the person who died was claiming Child Benefit, tell HMRC. The person now responsible for the child may be able to make a new claim.",
      eligibility: "Payable for children under 16, or under 20 in approved education or training.",
      amount: "£27.05 a week for the eldest or only child, and £17.90 a week for each other child (2026/27 rates).",
      how: "Contact the Child Benefit Office to update the claim.",
      link: "https://www.gov.uk/child-benefit",
      eligible: hasKids ? "possible" : "unlikely",
    });

    programs.push({
      id: "council-support",
      name: "Council help",
      description:
        "Help from councils varies. Some have local welfare schemes. If no one is able to pay for a funeral, the council must arrange a public health funeral.",
      eligibility: "Varies by council. Contact your local council to ask.",
      amount: "Varies by council.",
      how: "Contact your local council's welfare or bereavement services team.",
      link: "https://www.gov.uk/find-local-council",
      eligible: needsFuneralHelp ? "possible" : "unlikely",
    });

    programs.push({
      id: "charity",
      name: "Free funeral advice: Down to Earth",
      description:
        "Down to Earth, run by Quaker Social Action, gives free advice and support to help people arrange an affordable funeral. It does not give money.",
      eligibility: "Anyone worried about paying for a funeral can contact them.",
      amount: "Free advice and support (not a grant).",
      how: "Phone 020 8983 5055 or visit the Quaker Social Action website. Citizens Advice can also help you find other local support.",
      link: "https://quakersocialaction.org.uk/we-can-help/helping-funerals/down-earth",
      eligible: needsFuneralHelp ? "possible" : "unlikely",
    });

    return programs.sort((a, b) => {
      const order = { likely: 0, possible: 1, unlikely: 2 };
      return order[a.eligible] - order[b.eligible];
    });
  };

  const handleCheck = () => {
    setResults(calculateResults());
    setStep(99);
  };

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-white to-stone-50 border-b border-stone-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-semibold text-ink-900 mb-2">Check what money help you can get</h1>
            <p className="text-ink-500">
              Answer a few questions to find out which payments and support you may be able to get. This checker mainly covers England and Wales.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {step < 99 && (
          <div className="space-y-6">
            {/* Step 0: Relationship */}
            {step >= 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-base font-semibold text-ink-800 mb-4">
                    What was your relationship to the person who died?
                  </h3>
                  <div className="space-y-2">
                    {[
                      { value: "spouse-partner", label: "Husband, wife, civil partner or partner" },
                      { value: "parent", label: "Parent" },
                      { value: "child", label: "Son or daughter" },
                      { value: "sibling", label: "Sibling" },
                      { value: "other", label: "Other relative or friend" },
                    ].map((opt) => (
                      <OptionBtn
                        key={opt.value}
                        value={opt.value}
                        selected={data.relationship === opt.value}
                        onClick={() => { update("relationship", opt.value); if (step === 0) setStep(1); }}
                      >
                        {opt.label}
                      </OptionBtn>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 1: NI */}
            {step >= 1 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-base font-semibold text-ink-800 mb-1">
                    Did the person who died pay National Insurance contributions?
                  </h3>
                  <p className="text-xs text-ink-500 mb-4">
                    Most people who worked in the UK will have paid National Insurance. Check their P60 or payslips if you are not sure.
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {(["yes", "no", "unsure"] as YNUnsure[]).map((v) => (
                      <OptionBtn
                        key={v}
                        value={v}
                        selected={data.partnerPaidNI === v}
                        onClick={() => { update("partnerPaidNI", v); if (step === 1) setStep(2); }}
                      >
                        {v === "yes" ? "Yes" : v === "no" ? "No" : "Not sure"}
                      </OptionBtn>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Benefits */}
            {step >= 2 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-base font-semibold text-ink-800 mb-4">
                    Do you or your partner get any of these benefits?
                  </h3>
                  <div className="space-y-2 mb-4">
                    {QUALIFYING_BENEFITS.map((b) => (
                      <label
                        key={b}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all text-sm",
                          data.whichBenefits.includes(b)
                            ? "border-ink-700 bg-ink-50"
                            : "border-stone-200 bg-white hover:border-stone-300"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={data.whichBenefits.includes(b)}
                          onChange={() => toggleBenefit(b)}
                          className="rounded border-stone-300"
                        />
                        <span className="text-ink-700">{b}</span>
                      </label>
                    ))}
                    <label
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all text-sm",
                        data.receivingBenefits === "no"
                          ? "border-ink-700 bg-ink-50"
                          : "border-stone-200 bg-white hover:border-stone-300"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={data.receivingBenefits === "no"}
                        onChange={() => {
                          update("receivingBenefits", data.receivingBenefits === "no" ? "unsure" : "no");
                          update("whichBenefits", []);
                        }}
                        className="rounded border-stone-300"
                      />
                      <span className="text-ink-700">None of these</span>
                    </label>
                  </div>
                  {data.whichBenefits.length > 0 && (
                    <div onClick={() => { update("receivingBenefits", "yes"); setStep(3); }}>
                      <Button size="sm">Continue <ArrowRight className="h-4 w-4" /></Button>
                    </div>
                  )}
                  {data.receivingBenefits === "no" && (
                    <Button size="sm" onClick={() => setStep(3)}>Continue <ArrowRight className="h-4 w-4" /></Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Funeral cost help */}
            {step >= 3 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-base font-semibold text-ink-800 mb-4">
                    Do you need help paying for the funeral costs?
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {(["yes", "no", "unsure"] as YNUnsure[]).map((v) => (
                      <OptionBtn
                        key={v}
                        value={v}
                        selected={data.funeralCostHelp === v}
                        onClick={() => { update("funeralCostHelp", v); if (step === 3) setStep(4); }}
                      >
                        {v === "yes" ? "Yes" : v === "no" ? "No" : "Not sure"}
                      </OptionBtn>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Children */}
            {step >= 4 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-base font-semibold text-ink-800 mb-4">
                    Are there dependent children involved?
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {(["yes", "no", "unsure"] as YNUnsure[]).map((v) => (
                      <OptionBtn
                        key={v}
                        value={v}
                        selected={data.hasChildren === v}
                        onClick={() => { update("hasChildren", v); if (step === 4) setStep(5); }}
                      >
                        {v === "yes" ? "Yes" : v === "no" ? "No" : "Not sure"}
                      </OptionBtn>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit */}
            {step >= 5 && (
              <div className="text-center">
                <Button size="lg" onClick={handleCheck}>
                  Check what you may be able to get
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-6">
            <div className="bg-ink-700 text-white rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-2">Your support overview</h2>
              <p className="text-ink-300 text-sm">
                Based on your answers, here are the support programmes that may be relevant to you.
              </p>
              <div className="flex gap-4 mt-4">
                <div>
                  <p className="text-2xl font-bold">{results.filter((r) => r.eligible === "likely").length}</p>
                  <p className="text-xs text-ink-300">You may be able to get this</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{results.filter((r) => r.eligible === "possible").length}</p>
                  <p className="text-xs text-ink-300">Worth checking</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                This is guidance only and is not an official eligibility decision. Contact the relevant organisation to confirm whether you qualify.
              </p>
            </div>

            {results.map((program) => (
              <Card key={program.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base">{program.name}</CardTitle>
                    <div
                      className={cn(
                        "flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 flex-shrink-0",
                        program.eligible === "likely" && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                        program.eligible === "possible" && "bg-amber-50 text-amber-700 border border-amber-200",
                        program.eligible === "unlikely" && "bg-stone-100 text-ink-500 border border-stone-200"
                      )}
                    >
                      {program.eligible === "likely" && <CheckCircle2 className="h-3.5 w-3.5" />}
                      {program.eligible === "possible" && <Info className="h-3.5 w-3.5" />}
                      {program.eligible === "unlikely" && <X className="h-3.5 w-3.5" />}
                      {program.eligible === "likely"
                        ? "You may be able to get this"
                        : program.eligible === "possible"
                        ? "Worth checking"
                        : "Unlikely to apply"}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-ink-600 mb-4">{program.description}</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-ink-500 uppercase tracking-wide mb-1">Eligibility</p>
                      <p className="text-sm text-ink-700">{program.eligibility}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-ink-500 uppercase tracking-wide mb-1">How much</p>
                      <p className="text-sm text-ink-700 font-medium flex items-center gap-1">
                        <PoundSterling className="h-3.5 w-3.5 text-emerald-600" />
                        {program.amount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-ink-500 uppercase tracking-wide mb-1">How to apply</p>
                      <p className="text-sm text-ink-700">{program.how}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-stone-100">
                    <a
                      href={program.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-ink-700 font-medium hover:text-ink-900"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Find out more
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button variant="outline" onClick={() => { setStep(0); setResults(null); setData(initialState); }}>
              Start again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
