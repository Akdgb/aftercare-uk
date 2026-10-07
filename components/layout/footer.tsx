import Link from "next/link";
import { Phone } from "lucide-react";

/** Slim footer: support helplines first, then the essentials. */
export function Footer() {
  return (
    <footer className="print:hidden border-t border-stone-200/70 pb-24 md:pb-0">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-8 text-sm text-ink-600">
        <p className="font-medium text-ink-800">Need someone to talk to?</p>
        <a href="tel:08088081677" className="flex items-center gap-2 hover:text-ink-900">
          <Phone className="h-4 w-4" /> Cruse <strong className="text-ink-900">0808 808 1677</strong>
        </a>
        <a href="tel:116123" className="flex items-center gap-2 hover:text-ink-900">
          <Phone className="h-4 w-4" /> Samaritans 24/7 <strong className="text-ink-900">116 123</strong>
        </a>
        <span className="md:ml-auto flex gap-4 text-xs text-ink-500">
          <Link href="/privacy" className="hover:text-ink-900">Privacy</Link>
          <span>Guidance only — not legal advice</span>
        </span>
      </div>
    </footer>
  );
}
