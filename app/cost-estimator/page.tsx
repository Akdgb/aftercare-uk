"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Info, PiggyBank, PoundSterling } from "lucide-react";
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

// Ranges informed by the SunLife Cost of Dying Report 2026 (2025 data) and published funeral director price lists.
// SunLife 2026 averages: traditional funeral £4,510 (burial about £5,440, cremation about £4,200),
// simple attended funeral £3,828, direct cremation £1,628.
const FUNERAL_DIRECTOR_BASE: Record<FuneralType, [number, number]> = {
  burial: [2000, 3800],       // Funeral director professional fees for a burial
  cremation: [1700, 3200],    // Funeral director professional fees for a cremation
  "direct-cremation": [795, 1895], // Typical range of direct cremation packages (SunLife 2026 average £1,628)
};

const VENUE_FEE: Record<FuneralType, [number, number]> = {
  burial: [800, 3500],        // Cemetery fees vary widely; London about £2,000 to £6,000
  cremation: [500, 1200],     // Crematorium fees vary by provider and area
  "direct-cremation": [0, 0],
};

const COFFIN_COSTS: Record<CoffinType, [number, number]> = {
  simple: [250, 700],
  standard: [700, 1600],
  premium: [1600, 4500],
  eco: [400, 1100],           // Wicker, bamboo, or biodegradable
};

const SERVICE_MULTIPLIER: Record<ServiceSize, number> = {
  small: 1,
  medium: 1.22,
  large: 1.5,
};

const FLOWERS: Record<ServiceSize, [number, number]> = {
  small: [0, 180],
  medium: [180, 550],
  large: [550, 1200],
};

const VEHICLES: Record<ServiceSize, [number, number]> = {
  small: [0, 350],
  medium: [350, 750],
  large: [750, 1800],
};

const CATERING: Record<ServiceSize, [number, number]> = {
  small: [0, 300],
  medium: [250, 900],
  large: [900, 2500],
};

// Death certificates: £12.50 each in England and Wales when bought at registration (fees may change from 9 November 2026).
// Many families need 5 to 10 copies.
// Probate fee (not included in this estimate): £526 for estates over £5,000 since 13 July 2026; no fee at £5,000 or less.

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
        ? "border-ink-700 bg-ink-50 text-ink-800"
        : "border-stone-200 bg-white text-ink-500 hover:border-stone-300"
    )}
  >
    <div>{children}</div>
    {note && <div className="text-xs font-normal mt-0.5 text-ink-400">{note}</div>}
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
      death_certs: [63, 125],  // £12.50 each x 5 to 10 copies (England and Wales)
      misc: [100, 300],
    };
  }, [funeralType, serviceSize, coffinType, includeFlowers, includeVehicles, includeCatering]);

  const total: [number, number] = Object.values(estimate).reduce(
    (acc, val) => add(acc as [number, number], val as [number, number]),
    [0, 0] as [number, number]
  ) as [number, number];

  const breakdown = [
    { label: "Funeral director fees", range: estimate.funeralDirector },
    { label: "Burial or cremation fee", range: estimate.venueFee },
    { label: "Coffin", range: estimate.coffin },
    { label: "Flowers", range: estimate.flowers, optional: true },
    { label: "Funeral vehicles", range: estimate.vehicles, optional: true },
    { label: "Catering or wake", range: estimate.catering, optional: true },
    { label: "Death certificates", range: estimate.death_certs },
    { label: "Miscellaneous", range: estimate.misc },
  ].filter((item) => item.range[1] > 0);

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="bg-gradient-to-b from-white to-stone-50 border-b border-stone-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-semibold text-ink-900 mb-2">Estimate funeral costs</h1>
            <p className="text-ink-500">
              Understand the likely cost of a funeral before making any commitments. Figures are typical UK price ranges. Ask for a written, itemised quote.
            </p>
            <Link
              href="/help/save-money"
              className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-ink-800 bg-ink-50 border border-ink-200 px-3.5 py-2 rounded-xl hover:bg-ink-100"
            >
              <PiggyBank className="h-4 w-4" /> See simple ways to save
            </Link>
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
                    note="The most common choice in the UK, around 80% of funerals"
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
                    note="No service at the crematorium. The most affordable option, chosen for about 1 in 5 funerals."
                  >
                    Direct cremation (no service)
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
                        <div className="text-xs text-ink-400 font-normal mt-0.5">
                          {s === "small" ? "Under 20 guests" : s === "medium" ? "20 to 60 guests" : "More than 60 guests"}
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
                    { value: "simple", label: "Simple", note: "Chipboard or basic wood" },
                    { value: "standard", label: "Standard", note: "Solid wood veneer" },
                    { value: "premium", label: "Premium", note: "Hardwood, oak or mahogany" },
                    { value: "eco", label: "Eco or natural", note: "Wicker, bamboo, or cardboard" },
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
                      { key: "vehicles", label: "Funeral vehicles (hearse and limousine)", value: includeVehicles, set: setIncludeVehicles },
                      { key: "catering", label: "Catering or wake", value: includeCatering, set: setIncludeCatering },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.value}
                          onChange={(e) => item.set(e.target.checked)}
                          className="w-4 h-4 rounded border-stone-300"
                        />
                        <span className="text-sm text-ink-700">{item.label}</span>
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
                    Estimated total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <p className="text-3xl sm:text-4xl font-semibold text-ink-900">
                      {fmt(total[0])} to {fmt(total[1])}
                    </p>
                    <p className="text-sm text-ink-500 mt-1">Typical UK range for your selections</p>
                  </div>

                  <div className="space-y-2 mt-4">
                    {breakdown.map((item) => (
                      <div key={item.label} className="flex items-center justify-between text-sm">
                        <span className={cn("text-ink-600", item.optional && "text-ink-400")}>
                          {item.label}
                          {item.optional && " (optional)"}
                        </span>
                        <span className="font-medium text-ink-800">
                          {item.range[0] === 0 && item.range[1] === 0
                            ? "Included"
                            : item.range[0] === item.range[1]
                            ? fmt(item.range[0])
                            : `${fmt(item.range[0])} to ${fmt(item.range[1])}`}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-stone-200 pt-2 flex items-center justify-between text-sm font-semibold">
                      <span className="text-ink-800">Total range</span>
                      <span className="text-ink-900">
                        {fmt(total[0])} to {fmt(total[1])}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-emerald-800">Cost-saving tips</p>
                <ul className="text-sm text-emerald-700 space-y-1 list-disc pl-4">
                  <li>Compare prices from more than one funeral director</li>
                  {funeralType === "burial" && <li>Direct cremation can save £2,000 to £4,000 compared with a full service</li>}
                  <li>Every funeral director has to show a Standardised Price List in their premises and on their website (CMA rules)</li>
                  <li>There is no legal minimum coffin. A simple or eco coffin is usually accepted.</li>
                  {includeCatering && <li>Catering at home can save £300 to £1,500 compared with a venue</li>}
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-2">
                <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  Figures are estimates informed by the SunLife Cost of Dying Report 2026. Costs in London and the South East are usually higher. Ask each funeral director for a written, itemised quote before you commit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
