"use client";
import { useState } from "react";
import Link from "next/link";
import { BookOpen, Calculator, ChevronRight, MapPin, MessageCircleQuestion, PoundSterling, Search } from "lucide-react";

export type HelpItem = {
  href: string;
  title: string;
  desc: string;
  kind: "tool" | "guide";
  icon: "money" | "calc" | "map" | "chat" | "book";
};

const ICONS = { money: PoundSterling, calc: Calculator, map: MapPin, chat: MessageCircleQuestion, book: BookOpen };

export function HelpList({ tools, guides }: { tools: HelpItem[]; guides: HelpItem[] }) {
  const [q, setQ] = useState("");
  const match = (i: HelpItem) => (i.title + " " + i.desc).toLowerCase().includes(q.trim().toLowerCase());
  const shownTools = tools.filter(match);
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

      {shownTools.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mt-6">
          {shownTools.map((t) => {
            const Icon = ICONS[t.icon];
            return (
              <Link
                key={t.href}
                href={t.href}
                className="rounded-2xl bg-white border border-stone-200 p-4 hover:border-ink-300 active:scale-[0.99] transition-all"
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

      {shownGuides.length > 0 && (
        <>
          <h2 className="font-sans text-sm font-semibold text-ink-500 uppercase tracking-wide mt-8 mb-2">Guides</h2>
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

      {shownTools.length + shownGuides.length === 0 && (
        <div className="text-center mt-10">
          <p className="text-ink-600">Nothing matches &ldquo;{q}&rdquo;.</p>
          <Link
            href="/assistant"
            className="inline-flex mt-4 bg-ink-700 text-white font-medium px-5 py-3 rounded-xl hover:bg-ink-800"
          >
            Ask it as a question
          </Link>
        </div>
      )}
    </div>
  );
}
