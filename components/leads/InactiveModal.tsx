"use client";

import { useState } from "react";
import { X, BanIcon } from "lucide-react";

const INACTIVE_REASONS = ["Budget", "Busy", "Internal issue", "Other"];

export interface InactiveModalResult {
  reason?: string;
  reasonNote?: string;
}

interface InactiveModalProps {
  leadName: string;
  onSave: (result: InactiveModalResult) => void;
  onCancel: () => void;
}

function ReasonChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-150 ${
        active
          ? "bg-slate-900 text-white border-slate-900"
          : "bg-white text-slate-700 border-slate-300 hover:border-slate-500"
      }`}
    >
      {label}
    </button>
  );
}

export function InactiveModal({ leadName, onSave, onCancel }: InactiveModalProps) {
  const [reason,     setReason]     = useState<string | null>(null);
  const [reasonNote, setReasonNote] = useState("");

  function handleSave() {
    onSave({
      reason:     reason ?? undefined,
      reasonNote: reasonNote.trim() || undefined,
    });
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-2xl w-[480px] mx-4 shadow-[0_24px_64px_rgba(0,0,0,0.22)] overflow-hidden">

        {/* Close */}
        <div className="flex justify-end pt-4 pr-4">
          <button
            type="button"
            onClick={onCancel}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-8 pb-8 flex flex-col items-center gap-4 -mt-2">

          {/* Icon */}
          <div className="w-11 h-11 rounded-full bg-red-500 flex items-center justify-center shadow-md">
            <BanIcon size={20} strokeWidth={2.5} className="text-white" />
          </div>

          {/* Title */}
          <div className="text-center -mt-1">
            <h2 className="text-xl font-bold text-slate-900">Lead Marked Inactive</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              <span className="font-semibold text-slate-700">{leadName}</span> has been moved to Inactive
            </p>
          </div>

          {/* Content */}
          <div className="w-full border-t border-slate-100 pt-4 flex flex-col items-center gap-4">

            {/* Reason chips */}
            <div className="flex flex-col items-center gap-2 w-full">
              <p className="text-sm font-bold text-slate-900">Reason</p>
              <div className="flex flex-wrap justify-center gap-2">
                {INACTIVE_REASONS.map((opt) => (
                  <ReasonChip
                    key={opt}
                    label={opt}
                    active={reason === opt}
                    onClick={() => setReason((r) => (r === opt ? null : opt))}
                  />
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-slate-600">
                Additional notes <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={reasonNote}
                onChange={(e) => setReasonNote(e.target.value)}
                placeholder="Add more context about why the lead is not interested…"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#002f93] placeholder:text-slate-400 leading-relaxed"
              />
            </div>
          </div>

          {/* Save */}
          <button
            type="button"
            onClick={handleSave}
            className="w-full bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-3 rounded-xl transition-colors duration-150 mt-1"
          >
            Confirm &amp; Move to Inactive
          </button>
        </div>
      </div>
    </div>
  );
}
