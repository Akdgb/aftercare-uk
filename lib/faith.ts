import type { FaithOption, IntakeFormData } from "@/types";

const NOT_A_FAITH: FaithOption[] = ["none", "prefer-not-to-say"];

/**
 * The faiths/traditions recorded on a plan. Newer plans store several in
 * `faiths`; older plans stored one in `faith`.
 */
export function getFaiths(data: Pick<IntakeFormData, "faith" | "faiths">): FaithOption[] {
  const list = data.faiths?.length ? data.faiths : [data.faith];
  return [...new Set(list)].filter((f) => f && !NOT_A_FAITH.includes(f));
}
