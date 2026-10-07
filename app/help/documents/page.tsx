import { BackLink } from "@/components/layout/back-link";
import { FileText } from "lucide-react";

export const metadata = { title: "Documents you will need" };

const DOCUMENTS = [
  {
    label: "Medical Certificate of Cause of Death (MCCD)",
    from: "In England and Wales, a medical examiner reviews it and it is sent to the register office electronically. You do not need to collect it. The register office or medical examiner's office will contact you.",
    needed: "To register the death",
  },
  {
    label: "Certified copies of the death certificate",
    from: "The register office when you register. Copies cost £12.50 each in England and Wales at registration (fees may change from 9 November 2026), and usually cost more later.",
    needed: "Banks, pensions, insurers, utilities and probate",
  },
  {
    label: "Green form (Certificate for Burial or Cremation)",
    from: "The registrar, after registering",
    needed: "Give it to the funeral director",
  },
  {
    label: "Tell Us Once reference number",
    from: "The registrar (England, Scotland and Wales only)",
    needed: "To tell government organisations at the same time. In Northern Ireland, contact each organisation yourself.",
  },
  {
    label: "The will (if there is one)",
    from: "Home, a solicitor, a bank, or the Probate Service's will storage",
    needed: "To find the executor and apply for probate (confirmation in Scotland)",
  },
  {
    label: "Birth and marriage or civil partnership certificates",
    from: "The papers of the person who died, or order copies from the General Register Office",
    needed: "Registration, pensions and bereavement benefits",
  },
  {
    label: "Bank, pension, insurance and property paperwork",
    from: "Statements and letters in the papers of the person who died",
    needed: "Valuing the estate and contacting each organisation",
  },
  {
    label: "Funeral invoice and receipts",
    from: "The funeral director",
    needed: "Funeral Expenses Payment claims and reclaiming costs from the estate",
  },
];

export default function DocumentsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-10">
      <BackLink />
      <h1 className="text-3xl font-semibold text-ink-900 mt-3">Documents you will need</h1>
      <p className="text-ink-600 mt-2">
        Keep the originals together in one folder. Most organisations ask for a certified copy of the death certificate.
      </p>
      <ul className="mt-6 bg-white border border-stone-200 rounded-2xl divide-y divide-stone-100">
        {DOCUMENTS.map((doc) => (
          <li key={doc.label} className="flex gap-3 p-4">
            <FileText className="h-5 w-5 text-ink-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-ink-900">{doc.label}</p>
              <p className="text-sm text-ink-600 mt-1">
                <span className="text-ink-500">From:</span> {doc.from}
              </p>
              <p className="text-sm text-ink-600">
                <span className="text-ink-500">For:</span> {doc.needed}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
