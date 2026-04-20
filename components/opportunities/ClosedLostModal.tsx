"use client";

import { useState } from "react";
import { X, XCircle, Calendar, ChevronDown } from "lucide-react";
import { Opportunity } from "@/lib/types";

// ─── Shared UI primitives ─────────────────────────────────────────────────────

function SectionHeader({
  children,
  collapsible,
  open,
  onToggle,
}: {
  children: React.ReactNode;
  collapsible?: boolean;
  open?: boolean;
  onToggle?: () => void;
}) {
  if (collapsible) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-2 mb-3 group"
      >
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-700 transition-colors whitespace-nowrap">
          {children}
        </span>
        <div className="flex-1 h-px bg-slate-200" />
        <ChevronDown
          size={14}
          className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
        />
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
        {children}
      </span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

function ReadOnlyField({
  label,
  value,
  highlight,
}: {
  label: string;
  value: React.ReactNode;
  highlight?: "red" | "green" | "blue";
}) {
  const valClass =
    highlight === "red"
      ? "text-red-600 font-semibold"
      : highlight === "green"
      ? "text-emerald-600 font-semibold"
      : highlight === "blue"
      ? "text-[#002f93] font-semibold"
      : "text-slate-800";

  return (
    <div>
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p className={`text-[13px] leading-snug ${valClass}`}>
        {value || <span className="text-slate-300">—</span>}
      </p>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export interface ClosedLostModalProps {
  opportunity: Opportunity;
  onClose: () => void;
}

export function ClosedLostModal({ opportunity, onClose }: ClosedLostModalProps) {
  const q = opportunity.quoteData;
  const [quoteInfoOpen, setQuoteInfoOpen] = useState(true);
  const [oppInfoOpen, setOppInfoOpen] = useState(true);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[70]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-[71] flex items-start justify-center overflow-y-auto py-6 px-4">
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[860px] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="relative flex flex-col items-center pt-8 pb-5 px-5 border-b border-slate-100">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X size={16} />
            </button>

            {/* Icon badge */}
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3 ring-4 ring-red-50">
              <XCircle size={26} className="text-red-500" />
            </div>

            <h2 className="text-[20px] font-bold text-slate-900 text-center tracking-tight">
              Sorry, this lead is closed lost
            </h2>
            <p className="text-[12px] text-slate-500 mt-1">
              The lead is closed lost.
            </p>
          </div>

          {/* ── Scrollable Body ── */}
          <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5 max-h-[calc(100vh-200px)]">

            {/* ── Quote Information ── */}
            <div>
              <SectionHeader
                collapsible
                open={quoteInfoOpen}
                onToggle={() => setQuoteInfoOpen((v) => !v)}
              >
                Quote Information
              </SectionHeader>

              {quoteInfoOpen && (
                <div className="grid grid-cols-2 gap-x-8 gap-y-3.5">
                  {/* Left */}
                  <div className="space-y-3.5">
                    <ReadOnlyField
                      label="Subject"
                      value={
                        q?.subject ? (
                          <span className="text-[#002f93] hover:underline cursor-pointer font-medium">
                            {q.subject}
                          </span>
                        ) : null
                      }
                    />
                    <ReadOnlyField label="Valid until" value={q?.validDate || null} />
                    <ReadOnlyField label="Carrier" value={q?.shippingMethod || null} />
                  </div>
                  {/* Right */}
                  <div className="space-y-3.5">
                    <ReadOnlyField
                      label="Grand Total"
                      value={
                        q?.grandTotal ? (
                          <span className="text-[#002f93] font-bold text-[15px]">
                            ${q.grandTotal}
                          </span>
                        ) : null
                      }
                      highlight="blue"
                    />
                    <ReadOnlyField label="Quote Stage" value={q?.quoteStage || null} />
                  </div>
                </div>
              )}
            </div>

            {/* ── Opportunity Information ── */}
            <div>
              <SectionHeader
                collapsible
                open={oppInfoOpen}
                onToggle={() => setOppInfoOpen((v) => !v)}
              >
                Opportunity Information
              </SectionHeader>

              {oppInfoOpen && (
                <div className="grid grid-cols-2 gap-x-8 gap-y-3.5">
                  {/* Left */}
                  <div className="space-y-3.5">
                    <ReadOnlyField label="Opportunity Owner" value={opportunity.assignedTo} />
                    <ReadOnlyField label="Opportunity Name" value={opportunity.opportunityName} />
                    <ReadOnlyField
                      label="Expected Revenue"
                      value={
                        opportunity.expectedRevenue ? (
                          <span className="text-[#002f93]">{opportunity.expectedRevenue}</span>
                        ) : null
                      }
                      highlight="blue"
                    />
                    <ReadOnlyField label="Amount" value={opportunity.amount || null} />
                    <ReadOnlyField label="Lead Source" value={opportunity.leadSource} />
                    <ReadOnlyField label="Probability" value="10%" />
                    <ReadOnlyField label="Campaign Source" value={opportunity.campaignSource || null} />
                  </div>
                  {/* Right */}
                  <div className="space-y-3.5">
                    <ReadOnlyField
                      label="Closing Date"
                      value={
                        opportunity.closingDate ? (
                          <span className="flex items-center gap-1.5 text-red-600">
                            <Calendar size={12} />
                            {new Date(opportunity.closingDate).toLocaleDateString("en-US", {
                              month: "2-digit",
                              day: "2-digit",
                              year: "2-digit",
                            })}{" "}
                            ;{" "}
                            {new Date(opportunity.closingDate).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}
                          </span>
                        ) : null
                      }
                    />
                    <ReadOnlyField label="Account Name" value={opportunity.accountName} />
                    <ReadOnlyField label="Contact Name" value={opportunity.contactName} />
                    <ReadOnlyField label="Pipeline" value={opportunity.pipeline} />
                    <ReadOnlyField label="Business Type" value={opportunity.businessType} />
                    <ReadOnlyField
                      label="Created Date"
                      value={
                        opportunity.createdDate ? (
                          <span className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-slate-400" />
                            {opportunity.createdDate}
                          </span>
                        ) : null
                      }
                    />
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* ── Footer ── */}
          <div className="flex-shrink-0 px-5 py-4 border-t border-slate-100 bg-white rounded-b-2xl flex items-center justify-center">
            <button
              type="button"
              onClick={onClose}
              className="px-10 py-2 text-[13px] font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
