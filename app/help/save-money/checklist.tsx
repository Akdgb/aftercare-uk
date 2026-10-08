"use client";
import { useMemo } from "react";
import Link from "next/link";
import { BackLink } from "@/components/layout/back-link";
import { Check, ExternalLink, PiggyBank } from "lucide-react";
import { useLocalStorage } from "@/lib/use-local-storage";
import { cn } from "@/lib/utils";

/*
 * Savings are deliberately rough, rounded-down figures based on published UK
 * averages (SunLife Cost of Dying Report 2026: traditional funeral £4,510,
 * direct cremation £1,628) and the ranges in our cost estimator.
 */
type Idea = { id: string; title: string; how: string; saving: number; link?: { href: string; label: string } };

const IDEAS: Idea[] = [
  {
    id: "compare",
    title: "Compare prices from at least 3 funeral directors",
    how: "Every funeral director has to show a Standardised Price List in their premises and on their website. The same funeral can cost hundreds of pounds more at one firm than another. Ask for a written, itemised quote before agreeing to anything.",
    saving: 500,
    link: { href: "/resources", label: "Find funeral directors near you" },
  },
  {
    id: "direct",
    title: "Choose a direct cremation, then hold your own memorial",
    how: "The cremation happens without a service. You can then hold a gathering wherever and whenever suits the family, for example at home, at a place of worship, or in another country.",
    saving: 2500,
  },
  {
    id: "slot",
    title: "Ask for an early-morning weekday slot",
    how: "Crematoria often charge less for the first slots of the day and more at weekends.",
    saving: 150,
  },
  {
    id: "coffin",
    title: "Pick a simple coffin",
    how: "There is no legal minimum coffin. Crematoria and cemeteries set their own rules, and a simple or eco coffin is usually accepted. You do not have to choose from the funeral director's brochure.",
    saving: 400,
  },
  {
    id: "cars",
    title: "Use family cars instead of limousines",
    how: "The hearse is usually needed, but following cars are optional.",
    saving: 300,
  },
  {
    id: "flowers",
    title: "Do the flowers yourselves",
    how: "Flowers from a supermarket or garden, arranged by the family, can look lovely. You could also ask for donations to a charity instead.",
    saving: 150,
  },
  {
    id: "wake",
    title: "Hold the wake at home or a community hall",
    how: "Ask family and friends to bring a dish. Church and community halls are often cheap to hire.",
    saving: 300,
  },
  {
    id: "notices",
    title: "Share notices online instead of in the newspaper",
    how: "A free online notice or a family WhatsApp message reaches people faster than a paid newspaper notice.",
    saving: 100,
    link: { href: "/help/memorials", label: "Free notice and memorial sites" },
  },
];

const HELP = [
  {
    title: "Funeral Expenses Payment",
    body: "If you get certain benefits, you may be able to get help with necessary burial or cremation fees plus up to £1,000 towards other costs (England, Wales and Northern Ireland). Claim within 6 months of the funeral. In Scotland, ask about the Funeral Support Payment.",
    href: "https://www.gov.uk/funeral-payments",
  },
  {
    title: "Children's Funeral Fund (England)",
    body: "For a child under 18, or a baby stillborn after 24 weeks, buried or cremated in England. It covers burial or cremation fees plus up to £300 towards a coffin. It is not means tested, and the funeral director usually claims it. Wales and Northern Ireland have their own schemes.",
    href: "https://www.gov.uk/child-funeral-costs",
  },
  {
    title: "Check for a funeral plan or life insurance",
    body: "Look through their papers and bank statements for a pre-paid funeral plan or an insurance policy that pays out.",
  },
  {
    title: "Ask the bank about paying the funeral invoice",
    body: "Many banks will pay a funeral invoice from the deceased's account if you show it. Ask the bank.",
  },
];

const STORE_KEY = "aftercare_saving_ideas";

export function SaveMoneyChecklist() {
  const [raw, setRaw] = useLocalStorage(STORE_KEY);
  const chosen = useMemo(() => {
    try {
      return new Set<string>(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set<string>();
    }
  }, [raw]);
  const total = IDEAS.filter((i) => chosen.has(i.id)).reduce((sum, i) => sum + i.saving, 0);

  const toggle = (id: string) => {
    const next = new Set(chosen);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setRaw(JSON.stringify([...next]));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-40">
      <BackLink />
      <h1 className="text-3xl font-semibold text-ink-900 mt-3">Save money on the funeral</h1>
      <p className="text-ink-600 mt-2">
        A traditional UK funeral costs about <strong className="text-ink-900">£4,500</strong> on average. A respectful
        funeral does not have to cost this much. Tick the ideas you would like to use to see roughly how much you could save.
      </p>

      <ul className="mt-6 space-y-3">
        {IDEAS.map((idea) => {
          const on = chosen.has(idea.id);
          return (
            <li key={idea.id}>
              <div
                className={cn(
                  "rounded-2xl border-2 bg-white p-4 transition-colors",
                  on ? "border-emerald-500" : "border-stone-200"
                )}
              >
                <button onClick={() => toggle(idea.id)} className="w-full flex items-start gap-3 text-left" aria-pressed={on}>
                  <span
                    className={cn(
                      "mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                      on ? "bg-emerald-600 border-emerald-600" : "border-stone-300"
                    )}
                  >
                    {on && <Check className="h-3.5 w-3.5 text-white animate-pop" strokeWidth={3} />}
                  </span>
                  <span className="flex-1">
                    <span className="flex items-start justify-between gap-3">
                      <span className="font-semibold text-ink-900 leading-snug">{idea.title}</span>
                      <span className="text-sm font-semibold text-emerald-700 whitespace-nowrap">
                        ~£{idea.saving.toLocaleString("en-GB")}
                      </span>
                    </span>
                    <span className="block text-sm text-ink-600 mt-1 leading-relaxed">{idea.how}</span>
                  </span>
                </button>
                {idea.link && (
                  <Link href={idea.link.href} className="inline-block ml-9 mt-2 text-sm font-medium text-ink-700 underline underline-offset-4">
                    {idea.link.label}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <h2 className="font-sans text-sm font-semibold text-ink-500 uppercase tracking-wide mt-10 mb-3">
        Help paying for it
      </h2>
      <ul className="bg-white border border-stone-200 rounded-2xl divide-y divide-stone-100">
        {HELP.map((h) => (
          <li key={h.title} className="p-4">
            <p className="font-medium text-ink-900">{h.title}</p>
            <p className="text-sm text-ink-600 mt-1">{h.body}</p>
            {h.href && (
              <a href={h.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-ink-700 underline underline-offset-4">
                Official guidance <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </li>
        ))}
      </ul>
      <p className="text-xs text-ink-500 mt-4">
        Savings are rough estimates based on published UK averages. Your quotes will differ. AfterCare is not paid by
        any funeral director or company we mention.
      </p>

      {/* Running total sits above the phone tab bar */}
      <div className="fixed inset-x-0 bottom-[4.5rem] md:bottom-0 z-30 bg-ink-800 text-white">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <PiggyBank className="h-6 w-6 shrink-0 text-emerald-300" />
          <p className="flex-1 text-sm">
            {total > 0 ? (
              <>
                You could save around <strong className="text-lg">£{total.toLocaleString("en-GB")}</strong>
              </>
            ) : (
              "Tick ideas above to see how much you could save"
            )}
          </p>
          <Link href="/cost-estimator" className="text-sm font-medium underline underline-offset-4 shrink-0">
            Estimate costs
          </Link>
        </div>
      </div>
    </div>
  );
}
