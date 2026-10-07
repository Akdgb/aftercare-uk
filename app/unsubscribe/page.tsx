import Link from "next/link";
import { verifyUnsubscribeToken } from "@/lib/session";
import { setRemindersEnabled } from "@/lib/db";

export const metadata = { title: "Reminder emails" };

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const userId = token ? await verifyUnsubscribeToken(token) : null;
  let ok = false;
  if (userId) {
    try {
      await setRemindersEnabled(userId, false);
      ok = true;
    } catch {
      ok = false;
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="text-xl font-semibold text-ink-800 mb-3">
        {ok ? "Reminder emails turned off" : "This link is not valid"}
      </h1>
      <p className="text-ink-500 text-sm leading-relaxed mb-6">
        {ok
          ? "We will not send you any more reminder emails. Your plans are still saved, and you can turn reminders back on from your dashboard at any time."
          : "The link may have expired. You can manage reminder emails from your dashboard after signing in."}
      </p>
      <Link href="/dashboard" className="text-sm font-medium text-ink-700 hover:underline">
        Go to my dashboard →
      </Link>
    </div>
  );
}
