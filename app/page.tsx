import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  Check,
  ClipboardList,
  Clock,
  FileText,
  Landmark,
  Lock,
  MapPin,
  MessageCircleQuestion,
  PoundSterling,
  Stethoscope,
  Users,
} from "lucide-react";

const FIRST_STEPS = [
  {
    icon: Stethoscope,
    title: "Get the medical certificate",
    body: "A doctor confirms the cause of death. In hospital, staff will explain how this works.",
  },
  {
    icon: FileText,
    title: "Register the death within 5 days",
    body: "Book an appointment at a local register office (8 days in Scotland).",
    href: "/guidance/registering-a-death",
  },
  {
    icon: Users,
    title: "Choose a funeral director",
    body: "There's no rush to pick the first one. Prices vary a lot, so compare a few.",
    href: "/cost-estimator",
  },
];

const HOW = [
  { icon: ClipboardList, title: "Answer a few gentle questions", body: "About 3 minutes. No account needed." },
  { icon: Check, title: "Get your step-by-step plan", body: "Only the tasks that apply to you, in the order they matter." },
  { icon: Users, title: "Work through it together", body: "Tick things off, share tasks with family, and get reminders." },
];

const TOOLS = [
  { icon: BookOpen, title: "Plain-English guidance", body: "Registering a death, probate, funerals and more — explained simply.", href: "/guidance" },
  { icon: PoundSterling, title: "Money help checker", body: "See which government payments you may be able to claim.", href: "/financial-support" },
  { icon: Calculator, title: "Funeral cost estimator", body: "Get a realistic idea of costs before you speak to anyone.", href: "/cost-estimator" },
  { icon: MapPin, title: "Find local services", body: "Register offices, funeral directors and crematoriums near you.", href: "/resources" },
  { icon: Users, title: "Share with family", body: "Invite family by email so everyone knows who's doing what.", href: "/family" },
  { icon: MessageCircleQuestion, title: "Ask a question", body: "Get a clear answer to the thing you're unsure about.", href: "/assistant" },
];

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative">
        <div
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,#e2ebe7_0%,transparent_55%)]"
          aria-hidden="true"
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 sm:pt-20 sm:pb-24 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 text-sm text-ink-700 bg-white/80 border border-stone-200 rounded-full px-3 py-1 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Free for families across the UK
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold text-ink-900 leading-[1.08]">
              Know what to do next, one step at a time.
            </h1>
            <p className="text-lg text-ink-600 mt-6 max-w-xl leading-relaxed">
              When someone dies there&apos;s suddenly a lot to sort out. AfterCare turns it into a simple, personal
              checklist — so nothing important is missed, and you can share the load.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link
                href="/intake"
                className="inline-flex items-center justify-center gap-2 bg-ink-700 text-white font-medium px-6 py-3.5 rounded-xl shadow-sm hover:bg-ink-800 transition-colors"
              >
                Start your plan <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/guidance/what-happens-after-someone-dies"
                className="inline-flex items-center justify-center gap-2 bg-white border border-stone-300 text-ink-800 font-medium px-6 py-3.5 rounded-xl hover:border-ink-300 hover:bg-ink-50 transition-colors"
              >
                What happens first?
              </Link>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 mt-7 text-sm text-ink-600">
              {[
                [Clock, "About 3 minutes"],
                [Lock, "No sign-up to start"],
                [Landmark, "Based on GOV.UK guidance"],
              ].map(([Icon, label]) => {
                const I = Icon as React.ElementType;
                return (
                  <li key={label as string} className="flex items-center gap-1.5">
                    <I className="h-4 w-4 text-ink-400" /> {label as string}
                  </li>
                );
              })}
            </ul>
          </div>

          <PlanPreview />
        </div>
      </section>

      {/* ── If someone has just died ──────────────────────────────────── */}
      <section className="bg-white border-y border-stone-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
            <div>
              <p className="text-sm font-medium text-ink-500 mb-1">If someone has just died</p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-ink-900">The three things to do first</h2>
            </div>
            <Link href="/guidance/what-happens-after-someone-dies" className="text-sm font-medium text-ink-700 hover:underline inline-flex items-center gap-1">
              Read the full guide <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ol className="grid md:grid-cols-3 gap-4">
            {FIRST_STEPS.map((step, i) => {
              const Icon = step.icon;
              const body = (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-8 h-8 rounded-full bg-ink-700 text-white text-sm font-semibold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <Icon className="h-5 w-5 text-ink-400" />
                  </div>
                  <h3 className="font-semibold text-ink-900">{step.title}</h3>
                  <p className="text-sm text-ink-600 mt-1.5 leading-relaxed">{step.body}</p>
                </>
              );
              return (
                <li key={step.title}>
                  {step.href ? (
                    <Link href={step.href} className="block h-full rounded-2xl bg-stone-50 border border-stone-200/80 p-6 hover:border-ink-300 hover:bg-ink-50/50 transition-colors">
                      {body}
                    </Link>
                  ) : (
                    <div className="h-full rounded-2xl bg-stone-50 border border-stone-200/80 p-6">{body}</div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl sm:text-3xl font-semibold text-ink-900 text-center">How AfterCare helps</h2>
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {HOW.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="text-center">
                <div className="relative w-14 h-14 mx-auto rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-center">
                  <Icon className="h-6 w-6 text-ink-700" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-ink-700 text-white text-xs font-semibold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-semibold text-ink-900 mt-5">{step.title}</h3>
                <p className="text-sm text-ink-600 mt-1.5 max-w-xs mx-auto">{step.body}</p>
              </div>
            );
          })}
        </div>
        <div className="text-center mt-12">
          <Link
            href="/intake"
            className="inline-flex items-center gap-2 bg-ink-700 text-white font-medium px-6 py-3.5 rounded-xl hover:bg-ink-800 transition-colors"
          >
            Create my plan <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Tools ──────────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-stone-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-2xl sm:text-3xl font-semibold text-ink-900">Everything in one calm place</h2>
          <p className="text-ink-600 mt-2 max-w-2xl">Use the plan on its own, or dip into the tools when you need them.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group rounded-2xl border border-stone-200/80 bg-stone-50/50 p-6 hover:bg-white hover:border-ink-200 hover:shadow-[0_8px_24px_-12px_rgba(24,42,38,0.18)] transition-all"
                >
                  <span className="w-11 h-11 rounded-xl bg-ink-50 group-hover:bg-ink-700 flex items-center justify-center transition-colors">
                    <Icon className="h-5 w-5 text-ink-700 group-hover:text-white transition-colors" />
                  </span>
                  <h3 className="font-semibold text-ink-900 mt-4 flex items-center gap-1.5">
                    {tool.title}
                    <ArrowRight className="h-4 w-4 text-ink-300 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-sm text-ink-600 mt-1.5 leading-relaxed">{tool.body}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Promises (honest, no testimonials until we have real ones) ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            ["Free to use", "Creating and sharing a plan costs nothing."],
            ["Private by default", "Your plan is only visible to you and the family you invite. We never sell data."],
            ["Grounded in official guidance", "Steps link to GOV.UK and other official sources so you can check for yourself."],
          ].map(([title, body]) => (
            <div key={title} className="flex gap-3">
              <Check className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-ink-900">{title}</p>
                <p className="text-sm text-ink-600 mt-1">{body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl bg-ink-800 text-white px-6 py-12 sm:px-12 text-center relative overflow-hidden">
          <div className="absolute -left-20 -bottom-24 w-72 h-72 rounded-full bg-white/5" aria-hidden="true" />
          <h2 className="text-2xl sm:text-3xl font-semibold relative">You don&apos;t have to work it all out alone.</h2>
          <p className="text-ink-100/90 mt-3 max-w-lg mx-auto relative">
            Answer a few questions and we&apos;ll show you exactly what to do, and when.
          </p>
          <Link
            href="/intake"
            className="relative inline-flex items-center gap-2 bg-white text-ink-900 font-medium px-6 py-3.5 rounded-xl mt-8 hover:bg-ink-50 transition-colors"
          >
            Start your plan <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

/** Decorative preview of the plan screen, so people see what they'll get. */
function PlanPreview() {
  const rows: [string, string, boolean][] = [
    ["Register the death", "bg-rose-50 text-rose-700", true],
    ["Contact a funeral director", "bg-rose-50 text-rose-700", true],
    ["Use the Tell Us Once service", "bg-sky-50 text-sky-700", false],
    ["Notify the bank", "bg-emerald-50 text-emerald-700", false],
  ];
  return (
    <div className="relative hidden sm:block" aria-hidden="true">
      <div className="absolute -inset-6 bg-ink-100/60 rounded-[2rem] rotate-2" />
      <div className="relative bg-white rounded-3xl border border-stone-200 shadow-[0_24px_60px_-24px_rgba(24,42,38,0.35)] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-ink-500">A plan for</p>
            <p className="font-display text-xl font-semibold text-ink-900">Margaret Okafor</p>
          </div>
          <div className="relative w-14 h-14">
            <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
              <circle cx="20" cy="20" r="16" fill="none" stroke="#e4dfd3" strokeWidth="4" />
              <circle cx="20" cy="20" r="16" fill="none" stroke="#2c4640" strokeWidth="4" strokeLinecap="round" strokeDasharray="100.5" strokeDashoffset="70" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-ink-800">7/23</span>
          </div>
        </div>
        <div className="mt-5 rounded-2xl bg-ink-800 text-white p-4">
          <p className="text-[10px] uppercase tracking-wider text-ink-200">Up next</p>
          <p className="font-display font-semibold mt-1">Use the Tell Us Once service</p>
          <span className="inline-flex items-center gap-1 mt-3 text-xs bg-white text-ink-900 px-3 py-1.5 rounded-lg">
            <Check className="h-3 w-3" /> I&apos;ve done this
          </span>
        </div>
        <p className="text-sm font-semibold text-ink-900 mt-5 mb-2">First few days</p>
        <ul className="divide-y divide-stone-100">
          {rows.map(([title, chip, done]) => (
            <li key={title} className="flex items-center gap-3 py-2.5">
              <span
                className={
                  done
                    ? "w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center"
                    : "w-5 h-5 rounded-full border-2 border-stone-300"
                }
              >
                {done && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
              </span>
              <span className={done ? "text-sm text-ink-400 line-through" : "text-sm text-ink-800"}>{title}</span>
              <span className={`ml-auto w-10 h-4 rounded-full ${chip}`} />
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-stone-100">
          {["bg-blue-500", "bg-emerald-500", "bg-amber-500"].map((c) => (
            <span key={c} className={`w-6 h-6 rounded-full ${c} border-2 border-white -ml-1 first:ml-0`} />
          ))}
          <span className="text-xs text-ink-500 ml-1">Shared with 2 family members</span>
        </div>
      </div>
    </div>
  );
}
