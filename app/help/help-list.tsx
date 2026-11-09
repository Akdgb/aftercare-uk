"use client";
import { useState } from "react";
import Link from "next/link";
import { BookOpen, Calculator, ChevronRight, ExternalLink, HeartHandshake, Landmark, PiggyBank, PoundSterling, Search } from "lucide-react";
import { ShareButton } from "@/components/share/share-button";
import { cn } from "@/lib/utils";

export type HelpItem = {
  href: string;
  title: string;
  desc: string;
  kind: "tool" | "guide" | "official";
  icon: "money" | "calc" | "book" | "heart" | "gov";
};

const ICONS = { money: PoundSterling, calc: Calculator, book: BookOpen, heart: HeartHandshake, gov: Landmark };

export function HelpList({ tools, official, guides }: { tools: HelpItem[]; official: HelpItem[]; guides: HelpItem[] }) {
  const [q, setQ] = useState("");
  const match = (i: HelpItem) => (i.title + " " + i.desc).toLowerCase().includes(q.trim().toLowerCase());
  const shownTools = tools.filter(match);
  const shownOfficial = official.filter(match);
  const shownGuides = guides.filter(match);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-10">
      <h1 className="text-3xl font-semibold text-ink-900">Help</h1>
      <div className="relative mt-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400 pointer-events-none" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search, e.g. probate, pension, certificate"
          className="w-full rounded-2xl border border-stone-300 bg-white pl-12 pr-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-transparent"
          aria-label="Search help"
        />
      </div>

      {!q.trim() && (
        <Link
          href="/help/save-money"
          className="mt-6 flex items-center gap-4 rounded-2xl bg-ink-800 text-white p-5 hover:bg-ink-900 active:scale-[0.99] transition-all"
        >
          <span className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <PiggyBank className="h-6 w-6" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-lg font-semibold leading-snug">Save money on the funeral</span>
            <span className="block text-sm text-ink-100/90">Simple choices that can save thousands</span>
          </span>
          <ChevronRight className="h-5 w-5 text-white/70 shrink-0" />
        </Link>
      )}

      {shownTools.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mt-6">
          {shownTools.map((t, i) => {
            const Icon = ICONS[t.icon];
            // An odd last tile fills the row instead of leaving a gap
            const wide = shownTools.length % 2 === 1 && i === shownTools.length - 1;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  "rounded-2xl bg-white border border-stone-200 p-4 hover:border-ink-300 active:scale-[0.99] transition-all",
                  wide && "col-span-2"
                )}
              >
                <span className="w-10 h-10 rounded-xl bg-ink-700 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-white" />
                </span>
                <span className="block font-semibold text-ink-900 mt-3 leading-snug">{t.title}</span>
                <span className="block text-sm text-ink-500 mt-0.5 leading-snug">{t.desc}</span>
              </Link>
            );
          })}
        </div>
      )}

      {shownOfficial.length > 0 && (
        <>
          <h2 className="font-sans text-lg font-semibold text-ink-900 mt-8 mb-2">
            Official government services
          </h2>
          <ul className="bg-white border border-stone-200 rounded-2xl divide-y divide-stone-100 overflow-hidden">
            {shownOfficial.map((g) => (
              <li key={g.href}>
                <a href={g.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3.5 hover:bg-stone-50">
                  <Landmark className="h-5 w-5 text-ink-400 shrink-0" />
                  <span className="flex-1 min-w-0">
                    <span className="block font-medium text-ink-900">{g.title}</span>
                    <span className="block text-sm text-ink-500">{g.desc}</span>
                  </span>
                  <ExternalLink className="h-4 w-4 text-ink-300 shrink-0" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}

      {shownGuides.length > 0 && (
        <>
          <h2 className="font-sans text-lg font-semibold text-ink-900 mt-8 mb-2">Guides</h2>
          <ul className="bg-white border border-stone-200 rounded-2xl divide-y divide-stone-100 overflow-hidden">
            {shownGuides.map((g) => (
              <li key={g.href}>
                <Link href={g.href} className="flex items-center gap-3 px-4 py-3.5 hover:bg-stone-50">
                  <BookOpen className="h-5 w-5 text-ink-400 shrink-0" />
                  <span className="flex-1 min-w-0">
                    <span className="block font-medium text-ink-900">{g.title}</span>
                    <span className="block text-sm text-ink-500">{g.desc}</span>
                  </span>
                  <ChevronRight className="h-5 w-5 text-ink-300 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {!q.trim() && <ShareButton className="mt-8" />}

      {shownTools.length + shownOfficial.length + shownGuides.length === 0 && (
        <div className="text-center mt-10">
          <p className="text-ink-600">Nothing on AfterCare matches &ldquo;{q}&rdquo;.</p>
          <a
            href={`https://www.gov.uk/search/all?keywords=${encodeURIComponent(q.trim())}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 bg-ink-700 text-white font-medium px-5 py-3 rounded-xl hover:bg-ink-800"
          >
            Search GOV.UK for &ldquo;{q.trim()}&rdquo; <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      )}
    </div>
  );
}
