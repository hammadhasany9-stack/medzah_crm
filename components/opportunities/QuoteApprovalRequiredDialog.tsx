"use client";

import { X, ShieldAlert } from "lucide-react";

export interface QuoteApprovalRequiredDialogProps {
  open: boolean;
  onClose: () => void;
}

export function QuoteApprovalRequiredDialog({ open, onClose }: QuoteApprovalRequiredDialogProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[85]"
        onClick={onClose}
        aria-hidden
      />
      <div className="fixed inset-0 z-[86] flex items-center justify-center p-4 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quote-approval-required-title"
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[420px] pointer-events-auto border border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          <div className="px-6 pt-8 pb-6">
            <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center mb-4 ring-4 ring-amber-50">
              <ShieldAlert size={22} className="text-amber-600" />
            </div>
            <h2
              id="quote-approval-required-title"
              className="text-[17px] font-bold text-slate-900 tracking-tight pr-8"
            >
              Quote approval required
            </h2>
            <p className="text-[13px] text-slate-600 mt-2 leading-relaxed">
              Moving to <span className="font-semibold text-slate-800">Negotiation</span>,{" "}
              <span className="font-semibold text-slate-800">Closed Won</span>, or{" "}
              <span className="font-semibold text-slate-800">Closed Lost</span> requires an{" "}
              <span className="font-semibold text-emerald-700">approved</span> quote. Approve the quote on the Quotes
              board first (typically after it has been created in Proposal / Price Quote).
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full py-2.5 text-[13px] font-semibold rounded-xl bg-slate-900 text-white hover:bg-black transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
