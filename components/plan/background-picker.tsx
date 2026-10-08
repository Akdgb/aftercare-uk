"use client";
import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { REGIONS } from "@/lib/cultures";
import { cn } from "@/lib/utils";

/**
 * Two-level picker: choose a region, then one or more specific backgrounds.
 * Regions with a selection stay open so people can see what they chose.
 */
export function BackgroundPicker({
  value,
  onChange,
  other,
  onOtherChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  other: string;
  onOtherChange: (text: string) => void;
}) {
  const [open, setOpen] = useState<Set<string>>(
    () => new Set(REGIONS.filter((r) => r.backgrounds.some((b) => value.includes(b.id))).map((r) => r.id))
  );
  const toggleRegion = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  return (
    <div className="space-y-2">
      {REGIONS.map((r) => {
        const count = r.backgrounds.filter((b) => value.includes(b.id)).length;
        const isOpen = open.has(r.id);
        const groups = [...new Set(r.backgrounds.map((b) => b.group ?? ""))];
        return (
          <div key={r.id} className={cn("rounded-2xl border-2 bg-white", count ? "border-ink-700" : "border-stone-200")}>
            <button
              type="button"
              onClick={() => toggleRegion(r.id)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
            >
              <span className="font-medium text-ink-900">{r.label}</span>
              <span className="flex items-center gap-2">
                {count > 0 && (
                  <span className="text-xs font-semibold bg-ink-700 text-white rounded-full px-2 py-0.5">{count} chosen</span>
                )}
                <ChevronDown className={cn("h-5 w-5 text-ink-400 transition-transform", isOpen && "rotate-180")} />
              </span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 space-y-3">
                {groups.map((g) => (
                  <fieldset key={g || "all"}>
                    {g && <legend className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-1.5">{g}</legend>}
                    <div className="flex flex-wrap gap-2">
                      {r.backgrounds
                        .filter((b) => (b.group ?? "") === g)
                        .map((b) => {
                          const on = value.includes(b.id);
                          return (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => toggle(b.id)}
                              aria-pressed={on}
                              className={cn(
                                "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-sm font-medium transition-colors",
                                on ? "bg-ink-700 border-ink-700 text-white" : "bg-white border-stone-300 text-ink-800 hover:border-ink-400"
                              )}
                            >
                              {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                              {b.label}
                            </button>
                          );
                        })}
                    </div>
                  </fieldset>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <label className="block pt-2">
        <span className="block text-sm font-medium text-ink-700 mb-1.5">Not listed? Describe it in your own words (optional)</span>
        <input
          value={other}
          maxLength={100}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder="For example, Tigrinya or Mauritian Creole"
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-transparent"
        />
      </label>
    </div>
  );
}
