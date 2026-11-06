"use client";
import { useState } from "react";
import { Printer } from "lucide-react";

export function LeafletForm() {
  const [org, setOrg] = useState("");
  const href = org.trim() ? `/leaflet?org=${encodeURIComponent(org.trim().slice(0, 60))}` : "/leaflet";
  return (
    <div className="not-prose bg-white border border-stone-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 sm:items-end">
      <label className="flex-1 block">
        <span className="block text-sm font-medium text-ink-700 mb-1.5">Your organisation&apos;s name (optional)</span>
        <input
          value={org}
          onChange={(e) => setOrg(e.target.value)}
          maxLength={60}
          placeholder="For example, Smith & Sons Funeral Directors"
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-400"
        />
      </label>
      <a
        href={href}
        className="inline-flex items-center justify-center gap-2 bg-ink-700 !text-white !no-underline font-medium px-5 py-3 rounded-xl hover:bg-ink-800"
      >
        <Printer className="h-4 w-4" /> Make the leaflet
      </a>
    </div>
  );
}
