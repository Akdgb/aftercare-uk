"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Heart, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgeQuestion, ALLOWED_AGE_BANDS, useAgeBand } from "@/components/auth/age-question";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const params = useSearchParams();
  const error = params.get("error");
  const next = params.get("next");
  const invited = next?.startsWith("/plan/") && params.get("email");

  const [email, setEmail] = useState(params.get("email") ?? "");
  const [state, setState] = useState<"idle" | "loading" | "sent">("idle");
  const [err, setErr] = useState("");
  const [ageErr, setAgeErr] = useState("");
  const [ageBand, setAgeBand] = useAgeBand();

  const handleSubmit = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErr(email.trim() ? "Enter an email address in the correct format, like name@example.com" : "Enter your email address");
      requestAnimationFrame(() => document.getElementById("signin-email")?.focus());
      return;
    }
    if (!ageBand) {
      setAgeErr("Tell us your age to continue");
      return;
    }
    if (!ALLOWED_AGE_BANDS.includes(ageBand)) return;
    setState("loading");
    setErr("");

    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), next, ageBand }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }
      setState("sent");
    } catch (e) {
      setErr((e as Error).message);
      setState("idle");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 bg-ink-700 rounded-xl flex items-center justify-center">
            <Heart className="h-5 w-5 text-white" strokeWidth={1.5} />
          </div>
          <span className="text-ink-800 font-semibold text-xl">AfterCare</span>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
          {state === "sent" ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <h1 className="text-lg font-semibold text-ink-800 mb-2">Check your email</h1>
              <p className="text-ink-500 text-sm leading-relaxed">
                We sent a sign-in link to <strong className="text-ink-700">{email}</strong>.
                Open the link to continue. You can close this tab. The link expires in 20 minutes.
              </p>
              <button
                onClick={() => setState("idle")}
                className="mt-5 text-sm text-ink-500 hover:text-ink-700"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-ink-800 mb-1 text-center">
                {invited ? "You've been invited to a plan" : "Sign in to AfterCare"}
              </h1>
              <p className="text-sm text-ink-500 text-center mb-6">
                {invited
                  ? "Confirm your email address and we'll send you a link to open the family plan. No password is needed."
                  : "Enter your email and we'll send you a sign-in link. No password is needed. If you are new, this creates your account."}
              </p>

              {error && (
                <div role="alert" className="bg-rose-50 border border-rose-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-rose-800">
                    {error === "expired"
                      ? "That link has expired or already been used. Please request a new one."
                      : "Something went wrong. Please try again."}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <label htmlFor="signin-email" className="block text-sm font-medium text-ink-700">
                  Email address
                </label>
                {err && (
                  <p id="signin-email-error" role="alert" className="text-sm font-semibold text-rose-800 !mt-1.5">
                    <span className="sr-only">Error: </span>
                    {err}
                  </p>
                )}
                <div className="relative !mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500 pointer-events-none" aria-hidden="true" />
                  <input
                    id="signin-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErr(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    aria-invalid={Boolean(err) || undefined}
                    aria-describedby={err ? "signin-email-error" : undefined}
                    className={`w-full pl-9 pr-4 py-3 rounded-xl border bg-white text-base text-ink-800 focus:outline-none focus:ring-2 focus:ring-ink-400 ${err ? "border-2 border-rose-700" : "border-stone-300"}`}
                    autoFocus
                  />
                </div>
                <AgeQuestion value={ageBand} onChange={(v) => { setAgeBand(v); setErr(""); setAgeErr(""); }} />
                {ageErr && (
                  <p role="alert" className="text-sm font-semibold text-rose-800">
                    <span className="sr-only">Error: </span>
                    {ageErr}
                  </p>
                )}
                <Button className="w-full" onClick={handleSubmit} loading={state === "loading"} disabled={ageBand === "under-13"}>
                  {state === "loading" ? "Sending link..." : "Send sign-in link"}
                                  </Button>
              </div>

              <p className="text-center text-xs text-ink-500 mt-4">
                We use your email address only to sign you in and send messages about your plan. See our{" "}
                <Link href="/privacy" className="underline">privacy policy</Link>.
              </p>
              <p className="text-center text-xs text-ink-400 mt-3">
                No account?{" "}
                <Link href="/intake" className="text-ink-600 font-medium hover:underline">
                  Start by creating a plan
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
