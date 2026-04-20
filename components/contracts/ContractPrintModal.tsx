"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Printer } from "lucide-react";
import type { Contract } from "@/lib/types";
import { ContractPrintDocument } from "@/components/contracts/ContractPrintDocument";

type Props = {
  contract: Contract | null;
  open: boolean;
  onClose: () => void;
};

export function ContractPrintModal({ contract, open, onClose }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted || !open || !contract) return null;

  function handlePrint() {
    window.print();
  }

  return createPortal(
    <>
      <style jsx global>{`
        @media print {
          @page {
            margin: 14mm;
          }
          body * {
            visibility: hidden;
          }
          .contract-print-layer,
          .contract-print-layer * {
            visibility: visible;
          }
          .contract-print-layer {
            background: white !important;
          }
        }
      `}</style>
      <div className="contract-print-layer fixed inset-0 z-[100] flex items-stretch justify-center p-0 md:p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/50 print:hidden"
        onClick={onClose}
      />

      <div className="relative z-10 flex w-full max-w-5xl flex-col max-h-[100dvh] md:max-h-[92vh] rounded-none md:rounded-xl overflow-hidden bg-slate-100 shadow-2xl md:my-auto">
        <div className="flex-shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 bg-white print:hidden">
          <div>
            <p className="text-sm font-bold text-slate-900">Download contract</p>
            <p className="text-xs text-slate-500 font-mono">{contract.contractRef}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#002f93] text-white text-sm font-semibold hover:bg-[#002a7d]"
            >
              <Printer size={16} />
              Print
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <X size={16} />
              Close
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 p-4 md:p-8">
          <div className="contract-print-root max-w-4xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-10 print:shadow-none print:border-0 print:rounded-none print:p-0">
            <ContractPrintDocument c={contract} signatureMode="unfilled" />
          </div>
        </div>
      </div>
    </div>
    </>,
    document.body
  );
}
