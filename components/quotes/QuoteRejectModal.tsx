"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Opportunity } from "@/lib/types";

// ─── Pre-set reason chips ─────────────────────────────────────────────────────

const REASONS = [
  "Incomplete information",
  "Pricing too low",
  "Invalid target price",
  "Customer not a good fit",
  "Other",
] as const;

// ─── Props ────────────────────────────────────────────────────────────────────

interface QuoteRejectModalProps {
  opportunity: Opportunity;
  onSubmit: (opp: Opportunity, reason: string) => void;
  onCancel: () => void;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function QuoteRejectModal({ opportunity, onSubmit, onCancel }: QuoteRejectModalProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [description, setDescription] = useState("");

  function toggleReason(reason: string) {
    setSelectedReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  }

  function handleSubmit() {
    const parts: string[] = [...selectedReasons];
    if (description.trim()) parts.push(description.trim());
    onSubmit(opportunity, parts.join(" · "));
  }

  const canSubmit = selectedReasons.length > 0 || description.trim().length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[520px] flex flex-col pointer-events-auto overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors z-10"
          >
            <X size={16} />
          </button>

          {/* Body */}
          <div className="px-8 pt-8 pb-7 space-y-6">

            {/* Header */}
            <div className="text-center space-y-1.5">
              <h2 className="text-[20px] font-bold text-slate-900">Quote Reject Request</h2>
              <p className="text-[13px] text-slate-500">Are you sure you want to reject this quote?</p>
            </div>

            {/* Reason chips */}
            <div className="space-y-3">
              <p className="text-[14px] font-bold text-slate-800 text-center">
                What&rsquo;s the reason behind it?
              </p>
              <div className="flex flex-wrap justify-center gap-2.5">
                {REASONS.map((reason) => {
                  const active = selectedReasons.includes(reason);
                  return (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => toggleReason(reason)}
                      className={`px-4 py-2 rounded-full text-[13px] font-medium border transition-all duration-150 ${
                        active
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-300 hover:border-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {reason}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description textarea */}
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your reason...."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[13px] text-slate-700 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-slate-300 leading-relaxed bg-white"
            />

            {/* Submit */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="px-14 py-2.5 rounded-full text-[14px] font-semibold bg-slate-900 text-white hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
