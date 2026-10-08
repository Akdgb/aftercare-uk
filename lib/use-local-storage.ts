"use client";
import { useCallback, useSyncExternalStore } from "react";

const EVENT = "aftercare-local-storage";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeLocal(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Storage unavailable (private mode / blocked): the in-memory UI still works
  }
  window.dispatchEvent(new Event(EVENT));
}

/**
 * Reads a localStorage value without a hydration mismatch: the server render
 * and first client render see `undefined`, then the stored value.
 */
export function useLocalStorage(key: string): [string | null | undefined, (value: string | null) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => undefined
  );
  const set = useCallback((v: string | null) => writeLocal(key, v), [key]);
  return [value, set];
}

export const LOCAL_KEYS = {
  intake: "aftercare_intake",
  /** Answers in progress, so leaving the questions and coming back resumes them. */
  intakeDraft: "aftercare_intake_draft",
  statuses: "aftercare_task_statuses",
  /** Answer to the neutral age question asked before creating an account. */
  ageBand: "aftercare_age_band",
  /** Set when a signed-out user asks to save their local plan; the dashboard saves it after sign-in. */
  pendingSave: "aftercare_pending_save",
  /** Email a save link was sent to during the questions (shown on the plan until used). */
  linkSentTo: "aftercare_link_sent_to",
} as const;
