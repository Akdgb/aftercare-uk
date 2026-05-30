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
  value,
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
          ? "border-slate-700 bg-slate-50 text-slate-800"
          : "border-stone-200 bg-white text-slate-600 hover:border-stone-300"
      )}
    >
      {children}
      {selected && <Check className="h-4 w-4 text-slate-700" />}
    </button>
  );
}

const QUALIFYING_BENEFITS = [
  "Universal Credit",
  "Income Support",
  "Pension Credit",
  "Income-based Jobseeker's Allowance",
  "Income-related Employment Support Allowance",
  "Housing Benefit",
  "Child Tax Credit",
  "Working Tax Credit",
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
        "A monthly payment to help you adjust to your bereavement. Paid for up to 18 months.",
      eligibility:
        "You must have been married to or in a civil partnership with the deceased, and they must have paid National Insurance contributions for at least 25 weeks.",
      amount: "Up to £3,500 in the first year (higher rate) or up to £2,500 (lower rate), plus monthly payments.",
      how: "Apply within 3 months of bereavement to get the full amount. Apply through DWP.",
      link: "https://www.gov.uk/bereavement-support-payment",
      eligible: isSpouse && paidNI ? "likely" : isSpouse && data.partnerPaidNI === "unsure" ? "possible" : "unlikely",
    });

    programs.push({
      id: "fep",
      name: "Funeral Expenses Payment",
      description:
        "A payment from the DWP to help cover funeral costs if you are responsible for arranging the funeral.",
      eligibility:
        "You must be receiving certain means-tested benefits and be the person responsible for arranging the funeral.",
      amount: "Covers burial fees or cremation fees in full, plus up to £1,000 for other expenses.",
      how: "Apply through the DWP. You must apply within 6 months of the funeral.",
      link: "https://www.gov.uk/funeral-payments",
      eligible: onBenefits && needsFuneralHelp ? "likely" : needsFuneralHelp ? "possible" : "unlikely",
    });

    if (hasKids) {
      programs.push({
        id: "guardian",
        name: "Guardian's Allowance",
        description:
          "A tax-free payment if you are looking after a child whose parents have died.",
        eligibility: "The child must be under 16 (or under 20 if in approved education). Both parents must usually be deceased.",
        amount: "£21.75 per week (2024/25 rate).",
        how: "Claim through HMRC using form BG1.",
        link: "https://www.gov.uk/guardians-allowance",
        eligible: "possible",
      });
    }

    programs.push({
      id: "child-benefit",
      name: "Child Benefit",
      description:
        "If the deceased was the main Child Benefit claimant, you should notify HMRC and update the claim.",
      eligibility: "Payable for children under 16, or under 20 in approved education.",
      amount: "£25.60 per week for the first child; £16.95 for additional children (2024/25).",
      how: "Contact the Child Benefit Office to update the claim.",
      link: "https://www.gov.uk/child-benefit",
      eligible: hasKids ? "possible" : "unlikely",
    });

    programs.push({
      id: "council-support",
      name: "Council Assistance",
      description:
        "Many councils have a Discretionary Fund or welfare support that can help with funeral costs for residents who do not qualify for DWP support.",
      eligibility: "Varies by council. Contact your local authority.",
      amount: "Varies. Typically between £500 and £1,500.",
      how: "Contact your local council's housing or welfare benefits department.",
      link: "https://www.gov.uk/find-local-council",
      eligible: needsFuneralHelp ? "possible" : "unlikely",
    });

    programs.push({
      id: "charity",
      name: "Charity & Voluntary Sector Support",
      description:
        "Charities such as the National Lottery Community Fund, Quaker Social Action (Down to Earth), and local community foundations may offer grants for funeral costs.",
      eligibility: "Varies. Most target people on low incomes who are not eligible for DWP support.",
      amount: "Varies.",
      how: "Contact the charity directly. Your local Citizens Advice Bureau can help identify relevant funds.",
      link: "https://quakersocialaction.org.uk/we-can-help/helping-funerals/down-to-earth",
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

  const QUESTIONS = [
    {
      id: "relationship",
      question: "What was your relationship to the deceased?",
      options: [
        { value: "spouse-partner", label: "Spouse or civil partner" },
        { value: "parent", label: "Parent" },
        { value: "child", label: "Son or daughter" },
        { value: "sibling", label: "Sibling" },
        { value: "other", label: "Other relative or friend" },
      ],
      field: "relationship" as keyof CheckerState,
    },
  ];

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Financial Support Checker</h1>
            <p className="text-slate-500">
              Answer a few questions to find out which government payments and support programmes you may be entitled to.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {step < 99 && (
          <div className="space-y-6">
            {/* Step 0 – Relationship */}
            {step >= 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-base font-semibold text-slate-800 mb-4">
                    What was your relationship to the deceased?
                  </h3>
                  <div className="space-y-2">
                    {[
                      { value: "spouse-partner", label: "Spouse or civil partner" },
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

            {/* Step 1 – NI */}
            {step >= 1 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-base font-semibold text-slate-800 mb-1">
                    Did the deceased pay National Insurance contributions?
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Most people who worked in the UK will have paid NI. Check their P60 or payslips if unsure.
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

            {/* Step 2 – Benefits */}
            {step >= 2 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-base font-semibold text-slate-800 mb-4">
                    Are you currently receiving any of these benefits?
                  </h3>
                  <div className="space-y-2 mb-4">
                    {QUALIFYING_BENEFITS.map((b) => (
                      <label
                        key={b}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all text-sm",
                          data.whichBenefits.includes(b)
                            ? "border-slate-700 bg-slate-50"
                            : "border-stone-200 bg-white hover:border-stone-300"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={data.whichBenefits.includes(b)}
                          onChange={() => toggleBenefit(b)}
                          className="rounded border-stone-300"
                        />
                        <span className="text-slate-700">{b}</span>
                      </label>
                    ))}
                    <label
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all text-sm",
                        data.receivingBenefits === "no"
                          ? "border-slate-700 bg-slate-50"
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
                      <span className="text-slate-700">None of these</span>
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

            {/* Step 3 – Funeral cost help */}
            {step >= 3 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-base font-semibold text-slate-800 mb-4">
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

            {/* Step 4 – Children */}
            {step >= 4 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-base font-semibold text-slate-800 mb-4">
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
                  Check My Eligibility
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-6">
            <div className="bg-slate-700 text-white rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-2">Your support overview</h2>
              <p className="text-slate-300 text-sm">
                Based on your answers, here are the support programmes that may be relevant to you.
              </p>
              <div className="flex gap-4 mt-4">
                <div>
                  <p className="text-2xl font-bold">{results.filter((r) => r.eligible === "likely").length}</p>
                  <p className="text-xs text-slate-300">Likely eligible</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{results.filter((r) => r.eligible === "possible").length}</p>
                  <p className="text-xs text-slate-300">Worth checking</p>
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
                        program.eligible === "unlikely" && "bg-stone-100 text-slate-500 border border-stone-200"
                      )}
                    >
                      {program.eligible === "likely" && <CheckCircle2 className="h-3.5 w-3.5" />}
                      {program.eligible === "possible" && <Info className="h-3.5 w-3.5" />}
                      {program.eligible === "unlikely" && <X className="h-3.5 w-3.5" />}
                      {program.eligible === "likely"
                        ? "Likely eligible"
                        : program.eligible === "possible"
                        ? "Worth checking"
                        : "Unlikely to apply"}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">{program.description}</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Eligibility</p>
                      <p className="text-sm text-slate-700">{program.eligibility}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">How much</p>
                      <p className="text-sm text-slate-700 font-medium flex items-center gap-1">
                        <PoundSterling className="h-3.5 w-3.5 text-emerald-600" />
                        {program.amount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">How to apply</p>
                      <p className="text-sm text-slate-700">{program.how}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-stone-100">
                    <a
                      href={program.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-slate-700 font-medium hover:text-slate-900"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View on GOV.UK
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button variant="outline" onClick={() => { setStep(0); setResults(null); setData(initialState); }}>
              Start Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
