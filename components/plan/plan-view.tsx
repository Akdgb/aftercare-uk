"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Calculator,
  Check,
  ChevronDown,
  ExternalLink,
  Heart,
  Home,
  MessageCircleQuestion,
  Phone,
  PoundSterling,
  Printer,
  Scale,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateActionPlan } from "@/lib/action-plan";
import { cn, formatDate } from "@/lib/utils";
import type { ActionPlanTask, IntakeFormData } from "@/types";

export type TaskStatus = ActionPlanTask["status"];

const CATEGORY_META: Record<ActionPlanTask["category"], { label: string; icon: React.ElementType; chip: string }> = {
  immediate: { label: "Immediate", icon: Zap, chip: "bg-rose-50 text-rose-700" },
  legal: { label: "Legal", icon: Scale, chip: "bg-violet-50 text-violet-700" },
  financial: { label: "Money", icon: PoundSterling, chip: "bg-emerald-50 text-emerald-700" },
  government: { label: "Government", icon: Building2, chip: "bg-sky-50 text-sky-700" },
  housing: { label: "Home", icon: Home, chip: "bg-amber-50 text-amber-800" },
  personal: { label: "Personal", icon: User, chip: "bg-stone-100 text-ink-700" },
};

// Stages read like GOV.UK's "step by step" guides: when, and why
const STAGES: { priority: ActionPlanTask["priority"]; title: string; subtitle: string }[] = [
  { priority: "urgent", title: "First few days", subtitle: "Things with legal deadlines, or that can't wait" },
  { priority: "this-week", title: "This week", subtitle: "Tell the organisations that need to know" },
  { priority: "this-month", title: "This month", subtitle: "Money, property and the estate" },
  { priority: "future", title: "When you're ready", subtitle: "No rush — come back to these later" },
];

const CATEGORIES = Object.keys(CATEGORY_META) as ActionPlanTask["category"][];
type View = "todo" | "all" | "done";

interface PlanViewProps {
  intake: IntakeFormData;
  statuses: Record<string, string>;
  onToggle: (taskId: string, next: TaskStatus) => void;
  /** Rendered next to the Print button (e.g. "Shared with you"). */
  headerActions?: React.ReactNode;
  /** Rendered above the tasks (e.g. "save your plan" prompt). */
  banner?: React.ReactNode;
  /** Extra panels in the side column (e.g. family members). */
  sidebar?: React.ReactNode;
  /** Extra controls shown when a task is opened (e.g. assignee and notes). */
  renderTaskExtras?: (task: ActionPlanTask) => React.ReactNode;
  /** Small summary shown on the collapsed task row (e.g. who's doing it). */
  renderTaskMeta?: (task: ActionPlanTask) => React.ReactNode;
  /** Optional extra filter, e.g. "assigned to me". */
  extraFilter?: { label: string; test: (task: ActionPlanTask) => boolean };
}

export function PlanView({
  intake,
  statuses,
  onToggle,
  headerActions,
  banner,
  sidebar,
  renderTaskExtras,
  renderTaskMeta,
  extraFilter,
}: PlanViewProps) {
  const [view, setView] = useState<View>("todo");
  const [category, setCategory] = useState<ActionPlanTask["category"] | "all">("all");
  const [onlyExtra, setOnlyExtra] = useState(false);
  const [openTasks, setOpenTasks] = useState<Set<string>>(new Set());
  const [collapsedStages, setCollapsedStages] = useState<Set<string>>(new Set());
  // Tasks ticked while viewing "To do" stay visible (struck through) until the
  // view changes, so an accidental tick is easy to see and undo.
  const [recentlyDone, setRecentlyDone] = useState<Set<string>>(new Set());

  const changeView = (next: View) => {
    setView(next);
    setRecentlyDone(new Set());
  };

  const toggleTask = (id: string, next: TaskStatus) => {
    if (next === "completed") setRecentlyDone((prev) => new Set(prev).add(id));
    onToggle(id, next);
  };

  const tasks = useMemo(
    () =>
      generateActionPlan(intake).map((t) => ({
        ...t,
        status: (statuses[t.id] as TaskStatus) ?? "pending",
      })),
    [intake, statuses]
  );

  const done = tasks.filter((t) => t.status === "completed").length;
  const nextTask = sortByStage(tasks).find((t) => t.status !== "completed");

  const visible = tasks.filter(
    (t) =>
      (view === "all" ||
        (view === "done" ? t.status === "completed" : t.status !== "completed" || recentlyDone.has(t.id))) &&
      (category === "all" || t.category === category) &&
      (!onlyExtra || !extraFilter || extraFilter.test(t))
  );

  const toggleOpen = (id: string) =>
    setOpenTasks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleStage = (key: string) =>
    setCollapsedStages((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const name = `${intake.deceasedFirstName} ${intake.deceasedLastName}`.trim();
  const daysSince = intake.dateOfDeath
    ? Math.max(0, Math.floor((Date.parse(new Date().toDateString()) - Date.parse(intake.dateOfDeath)) / 86_400_000))
    : null;

  return (
    <div className="min-h-screen print:bg-white">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-white to-stone-50 border-b border-stone-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-7 print:py-2">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <p className="text-sm text-ink-500 mb-1 flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5" /> A plan for
              </p>
              <h1 className="text-3xl sm:text-4xl font-semibold text-ink-900 break-words">{name || "Your plan"}</h1>
              {intake.dateOfDeath && (
                <p className="text-sm text-ink-500 mt-2">
                  Died {formatDate(intake.dateOfDeath)}
                  {daysSince !== null && daysSince <= 365 && (
                    <span className="text-ink-400">
                      {" "}
                      · {daysSince === 0 ? "today" : daysSince === 1 ? "yesterday" : `${daysSince} days ago`}
                    </span>
                  )}
                </p>
              )}
              <p className="text-ink-600 mt-4 max-w-xl print:hidden">{encouragement(done, tasks.length)}</p>
            </div>
            <ProgressRing done={done} total={tasks.length} />
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-5 print:hidden">
            {headerActions}
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print or save as PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:py-4">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-8">
          <div className="min-w-0 space-y-6">
            {banner && <div className="print:hidden">{banner}</div>}

            {/* ── Up next ──────────────────────────────────────────────── */}
            {nextTask ? (
              <section
                aria-labelledby="up-next"
                className="print:hidden relative overflow-hidden rounded-2xl bg-ink-800 text-white p-6 sm:p-7 shadow-lg"
              >
                <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/5" aria-hidden="true" />
                <p id="up-next" className="text-xs font-semibold uppercase tracking-wider text-ink-200 mb-2">
                  Up next
                </p>
                <h2 className="text-xl sm:text-2xl font-semibold leading-snug">{nextTask.title}</h2>
                <p className="text-ink-100/90 mt-2 leading-relaxed max-w-2xl">{nextTask.description}</p>
                <div className="flex flex-wrap items-center gap-3 mt-5">
                  <button
                    onClick={() => toggleTask(nextTask.id, "completed")}
                    className="inline-flex items-center gap-2 bg-white text-ink-900 font-medium px-5 py-2.5 rounded-xl hover:bg-ink-50 active:scale-[0.98] transition-all"
                  >
                    <Check className="h-4 w-4" /> I&apos;ve done this
                  </button>
                  {nextTask.link && (
                    <a
                      href={nextTask.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-xl border border-white/25 hover:bg-white/10"
                    >
                      How to do it <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {nextTask.phone && (
                    <a
                      href={`tel:${nextTask.phone.replace(/\s/g, "")}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-xl border border-white/25 hover:bg-white/10"
                    >
                      <Phone className="h-3.5 w-3.5" /> {nextTask.phone}
                    </a>
                  )}
                </div>
              </section>
            ) : (
              <section className="print:hidden rounded-2xl bg-emerald-50 border border-emerald-200 p-6 sm:p-7 text-center">
                <Sparkles className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
                <h2 className="text-xl font-semibold text-emerald-900">Everything on this plan is done</h2>
                <p className="text-emerald-800 mt-2 max-w-md mx-auto">
                  That&apos;s a huge amount to have worked through. Please look after yourself — support is there if
                  you need it.
                </p>
              </section>
            )}

            {/* ── Toolbar ─────────────────────────────────────────────── */}
            <div className="print:hidden space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div role="tablist" aria-label="Show tasks" className="inline-flex p-1 bg-stone-100 rounded-xl">
                  {(
                    [
                      ["todo", `To do · ${tasks.length - done}`],
                      ["done", `Done · ${done}`],
                      ["all", "All"],
                    ] as [View, string][]
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      role="tab"
                      aria-selected={view === key}
                      onClick={() => changeView(key)}
                      className={cn(
                        "px-4 py-1.5 text-sm rounded-lg transition-all",
                        view === key ? "bg-white text-ink-900 font-medium shadow-sm" : "text-ink-600 hover:text-ink-900"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {extraFilter && (
                  <label className="inline-flex items-center gap-2 text-sm text-ink-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-ink-700"
                      checked={onlyExtra}
                      onChange={(e) => setOnlyExtra(e.target.checked)}
                    />
                    {extraFilter.label}
                  </label>
                )}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" aria-label="Filter by type">
                {(["all", ...CATEGORIES] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    aria-pressed={category === c}
                    className={cn(
                      "shrink-0 px-3 py-1.5 text-sm rounded-full border transition-colors",
                      category === c
                        ? "bg-ink-700 border-ink-700 text-white"
                        : "bg-white border-stone-200 text-ink-600 hover:border-ink-300"
                    )}
                  >
                    {c === "all" ? "Everything" : CATEGORY_META[c].label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Stages ──────────────────────────────────────────────── */}
            <ol className="relative space-y-4">
              {STAGES.map((stage, index) => {
                const all = tasks.filter((t) => t.priority === stage.priority);
                if (all.length === 0) return null;
                const shown = visible.filter((t) => t.priority === stage.priority);
                const stageDone = all.filter((t) => t.status === "completed").length;
                const complete = stageDone === all.length;
                const collapsed = collapsedStages.has(stage.priority);

                return (
                  <li key={stage.priority} className="relative print:break-inside-avoid-page">
                    <div className="rounded-2xl bg-white border border-stone-200/80 shadow-[0_1px_2px_rgba(24,42,38,0.04)] overflow-hidden">
                      <button
                        onClick={() => toggleStage(stage.priority)}
                        aria-expanded={!collapsed}
                        className="w-full flex items-center gap-4 p-4 sm:p-5 text-left hover:bg-stone-50/60 transition-colors"
                      >
                        <span
                          className={cn(
                            "w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold",
                            complete ? "bg-emerald-600 text-white" : "bg-ink-100 text-ink-800"
                          )}
                        >
                          {complete ? <Check className="h-4 w-4 animate-pop" /> : index + 1}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block font-semibold text-ink-900">{stage.title}</span>
                          <span className="block text-sm text-ink-500">{stage.subtitle}</span>
                        </span>
                        <span className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                          <span className="text-xs text-ink-500">
                            {stageDone} of {all.length} done
                          </span>
                          <span className="w-24 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                            <span
                              className="block h-full bg-emerald-500 rounded-full transition-all duration-500"
                              style={{ width: `${(stageDone / all.length) * 100}%` }}
                            />
                          </span>
                        </span>
                        <ChevronDown
                          className={cn("h-5 w-5 text-ink-400 transition-transform shrink-0", collapsed && "-rotate-90")}
                        />
                      </button>

                      {!collapsed && (
                        <div className="border-t border-stone-100">
                          {shown.length === 0 ? (
                            <p className="px-5 py-4 text-sm text-ink-500">
                              {view === "todo" && complete
                                ? "All done here. ✓"
                                : "Nothing here matches the current filter."}
                            </p>
                          ) : (
                            <ul className="divide-y divide-stone-100">
                              {shown.map((task) => (
                                <TaskRow
                                  key={task.id}
                                  task={task}
                                  open={openTasks.has(task.id)}
                                  onOpen={() => toggleOpen(task.id)}
                                  onToggle={() =>
                                    toggleTask(task.id, task.status === "completed" ? "pending" : "completed")
                                  }
                                  meta={renderTaskMeta?.(task)}
                                  extras={renderTaskExtras?.(task)}
                                />
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* ── Side column ───────────────────────────────────────────── */}
          <aside className="space-y-4 print:hidden">
            {sidebar}
            <div className="rounded-2xl bg-white border border-stone-200/80 p-5">
              <p className="text-sm font-semibold text-ink-900 mb-3">Helpful tools</p>
              <div className="space-y-1">
                {[
                  { href: "/financial-support", label: "Check what money help you can get", icon: PoundSterling },
                  { href: "/cost-estimator", label: "Estimate funeral costs", icon: Calculator },
                  { href: "/resources", label: "Find local services", icon: Building2 },
                  { href: "/assistant", label: "Ask a question", icon: MessageCircleQuestion },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex items-center gap-3 text-sm text-ink-700 hover:text-ink-900 hover:bg-stone-50 px-3 py-2.5 -mx-3 rounded-xl transition-colors"
                    >
                      <span className="w-8 h-8 rounded-lg bg-ink-50 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-ink-600" />
                      </span>
                      <span className="flex-1">{item.label}</span>
                      <ArrowRight className="h-4 w-4 text-ink-300 group-hover:text-ink-600 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="rounded-2xl bg-ink-50 border border-ink-100 p-5">
              <p className="text-sm font-semibold text-ink-900">Go at your own pace</p>
              <p className="text-sm text-ink-600 mt-1.5 leading-relaxed">
                Only the first few tasks have deadlines. Everything else can wait until you&apos;re ready.
              </p>
            </div>
          </aside>
        </div>

        <p className="hidden print:block text-xs text-ink-500 mt-8">
          Printed from AfterCare UK. This plan is guidance only and does not constitute legal or financial advice.
        </p>
      </div>
    </div>
  );
}

function sortByStage<T extends ActionPlanTask>(tasks: T[]): T[] {
  const order = STAGES.map((s) => s.priority);
  return [...tasks].sort((a, b) => order.indexOf(a.priority) - order.indexOf(b.priority));
}

function encouragement(done: number, total: number): string {
  if (total === 0) return "";
  if (done === 0) return "There's a lot here, but you don't have to do it all at once. Start with the first step below.";
  if (done === total) return "Every task is done. Take care of yourself.";
  const pct = done / total;
  if (pct < 0.34) return "You've made a start. One step at a time.";
  if (pct < 0.75) return "You're making real progress. The hardest deadlines are usually the first few.";
  return "Nearly there — just a few things left.";
}

function ProgressRing({ done, total }: { done: number; total: number }) {
  const pct = total ? done / total : 0;
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-20 h-20 sm:w-28 sm:h-28 shrink-0" role="img" aria-label={`${done} of ${total} tasks done`}>
      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#e4dfd3" strokeWidth="7" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="#2c4640"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg sm:text-2xl font-semibold text-ink-900 leading-none">
          {done}
          <span className="text-ink-400 text-base font-normal">/{total}</span>
        </span>
        <span className="text-[11px] text-ink-500 mt-1">done</span>
      </div>
    </div>
  );
}

function TaskRow({
  task,
  open,
  onOpen,
  onToggle,
  meta,
  extras,
}: {
  task: ActionPlanTask;
  open: boolean;
  onOpen: () => void;
  onToggle: () => void;
  meta?: React.ReactNode;
  extras?: React.ReactNode;
}) {
  const cat = CATEGORY_META[task.category];
  const done = task.status === "completed";

  return (
    <li className={cn("group transition-colors print:break-inside-avoid", open && "bg-stone-50/60")}>
      <div className="flex items-start gap-3 px-4 sm:px-5 py-3.5">
        <button
          onClick={onToggle}
          className={cn(
            "mt-0.5 w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-all",
            done
              ? "bg-emerald-600 border-emerald-600 text-white"
              : "border-stone-300 text-transparent hover:border-emerald-500 hover:text-emerald-500"
          )}
          aria-label={done ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
        >
          <Check className={cn("h-3.5 w-3.5", done && "animate-pop")} strokeWidth={3} />
        </button>
        <button onClick={onOpen} aria-expanded={open} className="flex-1 min-w-0 text-left">
          <span className="flex items-start justify-between gap-3">
            <span
              className={cn(
                "font-medium leading-snug transition-colors",
                done ? "text-ink-400 line-through decoration-ink-300" : "text-ink-900"
              )}
            >
              {task.title}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 mt-1 text-ink-300 group-hover:text-ink-500 shrink-0 transition-transform print:hidden",
                open && "rotate-180"
              )}
            />
          </span>
          <span className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full", cat.chip)}>
              <cat.icon className="h-3 w-3" /> {cat.label}
            </span>
            {meta}
          </span>
        </button>
      </div>

      {/* Details: always printed, shown on screen when opened */}
      <div className={cn("pl-[3.25rem] sm:pl-14 pr-4 sm:pr-5 pb-4 -mt-1", open ? "block animate-fade-up" : "hidden print:block")}>
        <p className="text-sm text-ink-600 leading-relaxed">{task.description}</p>
        {(task.link || task.phone) && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {task.link && (
              <a
                href={task.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-700 bg-white border border-stone-200 hover:border-ink-300 px-3 py-1.5 rounded-lg"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="print:hidden">Official guidance</span>
                <span className="hidden print:inline">{task.link}</span>
              </a>
            )}
            {task.phone && (
              <a
                href={`tel:${task.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-700 bg-white border border-stone-200 hover:border-ink-300 px-3 py-1.5 rounded-lg"
              >
                <Phone className="h-3.5 w-3.5" /> {task.phone}
              </a>
            )}
          </div>
        )}
        {extras && <div className="print:hidden">{extras}</div>}
      </div>
    </li>
  );
}
