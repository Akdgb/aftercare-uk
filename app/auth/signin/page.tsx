"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Heart, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const params = useSearchParams();
  const error = params.get("error");

  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "sent">("idle");
  const [err, setErr] = useState("");

  const handleSubmit = async () => {
    if (!email.trim() || !email.includes("@")) {
      setErr("Please enter a valid email address.");
      return;
    }
    setState("loading");
    setErr("");

    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error();
      setState("sent");
    } catch {
      setErr("Something went wrong. Please try again.");
      setState("idle");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 bg-slate-700 rounded-xl flex items-center justify-center">
            <Heart className="h-5 w-5 text-white" strokeWidth={1.5} />
          </div>
          <span className="text-slate-800 font-semibold text-xl">AfterCare</span>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
          {state === "sent" ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <h1 className="text-lg font-semibold text-slate-800 mb-2">Check your email</h1>
              <p className="text-slate-500 text-sm leading-relaxed">
                We sent a sign-in link to <strong className="text-slate-700">{email}</strong>.
                Click it to access your dashboard. The link expires in 20 minutes.
              </p>
              <button
                onClick={() => setState("idle")}
                className="mt-5 text-sm text-slate-500 hover:text-slate-700"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-slate-800 mb-1 text-center">Welcome back</h1>
              <p className="text-sm text-slate-500 text-center mb-6">
                Enter your email and we&apos;ll send you a sign-in link — no password needed.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-700">
                    {error === "expired"
                      ? "That link has expired or already been used. Please request a new one."
                      : "Something went wrong. Please try again."}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErr(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-stone-300 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    autoFocus
                  />
                </div>
                {err && <p className="text-xs text-red-600">{err}</p>}
                <Button className="w-full" onClick={handleSubmit} loading={state === "loading"}>
                  {state === "loading" ? "Sending link..." : "Send sign-in link"}
                  {state === "idle" && <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>

              <p className="text-center text-xs text-slate-400 mt-5">
                No account?{" "}
                <Link href="/intake" className="text-slate-600 font-medium hover:underline">
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
