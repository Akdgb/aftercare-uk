"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  ExternalLink,
  Home,
  Pencil,
  Phone,
  PoundSterling,
  Printer,
  Scale,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
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
  /** Where "Edit answers" goes; omit to hide it (e.g. for invited family). */
  editHref?: string;
  /** Extra controls on the "Up next" card (e.g. who's doing it). */
  renderUpNextExtras?: (task: ActionPlanTask) => React.ReactNode;
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
  renderUpNextExtras,
  editHref,
  extraFilter,
}: PlanViewProps) {
  const [view, setView] = useState<View>("todo");
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
  // The "Up next" queue: open tasks in stage order, with any the person said
  // "Not yet" to moved to the back (for this visit).
  const [notYet, setNotYet] = useState<string[]>([]);
  const open = sortByStage(tasks).filter((t) => t.status !== "completed");
  const queue = [
    ...open.filter((t) => !notYet.includes(t.id)),
    ...notYet.map((id) => open.find((t) => t.id === id)).filter((t): t is (typeof open)[number] => Boolean(t)),
  ];
  const nextTask = queue[0];
  const later = () => {
    if (!nextTask || queue.length < 2) return;
    setNotYet((prev) => [...prev.filter((id) => id !== nextTask.id), nextTask.id]);
  };

  const visible = tasks.filter(
    (t) =>
      (view === "all" ||
        (view === "done" ? t.status === "completed" : t.status !== "completed" || recentlyDone.has(t.id))) &&
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-5 sm:pt-8 sm:pb-7 print:py-2">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              
              <h1 className="text-2xl sm:text-4xl font-semibold text-ink-900 break-words">{name || "Your plan"}</h1>
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
              {editHref && (
                <Link
                  href={editHref}
                  className="print:hidden inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-ink-700 underline underline-offset-4 decoration-ink-300 hover:decoration-ink-700"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit answers
                </Link>
              )}
              <p className="text-sm sm:text-base text-ink-600 mt-3 max-w-xl print:hidden">
                {encouragement(done, tasks.length)}
              </p>
            </div>
            <ProgressRing done={done} total={tasks.length} />
          </div>
          {headerActions && <div className="flex flex-wrap items-center gap-2 mt-4 print:hidden">{headerActions}</div>}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 print:py-4">
        <div className={cn("grid gap-8", sidebar && "lg:grid-cols-[minmax(0,1fr)_300px]")}>
          <div className="min-w-0 space-y-6">

            {/* ── Up next ──────────────────────────────────────────────── */}
            {nextTask ? (
              <section aria-labelledby="up-next" className="print:hidden relative">
                {/* Stacked cards behind hint that more are coming */}
                {queue.length > 2 && (
                  <div className="absolute inset-x-6 -bottom-3 h-full rounded-2xl bg-ink-800/25" aria-hidden="true" />
                )}
                {queue.length > 1 && (
                  <div className="absolute inset-x-3 -bottom-1.5 h-full rounded-2xl bg-ink-800/50" aria-hidden="true" />
                )}
                <div
                  key={nextTask.id}
                  className="relative overflow-hidden rounded-2xl bg-ink-800 text-white p-6 sm:p-7 shadow-lg animate-card-in"
                >
                  <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/5" aria-hidden="true" />
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p id="up-next" className="text-xs font-semibold uppercase tracking-wider text-ink-200">
                      Up next
                    </p>
                    <p className="text-xs text-ink-200 tabular-nums">{queue.length} to do</p>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold leading-snug">{nextTask.title}</h2>
                  <p className="text-ink-100/90 mt-2 leading-relaxed max-w-2xl">{nextTask.description}</p>
                  {(nextTask.link || nextTask.phone) && (
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-sm">
                      {nextTask.link && (
                        <a
                          href={nextTask.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-medium text-white underline underline-offset-4 decoration-white/40 hover:decoration-white"
                        >
                          How to do it <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {nextTask.phone && (
                        <a
                          href={`tel:${nextTask.phone.replace(/\s/g, "")}`}
                          className="inline-flex items-center gap-1.5 font-medium text-white underline underline-offset-4 decoration-white/40 hover:decoration-white"
                        >
                          <Phone className="h-3.5 w-3.5" /> {nextTask.phone}
                        </a>
                      )}
                    </div>
                  )}
                  {renderUpNextExtras && <div className="mt-4">{renderUpNextExtras(nextTask)}</div>}
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <button
                      onClick={() => toggleTask(nextTask.id, "completed")}
                      className="inline-flex items-center justify-center gap-2 bg-white text-ink-900 font-semibold py-3.5 rounded-xl hover:bg-ink-50 active:scale-[0.98] transition-all"
                    >
                      <Check className="h-5 w-5" /> I&apos;ve done this
                    </button>
                    <button
                      onClick={later}
                      disabled={queue.length < 2}
                      className="inline-flex items-center justify-center gap-2 font-semibold py-3.5 rounded-xl border border-white/30 hover:bg-white/10 active:scale-[0.98] transition-all disabled:opacity-40"
                    >
                      Not yet <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
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

            {banner && <div className="print:hidden">{banner}</div>}

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
            <button
              onClick={() => window.print()}
              className="print:hidden inline-flex items-center gap-2 text-sm text-ink-600 hover:text-ink-900"
            >
              <Printer className="h-4 w-4" /> Print or save as PDF
            </button>
          </div>

          {/* ── Side column ───────────────────────────────────────────── */}
          {sidebar && <aside className="space-y-4 print:hidden">
            {sidebar}
          </aside>}
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
    <div className="relative w-16 h-16 sm:w-28 sm:h-28 shrink-0" role="img" aria-label={`${done} of ${total} tasks done`}>
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
