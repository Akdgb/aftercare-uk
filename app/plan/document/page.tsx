"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Download, Loader2, MessageCircle } from "lucide-react";
import { PlanDocument, planMessage } from "@/components/plan/plan-document";
import { LOCAL_KEYS, useLocalStorage } from "@/lib/use-local-storage";
import { SITE } from "@/lib/site";
import type { IntakeFormData } from "@/types";

/** The plan as a designed document to save as PDF, print or send as a message. ?plan=<id> or ?plan=local */
export default function PlanDocumentPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <DocumentView />
    </Suspense>
  );
}

function Spinner() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="h-7 w-7 animate-spin text-ink-400" />
    </div>
  );
}

function parse<T>(raw: string | null | undefined): T | null {
  try {
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function DocumentView() {
  const planParam = useSearchParams().get("plan") ?? "local";
  const isLocal = planParam === "local";
  const backHref = isLocal ? "/plan" : `/plan/${planParam}`;
  const [rawIntake] = useLocalStorage(LOCAL_KEYS.intake);
  const [rawStatuses] = useLocalStorage(LOCAL_KEYS.statuses);
  const [remote, setRemote] = useState<{ intake: IntakeFormData; statuses: Record<string, string> } | null>(null);
  const [failed, setFailed] = useState(false);
  const [shareNote, setShareNote] = useState("");

  useEffect(() => {
    if (isLocal) return;
    fetch(`/api/plan/${planParam}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((p) => setRemote({ intake: p.intake_data, statuses: p.task_statuses ?? {} }))
      .catch(() => setFailed(true));
  }, [isLocal, planParam]);

  const intake = isLocal ? parse<IntakeFormData>(rawIntake) : remote?.intake ?? null;
  const statuses = isLocal ? parse<Record<string, string>>(rawStatuses) ?? {} : remote?.statuses ?? {};
  // A plan kept only on this device cannot be opened elsewhere, so the code leads to AfterCare itself
  const planUrl = isLocal ? SITE.url : `${SITE.url}/plan/${planParam}`;

  if ((isLocal && rawIntake === undefined) || (!isLocal && !remote && !failed)) return <Spinner />;
  if (!intake) {
    return (
      <div className="max-w-md mx-auto px-5 py-20 text-center">
        <p className="text-ink-700">We could not find this plan.</p>
        <Link href={backHref} className="inline-block mt-6 font-medium text-ink-800 underline underline-offset-4">
          Back to the plan
        </Link>
      </div>
    );
  }

  const shareMessage = async () => {
    const text = planMessage(intake, statuses, planUrl, !isLocal);
    try {
      if (navigator.share) {
        await navigator.share({ title: "AfterCare plan", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setShareNote("Copied. Paste it into WhatsApp, a text or an email.");
    } catch {
      /* the person closed the share sheet */
    }
  };

  return (
    <div className="pb-24 md:pb-10 print:p-0">
      <div className="print:hidden sticky top-14 z-30 bg-stone-50/95 backdrop-blur border-b border-stone-200">
        <div className="max-w-[210mm] mx-auto px-4 py-3 flex flex-wrap items-center gap-2">
          <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900 mr-auto py-2">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to the plan
          </Link>
          <button
            type="button"
            onClick={shareMessage}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink-800 hover:border-ink-300"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" /> Send as a message
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-ink-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-800"
          >
            <Download className="h-4 w-4" aria-hidden="true" /> Save as PDF
          </button>
        </div>
        <p role="status" className="max-w-[210mm] mx-auto px-4 pb-2 text-sm text-ink-700 empty:hidden">
          {shareNote}
        </p>
      </div>
      <p className="print:hidden max-w-[210mm] mx-auto px-4 mt-4 mb-4 text-sm text-ink-600">
        On a phone, tap <b>Save as PDF</b>, then use the share button to save it to Files or send it on WhatsApp or by email.
      </p>
      <div className="px-3 sm:px-4 print:p-0">
        <PlanDocument intake={intake} statuses={statuses} planUrl={planUrl} />
      </div>
    </div>
  );
}
