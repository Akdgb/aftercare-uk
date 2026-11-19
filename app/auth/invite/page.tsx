"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { AgeQuestion, ALLOWED_AGE_BANDS, useAgeBand } from "@/components/auth/age-question";

/** Where a family invitation email lands: one question, then straight into the plan. */
export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
        </div>
      }
    >
      <Invite />
    </Suspense>
  );
}

function Invite() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const next = params.get("next") ?? "/plan";
  const [ageBand, setAgeBand] = useAgeBand();
  const allowed = Boolean(ageBand && ALLOWED_AGE_BANDS.includes(ageBand));

  const open = () => {
    if (!allowed || !token) return;
    const url = new URL("/api/auth/verify", window.location.origin);
    url.searchParams.set("token", token);
    url.searchParams.set("next", next);
    url.searchParams.set("age", ageBand);
    window.location.assign(url.toString());
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Logo className="justify-center mb-8" href={null} />
        <div className="bg-white rounded-2xl border border-stone-200 p-7">
          <h1 className="text-2xl font-semibold text-ink-900">You have been invited to a shared plan</h1>
          <p className="text-ink-600 mt-2">
            A family member has asked you to help with their AfterCare plan. You can see the steps, tick them off and
            leave notes for each other. No password is needed.
          </p>
          <div className="mt-6">
            <AgeQuestion value={ageBand} onChange={setAgeBand} />
          </div>
          <button
            type="button"
            onClick={open}
            disabled={!allowed || !token}
            className="mt-6 w-full bg-ink-700 text-white font-semibold py-3.5 rounded-xl hover:bg-ink-800 disabled:opacity-50"
          >
            Open the plan
          </button>
          {!token && <p className="text-sm text-rose-800 mt-3">This invitation link is incomplete. Ask for a new one.</p>}
        </div>
      </div>
    </div>
  );
}
