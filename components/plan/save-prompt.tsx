"use client";
import { useState } from "react";
import { Bell, Check, Cloud, Loader2, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SavePromptProps {
  onSaved: (planId: string, email: string) => void;
  intakeData: Record<string, unknown>;
  taskStatuses: Record<string, string>;
  urgentRemaining: number;
}

type State = "idle" | "open" | "loading" | "done" | "error";

export function SavePrompt({ onSaved, intakeData, taskStatuses, urgentRemaining }: SavePromptProps) {
  const [state, setState] = useState<State>("idle");
  const [email, setEmail] = useState("");
  const [wantReminders, setWantReminders] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSave = async () => {
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/save-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), intakeData, taskStatuses, wantReminders }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }

      const { planId } = await res.json();
      setState("done");
      onSaved(planId, email.trim());
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  if (state === "done") {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
        <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-emerald-800">Plan saved — check your email</p>
          <p className="text-xs text-emerald-600 mt-0.5">
            We&apos;ve sent your plan link to {email}. Bookmark this page to come back any time.
          </p>
        </div>
      </div>
    );
  }

  if (state === "idle") {
    return (
      <div className="bg-slate-700 text-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Cloud className="h-5 w-5 text-slate-300 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Save your progress</p>
            <p className="text-xs text-slate-300 mt-0.5">
              Get a private link so you can return to this plan from any device.
              {urgentRemaining > 0 && ` We'll also remind you about ${urgentRemaining} urgent task${urgentRemaining > 1 ? "s" : ""}.`}
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="flex-shrink-0 whitespace-nowrap"
          onClick={() => setState("open")}
        >
          <Mail className="h-4 w-4" />
          Save &amp; get reminders
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-slate-700 rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-slate-800">Save your plan</p>
          <p className="text-xs text-slate-500 mt-0.5">
            We&apos;ll email you a private link. No account or password needed.
          </p>
        </div>
        <button onClick={() => setState("idle")} className="p-1 hover:bg-stone-100 rounded-lg">
          <X className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
            placeholder="your@email.com"
            className={cn(
              "w-full rounded-lg border px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400",
              "focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent",
              errorMsg ? "border-red-400" : "border-stone-300"
            )}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          {errorMsg && <p className="mt-1 text-xs text-red-600">{errorMsg}</p>}
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={wantReminders}
            onChange={(e) => setWantReminders(e.target.checked)}
            className="mt-0.5 rounded border-stone-300"
          />
          <span className="text-sm text-slate-700">
            <span className="font-medium flex items-center gap-1.5">
              <Bell className="h-3.5 w-3.5 text-slate-500" />
              Send me email reminders
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">
              We&apos;ll remind you when urgent tasks are still outstanding.
            </span>
          </span>
        </label>

        <Button
          className="w-full"
          onClick={handleSave}
          loading={state === "loading"}
        >
          {state === "loading" ? "Saving..." : "Save My Plan"}
        </Button>
      </div>

      <p className="text-xs text-slate-400 mt-3">
        Your information is kept private and never shared.
      </p>
    </div>
  );
}
