"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Share, Smartphone, X } from "lucide-react";
import { useLocalStorage } from "@/lib/use-local-storage";
import { cn } from "@/lib/utils";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const DISMISSED = "aftercare_install_dismissed";
const noop = () => () => {};

function platform(): "installed" | "ios" | "other" {
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (standalone) return "installed";
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
  return ios ? "ios" : "other";
}

/**
 * Invites people to add AfterCare to their home screen so it opens like an app.
 * Android and desktop Chrome get a one-tap button; iPhone shows the two steps.
 */
export function InstallPrompt({ className }: { className?: string }) {
  const where = useSyncExternalStore(noop, platform, () => "installed" as const);
  const [dismissed, setDismissed] = useLocalStorage(DISMISSED);
  const [event, setEvent] = useState<InstallEvent | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (where === "installed" || dismissed) return null;
  if (where === "other" && !event) return null;

  return (
    <div className={cn("relative rounded-2xl bg-white border border-stone-200 p-4 pr-10 flex gap-3", className)}>
      <Smartphone className="h-6 w-6 text-ink-600 shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="font-semibold text-ink-900">Add AfterCare to your home screen</p>
        {where === "ios" ? (
          <p className="text-ink-600 mt-0.5">
            Tap <Share className="inline h-4 w-4 -mt-0.5" aria-label="Share" /> at the bottom of Safari, then &ldquo;Add to
            Home Screen&rdquo;. It opens like an app.
          </p>
        ) : (
          <>
            <p className="text-ink-600 mt-0.5">Open your plan and daily check-in in one tap, like an app.</p>
            <button
              type="button"
              onClick={async () => {
                await event?.prompt();
                setEvent(null);
              }}
              className="mt-2 bg-ink-700 text-white font-medium px-4 py-2 rounded-xl hover:bg-ink-800"
            >
              Add to home screen
            </button>
          </>
        )}
      </div>
      <button
        type="button"
        onClick={() => setDismissed("1")}
        aria-label="Hide this"
        className="absolute top-3 right-3 text-ink-400 hover:text-ink-700"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
