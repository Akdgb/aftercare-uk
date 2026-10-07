"use client";
import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SHARE_TEXT =
  "AfterCare UK is a free step-by-step checklist for everything to do after someone dies — registering the death, funeral costs, money you can claim and who to tell.";

/** Opens the phone's share sheet (WhatsApp, Messages…) or copies the link on desktop. */
export function ShareButton({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = window.location.origin;
    if (navigator.share) {
      await navigator.share({ title: "AfterCare UK", text: SHARE_TEXT, url }).catch(() => null);
      return;
    }
    await navigator.clipboard?.writeText(`${SHARE_TEXT} ${url}`).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };
  return (
    <button
      type="button"
      onClick={share}
      className={cn(
        "w-full flex items-center gap-3 rounded-2xl bg-white border border-stone-200 p-4 text-left hover:border-ink-300 transition-colors",
        className
      )}
    >
      <span className="w-10 h-10 rounded-xl bg-ink-100 flex items-center justify-center shrink-0">
        {copied ? <Check className="h-5 w-5 text-ink-700" /> : <Share2 className="h-5 w-5 text-ink-700" />}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-semibold text-ink-900">{copied ? "Link copied" : "Share AfterCare"}</span>
        <span className="block text-sm text-ink-500">Know someone going through this? It&apos;s free.</span>
      </span>
    </button>
  );
}
