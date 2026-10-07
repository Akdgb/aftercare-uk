import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata = { title: "Documents you'll need — AfterCare UK" };

const DOCUMENTS = [
  {
    label: "Medical Certificate of Cause of Death (MCCD)",
    from: "The doctor or medical examiner — usually sent straight to the register office",
    needed: "To register the death",
  },
  {
    label: "Certified copies of the death certificate",
    from: "The register office when you register (cheaper at the time than later)",
    needed: "Banks, pensions, insurers, utilities, probate",
  },
  {
    label: "Green form (Certificate for Burial or Cremation)",
    from: "The registrar, after registering",
    needed: "Give to the funeral director",
  },
  {
    label: "Tell Us Once reference number",
    from: "The registrar",
    needed: "To notify government departments in one go",
  },
  {
    label: "The will (if there is one)",
    from: "Home, a solicitor, a bank, or the Probate Service's will storage",
    needed: "To find the executor and apply for probate",
  },
  {
    label: "Birth and marriage / civil partnership certificates",
    from: "The deceased's papers, or order copies from GRO",
    needed: "Registration, pensions and bereavement benefits",
  },
  {
    label: "Bank, pension, insurance and property paperwork",
    from: "Statements and letters in the deceased's papers",
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
      <Link href="/help" className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Help
      </Link>
      <h1 className="text-3xl font-semibold text-ink-900 mt-3">Documents you&apos;ll need</h1>
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
