"use client";

import { useRef, useState } from "react";
import { Check, CalendarDays } from "lucide-react";

interface AttemptedContactModalProps {
  leadName: string;
  onSave: (dueDate: string) => void;
  onCancel: () => void;
}

function formatDisplay(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y.slice(2)}`;
}

function addDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function AttemptedContactModal({ leadName, onSave, onCancel }: AttemptedContactModalProps) {
  const [dueDate, setDueDate] = useState<string>(addDays(2));
  const dateInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-2xl w-[420px] mx-4 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.2)]">

        {/* Inner dashed border */}
        <div className="m-4 border-2 border-dashed border-slate-200 rounded-xl px-6 pt-8 pb-6 flex flex-col items-center gap-3 text-center">
          {/* Checkmark */}
          <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center shadow-md">
            <Check size={22} strokeWidth={3} className="text-white" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 mt-1">Lead Status Changed!</h2>
          <p className="text-sm text-slate-500 -mt-1">
            You just moved your lead to attempted contact
          </p>

          {/* Next action box */}
          <div className="w-full mt-2 border-2 border-dashed border-blue-200 bg-blue-50/40 rounded-xl px-5 py-4 text-center space-y-2">
            <p className="text-sm font-bold text-slate-900">
              Your Next Action: Follow-up to Contact
            </p>
            <p className="text-sm text-slate-500">Due date: +2 days ;</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-base font-bold text-slate-900">{formatDisplay(dueDate)}</span>
              <button
                type="button"
                onClick={() => dateInputRef.current?.showPicker()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-sm"
              >
                <CalendarDays size={12} />
                Change
              </button>
              <input
                ref={dateInputRef}
                type="date"
                value={dueDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDueDate(e.target.value)}
                className="absolute opacity-0 w-0 h-0 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={() => onSave(dueDate)}
            className="w-full bg-slate-900 hover:bg-black text-white text-sm font-semibold py-3 rounded-xl transition-colors duration-150"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
