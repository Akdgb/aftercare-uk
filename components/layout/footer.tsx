import Link from "next/link";
import { ChevronRight, Phone } from "lucide-react";

/** Slim footer: support helplines first, then the essentials. */
export function Footer() {
  return (
    <footer className="print:hidden border-t border-stone-200/70 pb-24 md:pb-0">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 text-sm text-ink-600">
        <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
          <p className="font-medium text-ink-800 md:w-44 shrink-0">Need someone to talk to?</p>
          <a href="tel:08088081677" className="flex items-start gap-2 hover:text-ink-900">
            <Phone className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              <strong className="text-ink-900">Cruse Bereavement Support</strong>{" "}
              <span className="whitespace-nowrap">0808 808 1677</span>
              <span className="block text-xs text-ink-500">Free grief helpline. In Scotland, call Cruse Scotland on 0808 802 6161</span>
            </span>
          </a>
          <a href="tel:116123" className="flex items-start gap-2 hover:text-ink-900">
            <Phone className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              <strong className="text-ink-900">Samaritans</strong> <span className="whitespace-nowrap">116 123</span>
              <span className="block text-xs text-ink-500">Free, any time, day or night, if you are struggling to cope</span>
            </span>
          </a>
          <Link href="/help/support" className="flex items-center gap-1 font-medium text-ink-800 hover:text-ink-900 md:ml-auto">
            More support <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-5 text-xs text-ink-500">
          <Link href="/about" className="hover:text-ink-900">About</Link>
          <Link href="/privacy" className="hover:text-ink-900">Privacy</Link>
          <Link href="/accessibility" className="hover:text-ink-900">Accessibility</Link>
          <span>General guidance, not legal or financial advice. If someone is in danger, call 999.</span>
        </div>
      </div>
    </footer>
  );
}
