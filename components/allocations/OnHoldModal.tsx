"use client";

import { useState } from "react";
import { X, Clock, AlertCircle } from "lucide-react";

export interface OnHoldModalResult {
  fulfillmentValue: number;
  fulfillmentUnit: "Weeks" | "Months";
  notes: string;
}

interface OnHoldModalProps {
  unavailableCount: number;
  onSubmit: (result: OnHoldModalResult) => void;
  onCancel: () => void;
}

export function OnHoldModal({ unavailableCount, onSubmit, onCancel }: OnHoldModalProps) {
  const [value,   setValue]   = useState<string>("2");
  const [unit,    setUnit]    = useState<"Weeks" | "Months">("Weeks");
  const [notes,   setNotes]   = useState("");
  const [touched, setTouched] = useState(false);

  const numVal = parseInt(value, 10);
  const isValid = !isNaN(numVal) && numVal > 0;
  const showError = touched && !isValid;

  function handleSubmit() {
    setTouched(true);
    if (!isValid) return;
    onSubmit({ fulfillmentValue: numVal, fulfillmentUnit: unit, notes });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Clock size={17} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Place On Hold</h2>
              {unavailableCount > 0 && (
                <p className="text-xs text-slate-500 mt-0.5">
                  {unavailableCount} product{unavailableCount !== 1 ? "s" : ""} unavailable
                </p>
              )}
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

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5">

          {/* Fulfillment time */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Expected Fulfillment Time <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={value}
                onChange={(e) => { setValue(e.target.value); setTouched(false); }}
                placeholder="e.g. 3"
                className={`w-24 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93] font-medium text-slate-800
                  ${showError ? "border-red-300 bg-red-50/40" : "border-slate-200"}`}
              />
              {/* Unit toggle */}
              <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm font-semibold">
                {(["Weeks", "Months"] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnit(u)}
                    className={`px-4 py-2 transition-colors ${
                      unit === u
                        ? "bg-[#002f93] text-white"
                        : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
            {showError && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 mt-2">
                <AlertCircle size={12} />
                Please enter a valid fulfillment duration.
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Notes <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add context about the hold reason or expected restock…"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93] resize-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Actions */}
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
            className="flex-1 px-4 py-2.5 text-sm font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Confirm Hold
          </button>
        </div>
      </div>
    </div>
  );
}
