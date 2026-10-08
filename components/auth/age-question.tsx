"use client";
import { LOCAL_KEYS, useLocalStorage } from "@/lib/use-local-storage";

export type AgeBand = "under-13" | "13-17" | "18-plus";
export const ALLOWED_AGE_BANDS: AgeBand[] = ["13-17", "18-plus"];

/**
 * Neutral age question asked before an account is created: no default answer
 * and no hint about which answer is accepted. Remembered on this device.
 */
export function useAgeBand(): [AgeBand | "", (v: AgeBand | "") => void] {
  const [value, set] = useLocalStorage(LOCAL_KEYS.ageBand);
  const band = value === "under-13" || value === "13-17" || value === "18-plus" ? value : "";
  return [band, (v) => set(v || null)];
}

export function AgeQuestion({ value, onChange }: { value: AgeBand | ""; onChange: (v: AgeBand) => void }) {
  return (
    <div>
      <label className="block">
        <span className="block text-sm font-medium text-ink-700 mb-1.5">How old are you?</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as AgeBand)}
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-400"
        >
          <option value="" disabled>
            Choose an answer
          </option>
          <option value="under-13">Under 13</option>
          <option value="13-17">13 to 17</option>
          <option value="18-plus">18 or over</option>
        </select>
      </label>
      {value === "under-13" && <UnderThirteen />}
    </div>
  );
}

function UnderThirteen() {
  return (
    <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-ink-800 space-y-2" role="status">
      <p>
        You need to be 13 or over to create an account, so we have not saved your email address. You can still read
        everything on AfterCare, and an adult you trust can create a plan for your family.
      </p>
      <p>
        If you would like to talk to someone, call <a href="tel:08001111" className="underline font-medium">Childline on 0800 1111</a>{" "}
        (free, any time) or visit{" "}
        <a href="https://www.childbereavementuk.org" target="_blank" rel="noopener noreferrer" className="underline font-medium">
          Child Bereavement UK
        </a>
        .
      </p>
    </div>
  );
}
