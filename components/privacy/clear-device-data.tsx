"use client";
import { useState } from "react";

/** Removes everything AfterCare has stored in this browser (plan, answers, wellbeing notes). */
export function ClearDeviceData() {
  const [done, setDone] = useState(false);
  const clear = () => {
    if (!window.confirm("Delete your plan, answers and wellbeing notes from this device? This cannot be undone.")) return;
    try {
      for (const store of [localStorage, sessionStorage]) {
        Object.keys(store)
          .filter((k) => k.startsWith("aftercare"))
          .forEach((k) => store.removeItem(k));
      }
    } catch {
      /* storage unavailable: nothing to clear */
    }
    setDone(true);
  };
  return (
    <div className="mt-3" aria-live="polite">
      {done ? (
        <p className="text-sm font-medium text-ink-800">Everything AfterCare saved on this device has been deleted.</p>
      ) : (
        <button
          type="button"
          onClick={clear}
          className="text-sm font-medium px-4 py-2 rounded-xl border border-stone-300 bg-white text-rose-800 hover:bg-stone-50"
        >
          Delete everything on this device
        </button>
      )}
    </div>
  );
}
