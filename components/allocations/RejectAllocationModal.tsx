"use client";

import { useState } from "react";
import { X, Ban, AlertCircle } from "lucide-react";

export const ALLOCATION_REJECTION_CATEGORIES = [
  "Insufficient inventory",
  "Margin too low",
  "Capacity constraints",
  "Other",
] as const;

export type AllocationRejectionCategory = (typeof ALLOCATION_REJECTION_CATEGORIES)[number];

export interface RejectAllocationModalResult {
  category: string;
  detail?: string;
}

interface RejectAllocationModalProps {
  onSubmit: (result: RejectAllocationModalResult) => void;
  onCancel: () => void;
}

function ReasonChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-150 ${
        active
          ? "bg-red-600 text-white border-red-600"
          : "bg-white text-slate-700 border-slate-300 hover:border-slate-500"
      }`}
    >
      {label}
    </button>
  );
}

export function RejectAllocationModal({ onSubmit, onCancel }: RejectAllocationModalProps) {
  const [category, setCategory] = useState<string | null>(null);
  const [detail, setDetail] = useState("");
  const [touched, setTouched] = useState(false);

  const showError = touched && !category;

  function handleSubmit() {
    setTouched(true);
    if (!category) return;
    onSubmit({
      category,
      detail: detail.trim() || undefined,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <Ban size={17} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Reject allocation</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                The linked lead will move to Inactive.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          <div>
            <p className="block text-sm font-semibold text-slate-800 mb-2">
              Reason <span className="text-red-500">*</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {ALLOCATION_REJECTION_CATEGORIES.map((opt) => (
                <ReasonChip
                  key={opt}
                  label={opt}
                  active={category === opt}
                  onClick={() => {
                    setCategory((c) => (c === opt ? null : opt));
                    setTouched(false);
                  }}
                />
              ))}
            </div>
            {showError && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 mt-2">
                <AlertCircle size={12} />
                Select a reason for rejection.
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Additional notes <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Add context (required detail if you chose Other)…"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93] resize-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 px-4 py-2.5 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reject allocation
          </button>
        </div>
      </div>
    </div>
  );
}
