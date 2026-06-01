import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-800 text-stone-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Heart className="h-4 w-4 text-white" strokeWidth={1.5} />
              </div>
              <span className="text-white font-semibold text-lg">AfterCare</span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed max-w-xs">
              Helping families navigate bereavement with clarity, compassion, and practical guidance.
            </p>
            <p className="mt-4 text-xs text-stone-500">
              The information on this platform is for guidance only and does not constitute legal or financial advice.
            </p>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Services</h4>
            <ul className="space-y-2.5">
              {[
                { href: "/intake", label: "Start Your Plan" },
                { href: "/resources", label: "Local Resources" },
                { href: "/financial-support", label: "Financial Support" },
                { href: "/cost-estimator", label: "Cost Estimator" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Guidance</h4>
            <ul className="space-y-2.5">
              {[
                { href: "/guidance/registering-a-death", label: "Registering a Death" },
                { href: "/guidance/funeral-costs-explained", label: "Funeral Costs" },
                { href: "/guidance/probate-explained", label: "Probate Explained" },
                { href: "/guidance/funeral-support-payments", label: "Support Payments" },
                { href: "/assistant", label: "AI Assistant" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-stone-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-stone-500">
            &copy; {new Date().getFullYear()} AfterCare UK. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-stone-500 hover:text-stone-300 transition-colors">Privacy Policy</Link>
            <Link href="/privacy#terms" className="text-xs text-stone-500 hover:text-stone-300 transition-colors">Terms of Use</Link>
            <Link href="/privacy#accessibility" className="text-xs text-stone-500 hover:text-stone-300 transition-colors">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
