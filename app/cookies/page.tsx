import Link from "next/link";
import { ProsePage } from "@/components/layout/prose-page";

export const metadata = { title: "Cookie policy" };

const ITEMS = [
  { name: "aftercare_session", kind: "Cookie", why: "Keeps you signed in after you open a sign-in link", lasts: "Up to 90 days, or until you sign out" },
  { name: "aftercare_intake, aftercare_task_statuses and similar", kind: "Browser storage", why: "Keeps your plan, answers and ticked tasks on your device", lasts: "Until you delete them" },
  { name: "aftercare_wellbeing_…", kind: "Browser storage", why: "Keeps your check-ins, dates and private notes on your device only", lasts: "Until you delete them" },
  { name: "aftercare_resumed", kind: "Session storage", why: "Takes you to your plan once when you open AfterCare", lasts: "Until you close the browser tab" },
];

export default function CookiesPage() {
  return (
    <ProsePage title="Cookie policy" updated="November 2026">
      <p>
        AfterCare uses one cookie and some storage in your browser. All of it is strictly necessary to give you the
        service you ask for, such as keeping your plan or keeping you signed in. Because of this, the law does not require
        us to ask for your consent, and we do not show a cookie banner.
      </p>
      <p>
        We do not use advertising cookies, analytics or tracking, and we do not let other companies set cookies on
        AfterCare. Our fonts are served from our own website, not from Google.
      </p>

      <h2>What we store</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-stone-300">
              <th scope="col" className="py-2 pr-3 font-semibold text-ink-900">Name</th>
              <th scope="col" className="py-2 pr-3 font-semibold text-ink-900">Type</th>
              <th scope="col" className="py-2 pr-3 font-semibold text-ink-900">What it does</th>
              <th scope="col" className="py-2 font-semibold text-ink-900">How long</th>
            </tr>
          </thead>
          <tbody>
            {ITEMS.map((i) => (
              <tr key={i.name} className="border-b border-stone-200 align-top">
                <td className="py-2 pr-3 break-words">{i.name}</td>
                <td className="py-2 pr-3">{i.kind}</td>
                <td className="py-2 pr-3">{i.why}</td>
                <td className="py-2">{i.lasts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Removing them</h2>
      <p>
        You can delete everything AfterCare has saved on your device from our{" "}
        <Link href="/privacy#device">privacy page</Link>, or clear this website&apos;s data in your browser settings.
        If you do, any plan that is only saved on this device will be lost.
      </p>
    </ProsePage>
  );
}
