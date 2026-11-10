/**
 * The AfterCare mark: a heart with a two-leaf seedling growing inside it.
 * Care for the person who died, and life carrying on. This is the only
 * drawing of the mark; the app icons and link preview are made from these paths.
 */
export const MARK_PATHS = {
  heart: "M12 20.5s-7.5-4.6-7.5-10.4A4.1 4.1 0 0 1 12 7.4a4.1 4.1 0 0 1 7.5 2.7c0 5.8-7.5 10.4-7.5 10.4Z",
  stem: "M12 17.4v-5.2",
  leaf: "M12 12.6c0-2.1 1.4-3.5 3.5-3.5 0 2.1-1.4 3.5-3.5 3.5ZM12 14.6c0-1.8-1.2-3-3-3 0 1.8 1.2 3 3 3Z",
};

export function Mark({ className, heart = "white", shoot = "#9db6ad" }: { className?: string; heart?: string; shoot?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d={MARK_PATHS.heart} stroke={heart} strokeWidth="1.6" strokeLinejoin="round" />
      <path d={MARK_PATHS.stem} stroke={shoot} strokeWidth="1.6" strokeLinecap="round" />
      <path d={MARK_PATHS.leaf} fill={shoot} />
    </svg>
  );
}
