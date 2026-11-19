// Shared by the browser age question and the server checks
export type AgeBand = "under-16" | "16-17" | "18-plus";
/** Accounts are for people aged 16 or over. */
export const ALLOWED_AGE_BANDS: AgeBand[] = ["16-17", "18-plus"];
