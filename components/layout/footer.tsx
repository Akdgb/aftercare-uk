import Link from "next/link";
import { ChevronRight, Phone } from "lucide-react";

/** Slim footer: support helplines first, then the essentials. */
export function Footer() {
  return (
    <footer className="print:hidden border-t border-stone-200/70 pb-24 md:pb-0">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 text-sm text-ink-600">
        <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
          <p className="font-medium text-ink-800 md:w-44 shrink-0">Need help now?</p>
          <p className="flex items-start gap-2">
            <Phone className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              Call <a href="tel:999" className="font-semibold text-ink-900 underline underline-offset-2">999</a> in an
              emergency, or <a href="tel:111" className="font-semibold text-ink-900 underline underline-offset-2">111</a>{" "}
              for urgent NHS help, including with your mental health.
            </span>
          </p>
          <Link href="/help/support" className="flex items-center gap-1 font-medium text-ink-800 hover:text-ink-900 md:ml-auto">
            Getting support <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-5 text-xs text-ink-500">
          <Link href="/about" className="hover:text-ink-900">About</Link>
          <Link href="/privacy" className="hover:text-ink-900">Privacy</Link>
          <Link href="/accessibility" className="hover:text-ink-900">Accessibility</Link>
          <span>General guidance, not legal or financial advice.</span>
        </div>
      </div>
    </footer>
  );
}
