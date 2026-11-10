"use client";
import { useState } from "react";
import Link from "next/link";
import { BookOpen, Calculator, ChevronRight, ExternalLink, HeartHandshake, Landmark, PiggyBank, PoundSterling, Search } from "lucide-react";
import { ShareButton } from "@/components/share/share-button";

export type HelpItem = {
  href: string;
  title: string;
  desc: string;
  kind: "tool" | "guide" | "official";
  icon: "money" | "calc" | "book" | "heart" | "gov" | "save";
  /** Extra text to search, such as the body of a guide. */
  keywords?: string;
};

const ICONS = { money: PoundSterling, calc: Calculator, book: BookOpen, heart: HeartHandshake, gov: Landmark, save: PiggyBank };

const SAVE_MONEY: HelpItem = {
  href: "/help/save-money",
  title: "Save money on the funeral",
  desc: "Simple choices that can save thousands",
  kind: "tool",
  icon: "save",
};

export function HelpList({ tools, official, guides }: { tools: HelpItem[]; official: HelpItem[]; guides: HelpItem[] }) {
  const [q, setQ] = useState("");
  // Every word typed must appear somewhere in the item, so "funeral cost" finds "Funeral costs explained"
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const match = (i: HelpItem) => {
    const text = `${i.title} ${i.desc} ${i.keywords ?? ""}`.toLowerCase();
    return words.every((w) => text.includes(w));
  };
  const shownTools = tools.filter(match);
  const shownOfficial = official.filter(match);
  const shownGuides = guides.filter(match);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-10">
      <h1 className="text-3xl font-semibold text-ink-900">Help</h1>
      <div className="relative mt-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-500 pointer-events-none" aria-hidden="true" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search, for example probate"
          className="w-full rounded-2xl border border-stone-300 bg-white pl-12 pr-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-transparent"
          aria-label="Search help"
        />
      </div>

      {(shownTools.length > 0 || !q.trim()) && (
        <>
          <h2 className="font-sans text-lg font-semibold text-ink-900 mt-8 mb-2">Tools</h2>
          <ul className="bg-white border border-stone-200 rounded-2xl divide-y divide-stone-100 overflow-hidden">
            {[
              ...(!q.trim() || match(SAVE_MONEY) ? [SAVE_MONEY] : []),
              ...shownTools,
            ].map((t) => {
              const Icon = ICONS[t.icon];
              return (
                <li key={t.href}>
                  <Link href={t.href} className="flex items-center gap-3 px-4 py-3.5 hover:bg-stone-50">
                    <Icon className="h-5 w-5 text-ink-500 shrink-0" aria-hidden="true" />
                    <span className="flex-1 min-w-0">
                      <span className="block font-medium text-ink-900">{t.title}</span>
                      <span className="block text-sm text-ink-500">{t.desc}</span>
                    </span>
                    <ChevronRight className="h-5 w-5 text-ink-400 shrink-0" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
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
                  <Landmark className="h-5 w-5 text-ink-500 shrink-0" aria-hidden="true" />
                  <span className="flex-1 min-w-0">
                    <span className="block font-medium text-ink-900">{g.title}</span>
                    <span className="block text-sm text-ink-500">{g.desc}</span>
                  </span>
                  <ExternalLink className="h-4 w-4 text-ink-400 shrink-0" aria-hidden="true" />
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
                  <BookOpen className="h-5 w-5 text-ink-500 shrink-0" aria-hidden="true" />
                  <span className="flex-1 min-w-0">
                    <span className="block font-medium text-ink-900">{g.title}</span>
                    <span className="block text-sm text-ink-500">{g.desc}</span>
                  </span>
                  <ChevronRight className="h-5 w-5 text-ink-400 shrink-0" aria-hidden="true" />
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
