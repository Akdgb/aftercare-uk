import Link from "next/link";
import { Phone } from "lucide-react";
import { Logo } from "@/components/layout/logo";

const COLUMNS = [
  {
    title: "Get started",
    links: [
      { href: "/intake", label: "Create your plan" },
      { href: "/family", label: "Share with family" },
      { href: "/financial-support", label: "Check money help" },
      { href: "/cost-estimator", label: "Estimate funeral costs" },
      { href: "/resources", label: "Find local services" },
    ],
  },
  {
    title: "Guidance",
    links: [
      { href: "/guidance/what-happens-after-someone-dies", label: "What happens first" },
      { href: "/guidance/registering-a-death", label: "Registering a death" },
      { href: "/guidance/funeral-costs-explained", label: "Funeral costs" },
      { href: "/guidance/probate-explained", label: "Probate explained" },
      { href: "/assistant", label: "Ask a question" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="print:hidden bg-ink-900 text-ink-200 mt-auto">
      {/* Emotional support signposting — shown on every page */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8 text-sm">
          <p className="text-white font-medium">Need someone to talk to?</p>
          <a href="tel:08088081677" className="flex items-center gap-2 hover:text-white">
            <Phone className="h-4 w-4" /> Cruse Bereavement Support <strong className="text-white">0808 808 1677</strong>
          </a>
          <a href="tel:116123" className="flex items-center gap-2 hover:text-white">
            <Phone className="h-4 w-4" /> Samaritans, 24/7 <strong className="text-white">116 123</strong>
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Logo inverted />
            <p className="mt-4 text-sm text-ink-300 leading-relaxed max-w-sm">
              A calm, step-by-step guide to everything that needs doing after someone dies — for families across the UK.
            </p>
            <p className="mt-4 text-xs text-ink-300/80 max-w-sm">
              Guidance only — not legal or financial advice. Always check official sources such as GOV.UK for your
              situation.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h2 className="font-sans text-white text-sm font-semibold mb-4">{col.title}</h2>
              <ul className="space-y-2.5">
                {col.links.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-ink-200 hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-ink-300">&copy; {new Date().getFullYear()} AfterCare UK</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-ink-300 hover:text-white">Privacy</Link>
            <Link href="/privacy#terms" className="text-xs text-ink-300 hover:text-white">Terms</Link>
            <Link href="/privacy#accessibility" className="text-xs text-ink-300 hover:text-white">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
