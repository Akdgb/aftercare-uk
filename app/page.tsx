import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { ResumeRedirect } from "./resume-redirect";

// One screen, one button. People who already have a plan are taken straight to it.
export default function HomePage() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[radial-gradient(ellipse_at_top,#e2ebe7_0%,transparent_60%)]">
      <ResumeRedirect />
      <header className="max-w-5xl w-full mx-auto px-5 h-16 flex items-center justify-between">
        <Logo />
        <Link href="/auth/signin" className="text-sm font-medium text-ink-700 px-3 py-2 rounded-lg hover:bg-white/70">
          Sign in
        </Link>
      </header>

      <main className="flex-1 flex items-center">
        <div className="max-w-xl w-full mx-auto px-5 py-10 text-center animate-fade-up">
          <h1 className="text-4xl sm:text-5xl font-semibold text-ink-900 leading-[1.1]">
            We&apos;ll help you with
            <br />
            <span className="text-ink-600">what comes next.</span>
          </h1>
          <p className="text-lg text-ink-600 mt-5">
            When someone close to you has died, there&apos;s a lot to sort out. Answer a few gentle questions and
            we&apos;ll give you a step-by-step checklist. Free and private.
          </p>
          <Link
            href="/intake"
            className="mt-9 w-full sm:w-auto sm:min-w-80 inline-flex items-center justify-center gap-2 bg-ink-700 text-white text-lg font-medium px-8 py-4 rounded-2xl shadow-lg shadow-ink-900/10 hover:bg-ink-800 active:scale-[0.99] transition-all"
          >
            Start <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-5 text-sm text-ink-500">
            Just need an answer?{" "}
            <Link href="/help" className="font-medium text-ink-800 underline underline-offset-4">
              Browse help
            </Link>
          </p>
        </div>
      </main>

      <footer className="max-w-5xl w-full mx-auto px-5 py-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ink-500">
        <a href="tel:08088081677" className="flex items-center gap-1.5 hover:text-ink-900">
          <Phone className="h-3.5 w-3.5" /> Cruse 0808 808 1677
        </a>
        <a href="tel:116123" className="flex items-center gap-1.5 hover:text-ink-900">
          <Phone className="h-3.5 w-3.5" /> Samaritans 116 123
        </a>
        <Link href="/privacy" className="hover:text-ink-900">Privacy</Link>
      </footer>
    </div>
  );
}
