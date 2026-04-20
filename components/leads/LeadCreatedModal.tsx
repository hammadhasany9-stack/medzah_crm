"use client";

import { useState } from "react";
import { Check } from "lucide-react";

interface LeadCreatedModalProps {
  onSave: (when: "today" | "tomorrow") => void;
}

export function LeadCreatedModal({ onSave }: LeadCreatedModalProps) {
  const [when, setWhen] = useState<"today" | "tomorrow">("today");

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl w-[420px] mx-4 shadow-[0_24px_64px_rgba(0,0,0,0.22)] px-8 py-10 flex flex-col items-center gap-5">

        {/* Success icon */}
        <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0">
          <Check size={26} strokeWidth={2.5} className="text-white" />
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900">Lead Created!</h2>
          <p className="text-sm text-slate-400 mt-1">Congratulations! For grabbing a new lead.</p>
        </div>

        {/* Next action */}
        <div className="w-full flex flex-col items-center gap-3 mt-1">
          <p className="text-sm font-bold text-slate-800">
            Your Next Action: <span className="text-slate-900">First Contact</span>
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setWhen("today")}
              className={`px-6 py-2 text-sm font-semibold rounded-xl border-2 transition-all ${
                when === "today"
                  ? "bg-slate-100 border-slate-300 text-slate-900"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setWhen("tomorrow")}
              className={`px-6 py-2 text-sm font-semibold rounded-xl border-2 transition-all ${
                when === "tomorrow"
                  ? "bg-slate-100 border-slate-300 text-slate-900"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              Tomorrow
            </button>
          </div>
        </div>

        {/* Save button */}
        <button
          type="button"
          onClick={() => onSave(when)}
          className="mt-1 w-full py-3 text-sm font-bold bg-slate-900 text-white rounded-2xl hover:bg-black transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
}
