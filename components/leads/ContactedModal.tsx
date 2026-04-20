"use client";

import { useRef, useState } from "react";
import { Check, CalendarDays, X } from "lucide-react";
import { LeadStatus } from "@/lib/types";

type Outcome = "nurture" | "inactive" | null;

export interface ContactedModalResult {
  targetStatus: LeadStatus;
  dueDate?: string;
  reason?: string;
  reasonNote?: string;
}

interface ContactedModalProps {
  leadName: string;
  onSave: (result: ContactedModalResult) => void;
  onCancel: () => void;
  /** Same allocation flow as dragging a lead to the Allocation column */
  onStartAllocation: () => void;
}

// ─── Reason chips ─────────────────────────────────────────────────────────────

function ReasonChips({ options, selected, onSelect }: { options: string[]; selected: string | null; onSelect: (v: string) => void }) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onSelect(opt)}
          className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-150 ${
            selected === opt
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-700 border-slate-300 hover:border-slate-500"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Next action date (stacked) ───────────────────────────────────────────────

function NextActionDate({ label, dueDate, onChange, inline = false }: { label: string; dueDate: string; onChange: (v: string) => void; inline?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const changeBtn = (
    <button
      type="button"
      onClick={() => ref.current?.showPicker()}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
    >
      <CalendarDays size={12} />
      Change date
    </button>
  );
  return (
    <div className="flex flex-col items-center gap-1.5">
      <p className="text-sm font-bold text-slate-900 text-center">{label}</p>
      {inline ? (
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <span className="text-sm text-slate-500">Due date: +2 days ;</span>
          <span className="text-base font-bold text-slate-900">{formatDate(dueDate)}</span>
          {changeBtn}
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500">Due date: +2 days ;</p>
          <div className="flex items-center gap-3">{<span className="text-base font-bold text-slate-900">{formatDate(dueDate)}</span>}{changeBtn}</div>
        </>
      )}
      <input
        ref={ref}
        type="date"
        value={dueDate}
        min={new Date().toISOString().slice(0, 10)}
        onChange={(e) => onChange(e.target.value)}
        className="absolute opacity-0 w-0 h-0 pointer-events-none"
      />
    </div>
  );
}

function addDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y.slice(2)}`;
}

// ─── Outcome toggle button ────────────────────────────────────────────────────

function OutcomeButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm font-semibold rounded-full border-2 transition-all duration-150 ${
        active
          ? "bg-slate-900 text-white border-slate-900"
          : "bg-white text-slate-800 border-slate-300 hover:border-slate-500"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

const subtitleMap: Record<NonNullable<Outcome>, string> = {
  nurture: "You just moved your lead to Contacted",
  inactive: "You just moved your lead to Inactive",
};

const targetStatusMap: Record<NonNullable<Outcome>, LeadStatus> = {
  nurture: "Contacted",
  inactive: "Inactive",
};

const FOLLOW_UP_REASONS = ["Budget", "Busy", "Internal Delay", "Other"];
const INACTIVE_REASONS  = ["Budget", "Busy", "Internal issue", "Other"];

export function ContactedModal({ onSave, onCancel, onStartAllocation }: ContactedModalProps) {
  const [outcome, setOutcome]   = useState<Outcome>(null);
  const [dueDate, setDueDate]   = useState(addDays(2));
  const [reason, setReason]         = useState<string | null>(null);
  const [reasonNote, setReasonNote] = useState<string>("");

  const subtitle = outcome ? subtitleMap[outcome] : "You just moved your lead to contacted";

  function handleSave() {
    if (!outcome) return;
    onSave({
      targetStatus: targetStatusMap[outcome],
      dueDate: outcome === "nurture" ? dueDate : undefined,
      reason: reason ?? undefined,
      reasonNote: reasonNote.trim() ? reasonNote.trim() : undefined,
    });
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-2xl w-[520px] mx-4 shadow-[0_24px_64px_rgba(0,0,0,0.22)] overflow-hidden">

        {/* Close */}
        <div className="flex justify-end pt-4 pr-4">
          <button type="button" onClick={onCancel} className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-8 pb-7 flex flex-col items-center gap-4 -mt-2">
          {/* Checkmark */}
          <div className="w-11 h-11 rounded-full bg-slate-900 flex items-center justify-center shadow-md">
            <Check size={20} strokeWidth={3} className="text-white" />
          </div>

          {/* Title */}
          <div className="text-center -mt-1">
            <h2 className="text-xl font-bold text-slate-900">Lead Status Changed!</h2>
            <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
          </div>

          {/* Outcome buttons */}
          <div className="flex flex-col items-center gap-3 w-full">
            <p className="text-sm font-bold text-slate-900">What&apos;s the outcome?</p>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <OutcomeButton
                label="Start Allocation"
                active={false}
                onClick={onStartAllocation}
              />
              <OutcomeButton
                label="Follow Up Later"
                active={outcome === "nurture"}
                onClick={() => { setOutcome("nurture"); setReason(null); setReasonNote(""); }}
              />
              <OutcomeButton
                label="Not Interested"
                active={outcome === "inactive"}
                onClick={() => { setOutcome("inactive"); setReason(null); setReasonNote(""); }}
              />
            </div>
          </div>

          {/* Outcome-specific content */}
          {outcome && (
            <div className="w-full border-t border-slate-100 pt-4 flex flex-col gap-4">

              {/* FOLLOW UP LATER */}
              {outcome === "nurture" && (
                <>
                  <NextActionDate label="Your Next Action: Follow-up on Contact" dueDate={dueDate} onChange={setDueDate} inline />
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">Reason</p>
                    <ReasonChips options={FOLLOW_UP_REASONS} selected={reason} onSelect={setReason} />
                  </div>
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-xs font-semibold text-slate-600">Additional notes <span className="text-slate-400 font-normal">(optional)</span></label>
                    <textarea
                      rows={3}
                      value={reasonNote}
                      onChange={(e) => setReasonNote(e.target.value)}
                      placeholder="Add more context about why follow-up was deferred…"
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#002f93] placeholder:text-slate-400 leading-relaxed"
                    />
                  </div>
                </>
              )}

              {/* NOT INTERESTED */}
              {outcome === "inactive" && (
                <div className="flex flex-col items-center gap-2 w-full">
                  <p className="text-sm font-bold text-slate-900">Reason</p>
                  <ReasonChips options={INACTIVE_REASONS} selected={reason} onSelect={setReason} />
                  <div className="flex flex-col gap-1.5 w-full mt-1">
                    <label className="text-xs font-semibold text-slate-600">Additional notes <span className="text-slate-400 font-normal">(optional)</span></label>
                    <textarea
                      rows={3}
                      value={reasonNote}
                      onChange={(e) => setReasonNote(e.target.value)}
                      placeholder="Add more context about why the lead is not interested…"
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#002f93] placeholder:text-slate-400 leading-relaxed"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Save — only for nurture / inactive */}
          {outcome && (
            <button
              type="button"
              onClick={handleSave}
              className="w-full bg-slate-900 hover:bg-black text-white text-sm font-semibold py-3 rounded-xl transition-colors duration-150 mt-1"
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
