import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy – AfterCare UK",
  description: "How AfterCare UK collects, uses, and protects your personal data under UK GDPR.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-slate-500 text-sm">Last updated: June 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <p className="text-sm text-blue-800">
            <strong>Summary:</strong> We collect only the information needed to generate your bereavement plan.
            We do not sell your data, send marketing emails, or share your information with third parties for commercial purposes.
          </p>
        </div>

        <article className="bg-white rounded-2xl border border-stone-200 shadow-sm divide-y divide-stone-100">

          <section className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">1. Who we are</h2>
            <div className="prose text-sm text-slate-600">
              <p>AfterCare UK is a bereavement guidance platform operated as a sole trader / limited company based in England.</p>
              <p><strong>Data Controller:</strong> AfterCare UK</p>
              <p><strong>Contact:</strong> <a href="mailto:privacy@aftercare-uk.co.uk" className="text-slate-700 underline">privacy@aftercare-uk.co.uk</a></p>
              <p>We are required to register with the Information Commissioner&apos;s Office (ICO) as a data controller. Our ICO registration number will be listed here once obtained.</p>
            </div>
          </section>

          <section className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">2. What data we collect</h2>
            <div className="prose text-sm text-slate-600">
              <p>When you use AfterCare, we may collect the following personal data:</p>
              <ul>
                <li><strong>Your contact details:</strong> name, email address, phone number, postcode</li>
                <li><strong>Your relationship</strong> to the deceased</li>
                <li><strong>Plan preferences:</strong> funeral type, faith/cultural requirements, housing situation, financial support needs</li>
                <li><strong>Usage data:</strong> which tasks you have completed, when you last accessed your plan</li>
                <li><strong>AI chat messages:</strong> questions you ask the AI assistant</li>
              </ul>
              <p>We also receive information about the deceased person. Under UK law, GDPR does not apply to deceased individuals — however, we treat all bereavement data with the same care and confidentiality as personal data.</p>
            </div>
          </section>

          <section className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">3. Why we collect it &amp; our lawful basis</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-stone-50">
                    <th className="text-left p-3 text-slate-700 font-medium border border-stone-200">Purpose</th>
                    <th className="text-left p-3 text-slate-700 font-medium border border-stone-200">Lawful basis (UK GDPR Article 6)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Generate your personalised bereavement plan", "Legitimate interests (necessary to provide the service you requested)"],
                    ["Save your plan and allow you to return to it", "Legitimate interests / Contract"],
                    ["Send you your plan link by email", "Legitimate interests / Contract"],
                    ["Send task reminder emails (if opted in)", "Consent"],
                    ["Improve the service and fix errors", "Legitimate interests"],
                    ["Comply with legal obligations", "Legal obligation"],
                  ].map(([purpose, basis]) => (
                    <tr key={purpose} className="border-b border-stone-100">
                      <td className="p-3 text-slate-600 border border-stone-200">{purpose}</td>
                      <td className="p-3 text-slate-600 border border-stone-200">{basis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">4. How long we keep your data</h2>
            <div className="prose text-sm text-slate-600">
              <ul>
                <li><strong>Saved plans:</strong> 3 years from the date of creation, then automatically deleted</li>
                <li><strong>Email addresses:</strong> deleted with the plan, unless separately opted in to communications</li>
                <li><strong>AI chat logs:</strong> not stored beyond the current session unless explicitly saved</li>
                <li><strong>Server logs:</strong> 90 days</li>
              </ul>
              <p>You can request deletion of your data at any time — see section 7.</p>
            </div>
          </section>

          <section className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">5. Who we share data with</h2>
            <div className="prose text-sm text-slate-600">
              <p>We use the following third-party processors. All are contractually required to process your data only on our instructions and in compliance with UK GDPR:</p>
              <ul>
                <li><strong>Supabase Inc.</strong> (database hosting) — data stored in EU (Frankfurt) region</li>
                <li><strong>OpenAI LLC</strong> (AI assistant) — messages sent to the AI are processed in the USA under EU/UK Standard Contractual Clauses</li>
                <li><strong>Resend Inc.</strong> (email delivery) — email addresses are processed to send your plan link and reminders</li>
                <li><strong>Vercel Inc.</strong> (website hosting) — your requests are processed on Vercel servers</li>
              </ul>
              <p><strong>We do not sell your data.</strong> We do not share your data with funeral directors, insurers, or any other commercial partners without your explicit consent.</p>
            </div>
          </section>

          <section className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">6. Transfers outside the UK</h2>
            <div className="prose text-sm text-slate-600">
              <p>
                Some of our processors (OpenAI, Vercel, Resend) are based in the USA. Transfers to the USA are protected by either:
              </p>
              <ul>
                <li>The UK International Data Transfer Agreement (IDTA), or</li>
                <li>UK adequacy decisions where applicable</li>
              </ul>
              <p>Supabase stores all AfterCare data in EU data centres.</p>
            </div>
          </section>

          <section className="p-6 sm:p-8" id="rights">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">7. Your rights</h2>
            <div className="prose text-sm text-slate-600">
              <p>Under UK GDPR you have the following rights:</p>
              <ul>
                <li><strong>Right of access:</strong> request a copy of the data we hold about you</li>
                <li><strong>Right to erasure:</strong> request deletion of your data</li>
                <li><strong>Right to rectification:</strong> correct inaccurate data</li>
                <li><strong>Right to portability:</strong> receive your data in a machine-readable format</li>
                <li><strong>Right to object:</strong> object to processing based on legitimate interests</li>
                <li><strong>Right to withdraw consent:</strong> withdraw consent for reminder emails at any time</li>
              </ul>
              <p>
                To exercise any of these rights, email{" "}
                <a href="mailto:privacy@aftercare-uk.co.uk" className="text-slate-700 underline">
                  privacy@aftercare-uk.co.uk
                </a>. We will respond within 30 days.
              </p>
              <p>
                You also have the right to lodge a complaint with the{" "}
                <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer" className="text-slate-700 underline">
                  Information Commissioner&apos;s Office (ICO)
                </a>.
              </p>
            </div>
          </section>

          <section className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">8. Cookies</h2>
            <div className="prose text-sm text-slate-600">
              <p>AfterCare uses only technically necessary cookies and browser localStorage to maintain your session and save your plan state. We do not use advertising cookies or third-party tracking cookies.</p>
            </div>
          </section>

          <section className="p-6 sm:p-8" id="terms">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">9. Terms of Use</h2>
            <div className="prose text-sm text-slate-600">
              <p>
                AfterCare provides guidance information only. Nothing on this platform constitutes legal, financial, or medical advice.
                You should always consult a qualified professional — such as a solicitor, financial adviser, or GP — for advice specific to your situation.
              </p>
              <p>
                The platform is provided free of charge for personal, non-commercial use. We reserve the right to withdraw or modify any feature at any time.
              </p>
              <p>
                These terms are governed by the laws of England and Wales.
              </p>
            </div>
          </section>

          <section className="p-6 sm:p-8" id="accessibility">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">10. Accessibility</h2>
            <div className="prose text-sm text-slate-600">
              <p>
                We are committed to making AfterCare accessible to all users, including those with disabilities. If you experience any accessibility issues,
                please contact us at{" "}
                <a href="mailto:hello@aftercare-uk.co.uk" className="text-slate-700 underline">
                  hello@aftercare-uk.co.uk
                </a>{" "}
                and we will do our best to help.
              </p>
              <p>We aim to meet WCAG 2.1 AA standards.</p>
            </div>
          </section>

        </article>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
            ← Back to AfterCare
          </Link>
        </div>
      </div>
    </div>
  );
}
