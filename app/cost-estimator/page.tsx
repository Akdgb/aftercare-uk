"use client";
import { useState, useMemo } from "react";
import { Info, PoundSterling } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type FuneralType = "burial" | "cremation" | "direct-cremation";
type ServiceSize = "small" | "medium" | "large";
type CoffinType = "simple" | "standard" | "premium" | "eco";

interface Costs {
  funeralDirector: [number, number];
  venueFee: [number, number];
  coffin: [number, number];
  flowers: [number, number];
  vehicles: [number, number];
  catering: [number, number];
  death_certs: [number, number];
  misc: [number, number];
}

const FUNERAL_DIRECTOR_BASE: Record<FuneralType, [number, number]> = {
  burial: [1800, 3200],
  cremation: [1500, 2800],
  "direct-cremation": [700, 1600],
};

const VENUE_FEE: Record<FuneralType, [number, number]> = {
  burial: [600, 2500],
  cremation: [450, 1100],
  "direct-cremation": [0, 0],
};

const COFFIN_COSTS: Record<CoffinType, [number, number]> = {
  simple: [200, 600],
  standard: [600, 1400],
  premium: [1400, 3500],
  eco: [350, 900],
};

const SERVICE_MULTIPLIER: Record<ServiceSize, number> = {
  small: 1,
  medium: 1.2,
  large: 1.45,
};

const FLOWERS: Record<ServiceSize, [number, number]> = {
  small: [0, 150],
  medium: [150, 450],
  large: [450, 900],
};

const VEHICLES: Record<ServiceSize, [number, number]> = {
  small: [0, 300],
  medium: [300, 600],
  large: [600, 1400],
};

const CATERING: Record<ServiceSize, [number, number]> = {
  small: [0, 200],
  medium: [200, 700],
  large: [700, 2000],
};

function add(a: [number, number], b: [number, number]): [number, number] {
  return [a[0] + b[0], a[1] + b[1]];
}

function scale(a: [number, number], m: number): [number, number] {
  return [Math.round(a[0] * m), Math.round(a[1] * m)];
}

function fmt(n: number) {
  return "£" + n.toLocaleString("en-GB");
}

const OptionCard = ({
  selected,
  onClick,
  children,
  note,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  note?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all",
      selected
        ? "border-slate-700 bg-slate-50 text-slate-800"
        : "border-stone-200 bg-white text-slate-500 hover:border-stone-300"
    )}
  >
    <div>{children}</div>
    {note && <div className="text-xs font-normal mt-0.5 text-slate-400">{note}</div>}
  </button>
);

export default function CostEstimatorPage() {
  const [funeralType, setFuneralType] = useState<FuneralType>("cremation");
  const [serviceSize, setServiceSize] = useState<ServiceSize>("medium");
  const [coffinType, setCoffinType] = useState<CoffinType>("standard");
  const [includeFlowers, setIncludeFlowers] = useState(true);
  const [includeVehicles, setIncludeVehicles] = useState(true);
  const [includeCatering, setIncludeCatering] = useState(false);

  const estimate = useMemo((): Costs => {
    const m = SERVICE_MULTIPLIER[serviceSize];
    return {
      funeralDirector: scale(FUNERAL_DIRECTOR_BASE[funeralType], m),
      venueFee: VENUE_FEE[funeralType],
      coffin: COFFIN_COSTS[coffinType],
      flowers: includeFlowers ? FLOWERS[serviceSize] : [0, 0],
      vehicles: includeVehicles ? VEHICLES[serviceSize] : [0, 0],
      catering: includeCatering ? CATERING[serviceSize] : [0, 0],
      death_certs: [55, 110],
      misc: [100, 300],
    };
  }, [funeralType, serviceSize, coffinType, includeFlowers, includeVehicles, includeCatering]);

  const total: [number, number] = Object.values(estimate).reduce(
    (acc, val) => add(acc as [number, number], val as [number, number]),
    [0, 0] as [number, number]
  ) as [number, number];

  const breakdown = [
    { label: "Funeral director fees", range: estimate.funeralDirector },
    { label: "Burial / cremation fee", range: estimate.venueFee },
    { label: "Coffin", range: estimate.coffin },
    { label: "Flowers", range: estimate.flowers, optional: true },
    { label: "Funeral vehicles", range: estimate.vehicles, optional: true },
    { label: "Catering / wake", range: estimate.catering, optional: true },
    { label: "Death certificates", range: estimate.death_certs },
    { label: "Miscellaneous", range: estimate.misc },
  ].filter((item) => item.range[1] > 0);

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Funeral Cost Estimator</h1>
            <p className="text-slate-500">
              Understand the likely cost of a funeral before making any commitments. Figures are typical UK ranges for 2024.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Controls */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Type of funeral</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <OptionCard
                    selected={funeralType === "cremation"}
                    onClick={() => setFuneralType("cremation")}
                    note="Most common in the UK – around 80% of funerals"
                  >
                    Cremation
                  </OptionCard>
                  <OptionCard
                    selected={funeralType === "burial"}
                    onClick={() => setFuneralType("burial")}
                    note="Traditional burial in a churchyard or municipal cemetery"
                  >
                    Burial
                  </OptionCard>
                  <OptionCard
                    selected={funeralType === "direct-cremation"}
                    onClick={() => setFuneralType("direct-cremation")}
                    note="No service — the most affordable option. Growing rapidly in the UK."
                  >
                    Direct Cremation (no service)
                  </OptionCard>
                </div>
              </CardContent>
            </Card>

            {funeralType !== "direct-cremation" && (
              <Card>
                <CardHeader>
                  <CardTitle>Service size</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {(["small", "medium", "large"] as ServiceSize[]).map((s) => (
                      <OptionCard key={s} selected={serviceSize === s} onClick={() => setServiceSize(s)}>
                        {s === "small" ? "Small" : s === "medium" ? "Medium" : "Large"}
                        <div className="text-xs text-slate-400 font-normal mt-0.5">
                          {s === "small" ? "Under 20 guests" : s === "medium" ? "20–60 guests" : "60+ guests"}
                        </div>
                      </OptionCard>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Coffin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: "simple", label: "Simple / Basic", note: "Chipboard or basic wood" },
                    { value: "standard", label: "Standard", note: "Solid wood veneer" },
                    { value: "premium", label: "Premium", note: "Hardwood, oak or mahogany" },
                    { value: "eco", label: "Eco / Natural", note: "Wicker, bamboo, or cardboard" },
                  ] as { value: CoffinType; label: string; note: string }[]).map((opt) => (
                    <OptionCard
                      key={opt.value}
                      selected={coffinType === opt.value}
                      onClick={() => setCoffinType(opt.value)}
                      note={opt.note}
                    >
                      {opt.label}
                    </OptionCard>
                  ))}
                </div>
              </CardContent>
            </Card>

            {funeralType !== "direct-cremation" && (
              <Card>
                <CardHeader>
                  <CardTitle>Optional extras</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { key: "flowers", label: "Flowers", value: includeFlowers, set: setIncludeFlowers },
                      { key: "vehicles", label: "Funeral vehicles (hearse + limousine)", value: includeVehicles, set: setIncludeVehicles },
                      { key: "catering", label: "Catering / wake", value: includeCatering, set: setIncludeCatering },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.value}
                          onChange={(e) => item.set(e.target.checked)}
                          className="w-4 h-4 rounded border-stone-300"
                        />
                        <span className="text-sm text-slate-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Result */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PoundSterling className="h-5 w-5 text-emerald-600" />
                    Estimated Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <p className="text-3xl font-bold text-slate-900">
                      {fmt(total[0])} – {fmt(total[1])}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">Typical UK range for your selections</p>
                  </div>

                  <div className="space-y-2 mt-4">
                    {breakdown.map((item) => (
                      <div key={item.label} className="flex items-center justify-between text-sm">
                        <span className={cn("text-slate-600", item.optional && "text-slate-400")}>
                          {item.label}
                          {item.optional && " (optional)"}
                        </span>
                        <span className="font-medium text-slate-800">
                          {item.range[0] === 0 && item.range[1] === 0
                            ? "Included"
                            : item.range[0] === item.range[1]
                            ? fmt(item.range[0])
                            : `${fmt(item.range[0])}–${fmt(item.range[1])}`}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-stone-200 pt-2 flex items-center justify-between text-sm font-semibold">
                      <span className="text-slate-800">Total range</span>
                      <span className="text-slate-900">
                        {fmt(total[0])} – {fmt(total[1])}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-emerald-800">Cost-saving tips</p>
                <ul className="text-sm text-emerald-700 space-y-1 list-disc pl-4">
                  <li>Get at least 3 quotes from funeral directors</li>
                  {funeralType === "burial" && <li>Direct cremation can save £2,000–£4,000 vs. a full service</li>}
                  <li>The FCA requires funeral directors to provide clear pricing</li>
                  <li>Consider a simple coffin — most are the same quality internally</li>
                  {includeCatering && <li>DIY catering at home can save £300–£1,500 vs. a venue</li>}
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-2">
                <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  These are estimates only. Actual costs vary by region and provider. Always request a written itemised quote.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
