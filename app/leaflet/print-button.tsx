"use client";
import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 bg-ink-700 text-white font-medium px-4 py-2.5 rounded-xl hover:bg-ink-800"
    >
      <Printer className="h-4 w-4" /> Print or save as PDF
    </button>
  );
}
