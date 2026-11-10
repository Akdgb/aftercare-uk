import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { ResumeRedirect } from "./resume-redirect";

const REASSURANCE = ["Free", "Private", "For all of the UK"];

// One screen, one main button. People who already have a plan are taken straight to it.
export default function HomePage() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[radial-gradient(120%_60%_at_50%_0%,#e7eee9_0%,transparent_70%)]">
      <header className="max-w-5xl w-full mx-auto px-5 h-16 flex items-center justify-between">
        <Logo />
        <Link href="/auth/signin" className="text-sm font-medium text-ink-700 px-3 py-2 rounded-lg hover:bg-white/70">
          Sign in
        </Link>
      </header>
      <ResumeRedirect />

      <main className="flex-1 flex items-center">
        <div className="max-w-xl w-full mx-auto px-5 py-12 text-center">
          <h1 className="text-[2.6rem] sm:text-6xl text-ink-900 leading-[1.05] animate-fade-up">
            We&apos;ll help you with <span className="italic text-ink-600">what comes next.</span>
          </h1>
          <p
            className="text-lg text-ink-700 mt-6 max-w-md mx-auto leading-relaxed text-pretty animate-fade-up [animation-delay:80ms] opacity-0"
          >
            When someone close to you has died, there is a lot to sort out. Answer a few gentle questions and get a
            step-by-step plan for what to do, in the right order.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 animate-fade-up [animation-delay:160ms] opacity-0">
            <Link
              href="/intake"
              className="group w-full sm:w-auto sm:min-w-80 inline-flex items-center justify-center gap-2 bg-ink-700 text-white text-lg font-semibold px-8 py-4 rounded-2xl shadow-[0_8px_24px_-12px_rgba(24,42,38,0.6)] hover:bg-ink-800"
            >
              Start your plan
              <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link
              href="/wellbeing"
              className="w-full sm:w-auto sm:min-w-80 inline-flex items-center justify-center bg-white/80 border border-stone-300 text-ink-800 text-base font-medium px-8 py-3.5 rounded-2xl hover:bg-white hover:border-ink-300"
            >
              It has been a while. I need support.
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-sm text-ink-600 animate-fade-up [animation-delay:240ms] opacity-0">
            {REASSURANCE.map((r) => (
              <li key={r} className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-ink-300" aria-hidden="true" />
                {r}
              </li>
            ))}
          </ul>

          <p className="mt-8 text-sm text-ink-500">
            Just need an answer?{" "}
            <Link href="/help" className="font-medium text-ink-800 underline underline-offset-4">
              Browse help
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
