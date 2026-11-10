import QRCode from "qrcode";
import { Logo } from "@/components/layout/logo";
import { SITE } from "@/lib/site";
import { PrintButton } from "./print-button";

export const metadata = { title: "Printable leaflet", robots: { index: false } };

// A one-page leaflet with a QR code that funeral directors, register offices,
// faith and community groups can print and hand to families. ?org= adds their name.
export default async function LeafletPage({ searchParams }: { searchParams: Promise<{ org?: string }> }) {
  const org = ((await searchParams).org ?? "").replace(/\s+/g, " ").trim().slice(0, 60);
  const url = SITE.url.replace(/\/$/, "");
  const qr = await QRCode.toString(url, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#182a26", light: "#ffffff" } });
  const shortUrl = url.replace(/^https?:\/\//, "");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 print:p-0 print:max-w-none">
      <div className="print:hidden mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-600">Print this page, or save it as a PDF. It fits on one A4 or A5 sheet.</p>
        <PrintButton />
      </div>

      <article className="bg-white border border-stone-200 rounded-3xl p-10 print:border-0 print:rounded-none print:p-12">
        <Logo href={null} />
        <h1 className="text-4xl font-semibold text-ink-900 mt-8 leading-tight">
          What to do after
          <br />
          someone dies
        </h1>
        <p className="text-lg text-ink-700 mt-4">
          A free, step-by-step plan for your family. Answer a few gentle questions and you get a checklist made for
          your situation.
        </p>
        <ul className="mt-6 space-y-2 text-ink-800">
          <li>✓ Registering the death and who to tell</li>
          <li>✓ Simple ways to reduce funeral costs</li>
          <li>✓ Money you may be able to claim</li>
          <li>✓ Share tasks with family, wherever they live</li>
          <li>✓ Faith and cultural traditions</li>
        </ul>
        <div className="mt-8 flex items-center gap-6">
          <div className="w-36 h-36 shrink-0" dangerouslySetInnerHTML={{ __html: qr }} aria-label={`QR code for ${shortUrl}`} role="img" />
          <div>
            <p className="text-sm text-ink-600">Scan with your phone camera, or visit</p>
            <p className="text-xl font-semibold text-ink-900 mt-1 break-all">{shortUrl}</p>
            <p className="text-sm text-ink-600 mt-2">Free. No adverts. Nothing to download.</p>
          </div>
        </div>
        {org && <p className="mt-8 text-sm text-ink-600">Given to you by {org}</p>}
        <p className="mt-8 pt-4 border-t border-stone-200 text-xs text-ink-500">
          If you need urgent help with how you are feeling, call NHS 111. In an emergency, call 999.
        </p>
      </article>
    </div>
  );
}
