"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { FEEDBACK_ANSWERS, FEEDBACK_SECTIONS, FEEDBACK_TEXT, type FeedbackAnswer } from "@/lib/feedback";
import { cn } from "@/lib/utils";

const field =
  "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-400";

export default function FeedbackPage() {
  const [answers, setAnswers] = useState<Record<string, FeedbackAnswer>>({});
  const [text, setText] = useState<Record<string, string>>({ name: "", device: "", website: "" });
  const [score, setScore] = useState<number | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...text, answers, score }),
    }).catch(() => null);
    if (res?.ok) {
      setState("sent");
      window.scrollTo({ top: 0 });
    } else {
      setError((await res?.json().catch(() => null))?.error ?? "We could not send your feedback. Please try again.");
      setState("error");
    }
  };

  if (state === "sent") {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-semibold text-ink-900">Thank you</h1>
        <p className="text-ink-600 mt-3">Your feedback has been sent. It really helps.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="max-w-lg mx-auto px-4 pt-6 pb-28 md:pb-12">
      <h1 className="text-3xl font-semibold text-ink-900">Test feedback</h1>
      <p className="text-ink-600 mt-2">
        Try AfterCare with made-up names, then fill this in. Skip anything you did not try. It takes about 3 minutes.
      </p>

      <div className="mt-6 grid gap-4">
        <div>
          <label htmlFor="fb-name" className="block text-sm font-medium text-ink-700 mb-1.5">Your name (optional)</label>
          <input id="fb-name" className={field} value={text.name} onChange={(e) => setText({ ...text, name: e.target.value })} />
        </div>
        <div>
          <label htmlFor="fb-device" className="block text-sm font-medium text-ink-700 mb-1.5">Phone and browser</label>
          <input
            id="fb-device"
            className={field}
            placeholder="For example iPhone Safari, Samsung Chrome"
            value={text.device}
            onChange={(e) => setText({ ...text, device: e.target.value })}
          />
        </div>
        {/* Spam trap: hidden from people, filled in by bots */}
        <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={text.website} onChange={(e) => setText({ ...text, website: e.target.value })} />
      </div>

      {FEEDBACK_SECTIONS.map((s) => (
        <section key={s.title} className="mt-8">
          <h2 className="font-sans text-lg font-semibold text-ink-900">{s.title}</h2>
          <div className="mt-2 divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
            {s.items.map((item) => (
              <fieldset key={item.id} className="px-4 py-3">
                <legend className="text-sm text-ink-900 font-medium float-left w-full mb-2">{item.label}</legend>
                <div className="clear-both grid grid-cols-3 gap-1.5">
                  {(Object.keys(FEEDBACK_ANSWERS) as FeedbackAnswer[]).map((a) => {
                    const on = answers[item.id] === a;
                    return (
                      <label
                        key={a}
                        className={cn(
                          "text-center text-xs font-medium rounded-lg border px-2 py-2 cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ink-400",
                          on
                            ? a === "no"
                              ? "bg-rose-50 border-rose-700 text-rose-900"
                              : a === "yes"
                                ? "bg-ink-700 border-ink-700 text-white"
                                : "bg-stone-200 border-stone-300 text-ink-900"
                            : "bg-white border-stone-300 text-ink-700"
                        )}
                      >
                        <input
                          type="radio"
                          className="sr-only"
                          name={item.id}
                          value={a}
                          checked={on}
                          onChange={() => setAnswers({ ...answers, [item.id]: a })}
                        />
                        {FEEDBACK_ANSWERS[a]}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
        </section>
      ))}

      <section className="mt-8 grid gap-4">
        {FEEDBACK_TEXT.map((f) => (
          <div key={f.id}>
            <label htmlFor={`fb-${f.id}`} className="block text-sm font-medium text-ink-700 mb-1.5">{f.label}</label>
            <textarea
              id={`fb-${f.id}`}
              rows={3}
              maxLength={3000}
              className={field}
              value={text[f.id] ?? ""}
              onChange={(e) => setText({ ...text, [f.id]: e.target.value })}
            />
          </div>
        ))}
        <fieldset>
          <legend className="block text-sm font-medium text-ink-700 mb-1.5">Score out of 10</legend>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <label
                key={n}
                className={cn(
                  "text-center rounded-lg border py-2 font-semibold cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ink-400",
                  score === n ? "bg-ink-700 border-ink-700 text-white" : "bg-white border-stone-300 text-ink-800"
                )}
              >
                <input type="radio" name="score" className="sr-only" value={n} checked={score === n} onChange={() => setScore(n)} />
                {n}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {state === "error" && (
        <p role="alert" className="mt-6 text-sm font-semibold text-rose-800">{error}</p>
      )}
      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-6 w-full flex items-center justify-center gap-2 bg-ink-700 text-white text-lg font-semibold py-4 rounded-2xl hover:bg-ink-800 disabled:opacity-60"
      >
        {state === "sending" && <Loader2 className="h-5 w-5 animate-spin" />} Send feedback
      </button>
      <p className="text-xs text-ink-500 mt-3">Your answers are emailed to the person running AfterCare. Nothing is saved on the site.</p>
    </form>
  );
}
