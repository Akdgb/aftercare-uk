import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { ResumeRedirect } from "./resume-redirect";

// One screen, one button. People who already have a plan are taken straight to it.
export default function HomePage() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-stone-50">
      <ResumeRedirect />
      <header className="max-w-5xl w-full mx-auto px-5 h-16 flex items-center justify-between">
        <Logo />
        <Link href="/auth/signin" className="text-sm font-medium text-ink-700 px-3 py-2 rounded-lg hover:bg-white">
          Sign in
        </Link>
      </header>

      <main className="flex-1 flex items-center">
        <div className="max-w-xl w-full mx-auto px-5 py-10">
          <h1 className="text-4xl sm:text-5xl text-ink-900 leading-tight">What to do after someone dies</h1>
          <p className="text-lg text-ink-700 mt-4 max-w-prose">
            When someone close to you has died, there is a lot to sort out. Answer a few questions and get a
            step-by-step plan for your family. Free and private.
          </p>
          <Link
            href="/intake"
            className="mt-8 w-full sm:w-auto sm:min-w-72 inline-flex items-center justify-center bg-ink-700 text-white text-lg font-semibold px-8 py-4 rounded-xl hover:bg-ink-800"
          >
            Start your plan
          </Link>
          <Link
            href="/wellbeing"
            className="mt-3 w-full sm:w-auto sm:min-w-72 sm:ml-3 inline-flex items-center justify-center bg-white border border-stone-300 text-ink-800 text-base font-semibold px-8 py-3.5 rounded-xl hover:border-ink-400"
          >
            It has been a while. I need support.
          </Link>
          <p className="mt-5 text-sm text-ink-500">
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
