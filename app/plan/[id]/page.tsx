"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, MessageSquare, Send, Trash2, UserPlus, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlanView, type TaskStatus } from "@/components/plan/plan-view";
import { cn } from "@/lib/utils";
import { getFaiths } from "@/lib/faith";
import type { ActionPlanTask, IntakeFormData } from "@/types";

interface Member {
  email: string;
  name: string;
}

interface Comment {
  id: string;
  task_id: string;
  author_email: string;
  body: string;
  created_at: string;
}

interface PlanResponse {
  id: string;
  role: "owner" | "member";
  me: string;
  ownerEmail: string | null;
  intake_data: IntakeFormData;
  task_statuses: Record<string, string>;
  task_assignees: Record<string, string>;
  members: Member[];
  comments: Comment[];
}

async function api(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
  return data;
}

export default function SavedPlanPage() {
  const { id: planId } = useParams<{ id: string }>();
  const router = useRouter();
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saveCounter = useRef(0);

  // Bumped when the tab regains focus so family members see each other's changes
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api(`/api/plan/${planId}`).then(
      (data) => !cancelled && setPlan(data),
      () =>
        !cancelled &&
        setLoadError(
          "We could not find this plan. It may have been deleted, or it has not been shared with this email address."
        )
    );
    return () => {
      cancelled = true;
    };
  }, [planId, version]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") setVersion((v) => v + 1);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  const patchTask = async (body: Record<string, unknown>, optimistic: (p: PlanResponse) => PlanResponse) => {
    if (!plan) return;
    const previous = plan;
    setPlan(optimistic(plan));
    setSaveState("saving");
    try {
      await api(`/api/plan/${planId}`, { method: "PATCH", body: JSON.stringify(body) });
      setSaveState("saved");
    } catch {
      setPlan(previous);
      setSaveState("error");
    }
    // Hide the confirmation after a moment, unless another save started since
    const thisSave = ++saveCounter.current;
    setTimeout(() => {
      if (saveCounter.current === thisSave) setSaveState("idle");
    }, 2500);
  };

  const toggle = (taskId: string, status: TaskStatus) =>
    patchTask({ taskId, status }, (p) => ({ ...p, task_statuses: { ...p.task_statuses, [taskId]: status } }));

  const assign = (taskId: string, assignee: string | null) =>
    patchTask({ taskId, assignee }, (p) => {
      const next = { ...p.task_assignees };
      if (assignee) next[taskId] = assignee;
      else delete next[taskId];
      return { ...p, task_assignees: next };
    });

  if (loadError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-ink-600 mb-6">{loadError}</p>
          <div className="flex justify-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline">My dashboard</Button>
            </Link>
            <Link href="/intake">
              <Button>Create a new plan</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-ink-400 mx-auto mb-3" />
          <p className="text-ink-500 text-sm">Loading your plan...</p>
        </div>
      </div>
    );
  }

  const people: Member[] = [
    ...(plan.ownerEmail ? [{ email: plan.ownerEmail, name: plan.role === "owner" ? "You" : plan.ownerEmail }] : []),
    ...plan.members.map((m) => (m.email === plan.me ? { ...m, name: `${m.name} (you)` } : m)),
  ];
  const nameFor = (email: string) => people.find((p) => p.email === email)?.name ?? email;

  return (
    <>
      <SaveToast state={saveState} />
      <PlanView
        intake={plan.intake_data}
        statuses={plan.task_statuses}
        editHref={plan.role === "owner" ? `/edit-answers?plan=${planId}` : undefined}
        onToggle={toggle}
        extraFilter={{ label: "Only tasks assigned to me", test: (t) => plan.task_assignees[t.id] === plan.me }}
        headerActions={
          <>
            {plan.role === "member" && (
              <span className="text-xs bg-stone-100 text-ink-600 px-2.5 py-1 rounded-full">Shared with you</span>
            )}
          </>
        }
        sidebar={
          <>
            <FamilyPanel plan={plan} onChange={(members) => setPlan({ ...plan, members })} />
            {plan.role === "owner" && (getFaiths(plan.intake_data).length > 0 || (plan.intake_data.backgrounds?.length ?? 0) > 0) && (
              <RemoveFaith
                planId={planId}
                onRemoved={() =>
                  setPlan({ ...plan, intake_data: { ...plan.intake_data, faith: "prefer-not-to-say", faiths: [], backgrounds: [], backgroundOther: undefined, faithConsent: false } })
                }
              />
            )}
            {plan.role === "owner" ? (
              <DeletePlan planId={planId} onDeleted={() => router.push("/dashboard")} />
            ) : (
              <LeavePlan planId={planId} me={plan.me} onLeft={() => router.push("/dashboard")} />
            )}
          </>
        }
        renderUpNextExtras={
          plan.members.length > 0
            ? (task) => (
                <label className="inline-flex items-center gap-2 text-sm text-ink-100">
                  Who&apos;s doing this?
                  <select
                    value={plan.task_assignees[task.id] ?? ""}
                    onChange={(e) => assign(task.id, e.target.value || null)}
                    className="bg-white/10 border border-white/25 rounded-lg px-2.5 py-1.5 text-white text-sm [&>option]:text-ink-900"
                  >
                    <option value="">Nobody yet</option>
                    {people.map((p) => (
                      <option key={p.email} value={p.email}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
              )
            : undefined
        }
        renderTaskMeta={(task) => {
          const who = plan.task_assignees[task.id];
          const notes = plan.comments.filter((c) => c.task_id === task.id).length;
          return (
            <>
              {who && (
                <span className="inline-flex items-center gap-1.5 text-xs text-ink-600">
                  <Avatar email={who} small /> {who === plan.me ? "You" : nameFor(who)}
                </span>
              )}
              {notes > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-ink-500">
                  <MessageSquare className="h-3 w-3" /> {notes}
                </span>
              )}
            </>
          );
        }}
        renderTaskExtras={(task) => (
          <TaskCollaboration
            task={task}
            planId={planId}
            people={people}
            assignee={plan.task_assignees[task.id] ?? null}
            nameFor={nameFor}
            comments={plan.comments.filter((c) => c.task_id === task.id)}
            onAssign={(email) => assign(task.id, email)}
            onComment={(c) => setPlan((p) => (p ? { ...p, comments: [...p.comments, c] } : p))}
          />
        )}
      />
    </>
  );
}

function FamilyPanel({ plan, onChange }: { plan: PlanResponse; onChange: (members: Member[]) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const isOwner = plan.role === "owner";

  const invite = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const data = await api(`/api/plan/${plan.id}/members`, {
        method: "POST",
        body: JSON.stringify({ name, email }),
      });
      onChange(data.members);
      setMessage({
        kind: "ok",
        text: data.emailSent
          ? `Invitation sent to ${email}.`
          : `${name} has been added, but the invitation email could not be sent. Ask them to sign in with ${email}.`,
      });
      setName("");
      setEmail("");
      setOpen(false);
    } catch (e) {
      setMessage({ kind: "error", text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (memberEmail: string) => {
    if (!confirm(`Remove ${memberEmail} from this plan? Any tasks assigned to them will be unassigned.`)) return;
    try {
      const data = await api(`/api/plan/${plan.id}/members?email=${encodeURIComponent(memberEmail)}`, {
        method: "DELETE",
      });
      onChange(data.members);
    } catch (e) {
      setMessage({ kind: "error", text: (e as Error).message });
    }
  };

  return (
    <div id="family" className="bg-white rounded-2xl border border-stone-200/80 p-5 scroll-mt-24">
      <div className="flex items-center gap-2 mb-1">
        <Users className="h-4 w-4 text-ink-500" />
        <p className="text-sm font-medium text-ink-700">Family</p>
      </div>
      <p className="text-xs text-ink-500 mb-3">
        Share the work. People you invite can tick off tasks, take on tasks and leave notes.
      </p>

      <ul className="space-y-2 mb-3">
        <li className="flex items-center gap-2 text-sm">
          <Avatar email={plan.ownerEmail ?? "?"} />
          <span className="truncate text-ink-700">{plan.role === "owner" ? "You" : plan.ownerEmail}</span>
          <span className="ml-auto text-xs text-ink-400">Owner</span>
        </li>
        {plan.members.map((m) => (
          <li key={m.email} className="flex items-center gap-2 text-sm">
            <Avatar email={m.email} />
            <div className="min-w-0">
              <p className="truncate text-ink-700">{m.name}</p>
              <p className="truncate text-xs text-ink-400">{m.email}</p>
            </div>
            {isOwner && (
              <button
                onClick={() => remove(m.email)}
                className="ml-auto p-1 text-ink-400 hover:text-red-600 rounded"
                aria-label={`Remove ${m.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </li>
        ))}
      </ul>

      {message && (
        <p className={cn("text-xs mb-3", message.kind === "ok" ? "text-emerald-700" : "text-red-600")}>
          {message.text}
        </p>
      )}

      {isOwner &&
        (open ? (
          <div className="space-y-2">
            <Input placeholder="Their name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input
              type="email"
              placeholder="Their email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && invite()}
            />
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={invite} loading={busy} disabled={!name || !email}>
                Send invite
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button size="sm" variant="outline" className="w-full" onClick={() => setOpen(true)}>
            <UserPlus className="h-4 w-4" /> Invite family member
          </Button>
        ))}
    </div>
  );
}

function Avatar({ email, small = false }: { email: string; small?: boolean }) {
  const colors = ["bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-amber-500", "bg-rose-500", "bg-teal-500"];
  const hash = [...email].reduce((a, c) => a + c.charCodeAt(0), 0);
  return (
    <span
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0",
        small ? "w-4 h-4 text-[9px]" : "w-7 h-7 text-xs",
        colors[hash % colors.length]
      )}
    >
      {email.charAt(0).toUpperCase()}
    </span>
  );
}

function TaskCollaboration({
  task,
  planId,
  people,
  assignee,
  nameFor,
  comments,
  onAssign,
  onComment,
}: {
  task: ActionPlanTask;
  planId: string;
  people: Member[];
  assignee: string | null;
  nameFor: (email: string) => string;
  comments: Comment[];
  onAssign: (email: string | null) => void;
  onComment: (c: Comment) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const post = async () => {
    if (!text.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const { comment } = await api(`/api/plan/${planId}/comments`, {
        method: "POST",
        body: JSON.stringify({ taskId: task.id, body: text }),
      });
      onComment(comment);
      setText("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-stone-100">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-ink-500">
          Who&apos;s doing this?
          <select
            value={assignee ?? ""}
            onChange={(e) => onAssign(e.target.value || null)}
            className="text-xs border border-stone-200 rounded-md px-2 py-1 bg-white text-ink-700"
          >
            <option value="">Nobody yet</option>
            {people.map((p) => (
              <option key={p.email} value={p.email}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-1 text-xs text-ink-500 hover:text-ink-800"
          aria-expanded={open}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          {comments.length ? `${comments.length} note${comments.length > 1 ? "s" : ""}` : "Add a note"}
        </button>
      </div>

      {open && (
        <div className="mt-3 space-y-2">
          {comments.map((c) => (
            <div key={c.id} className="bg-stone-50 rounded-lg px-3 py-2">
              <p className="text-xs text-ink-400">
                {nameFor(c.author_email)} ·{" "}
                {new Date(c.created_at).toLocaleString("en-GB", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-sm text-ink-700 whitespace-pre-wrap">{c.body}</p>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && post()}
              maxLength={2000}
              placeholder="e.g. Called the bank, they need a certified copy"
              className="flex-1 text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ink-300"
            />
            <Button size="sm" onClick={post} loading={busy} disabled={!text.trim()} aria-label="Post note">
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}

function RemoveFaith({ planId, onRemoved }: { planId: string; onRemoved: () => void }) {
  const [busy, setBusy] = useState(false);
  const remove = async () => {
    if (!confirm("Remove the faith and cultural background answers from this plan? The steps based on them will be removed from the list.")) return;
    setBusy(true);
    try {
      await api(`/api/plan/${planId}`, { method: "PATCH", body: JSON.stringify({ removeFaith: true }) });
      onRemoved();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <button
      onClick={remove}
      disabled={busy}
      className="w-full text-xs text-ink-400 hover:text-ink-700 py-2"
    >
      Remove faith and background details from this plan
    </button>
  );
}

function DeletePlan({ planId, onDeleted }: { planId: string; onDeleted: () => void }) {
  const [busy, setBusy] = useState(false);
  const del = async () => {
    if (!confirm("Delete this plan permanently? This also removes it for any family members. This cannot be undone.")) {
      return;
    }
    setBusy(true);
    try {
      await api(`/api/plan/${planId}`, { method: "DELETE" });
      onDeleted();
    } catch (e) {
      alert((e as Error).message);
      setBusy(false);
    }
  };
  return (
    <button
      onClick={del}
      disabled={busy}
      className="w-full flex items-center justify-center gap-2 text-xs text-ink-400 hover:text-red-600 py-2"
    >
      <Trash2 className="h-3.5 w-3.5" /> Delete this plan
    </button>
  );
}

function LeavePlan({ planId, me, onLeft }: { planId: string; me: string; onLeft: () => void }) {
  const leave = async () => {
    if (!confirm("Leave this plan? You'll need a new invitation to see it again.")) return;
    try {
      await api(`/api/plan/${planId}/members?email=${encodeURIComponent(me)}`, { method: "DELETE" });
      onLeft();
    } catch (e) {
      alert((e as Error).message);
    }
  };
  return (
    <button onClick={leave} className="w-full text-xs text-ink-400 hover:text-red-600 py-2">
      Leave this plan
    </button>
  );
}

/** Fixed in the corner so the confirmation is visible wherever the user has scrolled to. */
function SaveToast({ state }: { state: "idle" | "saving" | "saved" | "error" }) {
  return (
    <div aria-live="polite" className="fixed bottom-4 right-4 z-50 print:hidden">
      {state === "saving" && (
        <div className="flex items-center gap-2 bg-white border border-stone-200 shadow-lg rounded-full px-4 py-2 text-sm text-ink-600">
          <Loader2 className="h-4 w-4 animate-spin" /> Saving…
        </div>
      )}
      {state === "saved" && (
        <div className="flex items-center gap-2 bg-emerald-600 shadow-lg rounded-full px-4 py-2 text-sm text-white">
          <CheckCircle2 className="h-4 w-4" /> Saved
        </div>
      )}
      {state === "error" && (
        <div className="flex items-center gap-2 bg-red-600 shadow-lg rounded-full px-4 py-2 text-sm text-white">
          Could not save. Please try again.
        </div>
      )}
    </div>
  );
}
