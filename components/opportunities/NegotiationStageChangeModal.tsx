"use client";

import { useState } from "react";
import {
  X, CheckCircle2, ChevronDown, Calendar, DownloadCloud, Eye,
  FileText, ArrowRight,
} from "lucide-react";
import { Opportunity } from "@/lib/types";
import * as XLSX from "xlsx";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseMoney(value: string | undefined | null): number {
  if (!value) return 0;
  return parseFloat(String(value).replace(/[^0-9.-]/g, "")) || 0;
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

// ─── Shared UI primitives (mirrored from OpportunityStageChangeModal) ──────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 text-[13px] text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93]/30 focus:border-[#002f93] transition-colors bg-white placeholder:text-slate-400"
    />
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none px-3 py-2 text-[13px] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93]/30 focus:border-[#002f93] transition-colors bg-white cursor-pointer pr-8
          ${value ? "text-slate-800" : "text-slate-400"}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}

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
  mono,
}: {
  label: string;
  value: React.ReactNode;
  highlight?: "red" | "green" | "blue";
  mono?: boolean;
}) {
  const valClass = highlight === "red"
    ? "text-red-600 font-semibold"
    : highlight === "green"
    ? "text-emerald-600 font-semibold"
    : highlight === "blue"
    ? "text-[#002f93] font-semibold"
    : "text-slate-800";

  return (
    <div>
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-[13px] leading-snug ${valClass} ${mono ? "font-mono" : ""}`}>
        {value || <span className="text-slate-300">—</span>}
      </p>
    </div>
  );
}

// ─── Quote totals strip ────────────────────────────────────────────────────────

function QuoteTotalsStrip({
  grandTotal,
  adjustment,
  subtotal,
}: {
  grandTotal: string;
  adjustment: string;
  subtotal: string;
}) {
  const grand = parseMoney(grandTotal);
  const adj = parseMoney(adjustment);
  const sub = parseMoney(subtotal);

  // Pre-adjustment = subtotal without the adjustment applied
  const preAdjustment = grand - adj;
  const hasAdjustment = adj !== 0;

  return (
    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
      {hasAdjustment ? (
        <>
          {/* Original amount */}
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-0.5">
              Original
            </p>
            <p className="text-[14px] font-semibold text-slate-500 tabular-nums line-through decoration-slate-400">
              {formatMoney(preAdjustment)}
            </p>
          </div>

          {/* Arrow + adjustment badge */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums
                ${adj < 0 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}
            >
              {adj < 0 ? "−" : "+"}{formatMoney(Math.abs(adj))}
            </span>
            <ArrowRight size={14} className="text-slate-300" />
          </div>

          {/* Grand total */}
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-0.5">
              Grand Total
            </p>
            <p className="text-[18px] font-bold text-[#002f93] tabular-nums">
              {formatMoney(grand)}
            </p>
          </div>
        </>
      ) : (
        /* No adjustment — just show grand total */
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-0.5">
            Grand Total
          </p>
          <p className="text-[18px] font-bold text-[#002f93] tabular-nums">
            {formatMoney(grand)}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Quote items read-only table ───────────────────────────────────────────────

function QuoteItemsReadOnly({ opportunity }: { opportunity: Opportunity }) {
  const [open, setOpen] = useState(false);
  const items = opportunity.quoteData?.items ?? [];

  if (items.length === 0) return null;

  return (
    <div>
      <SectionHeader collapsible open={open} onToggle={() => setOpen((v) => !v)}>
        Approved Quote Items ({items.length})
      </SectionHeader>

      {open && (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[32px_1fr_80px_100px_100px] bg-slate-800 text-white">
            <div className="px-2 py-2.5 text-[11px] font-bold text-center">#</div>
            <div className="px-3 py-2.5 text-[11px] font-bold">Product / SKU</div>
            <div className="px-3 py-2.5 text-[11px] font-bold text-center">Qty</div>
            <div className="px-3 py-2.5 text-[11px] font-bold text-right">Unit Price</div>
            <div className="px-3 py-2.5 text-[11px] font-bold text-right">Amount</div>
          </div>

          <div className="divide-y divide-slate-100">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className={`grid grid-cols-[32px_1fr_80px_100px_100px] items-center ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}`}
              >
                <div className="flex items-center justify-center py-2.5 text-[11px] text-slate-400 font-semibold">{idx + 1}</div>
                <div className="px-3 py-2.5">
                  <p className="text-[12px] font-medium text-slate-800 leading-snug">{item.productName || <span className="text-slate-300 italic">—</span>}</p>
                  {item.description && (
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{item.description}</p>
                  )}
                </div>
                <div className="px-3 py-2.5 text-[12px] text-slate-700 text-center">{item.quantity}</div>
                <div className="px-3 py-2.5 text-[12px] text-slate-700 text-right tabular-nums">
                  {item.listPrice ? `$${item.listPrice}` : "—"}
                </div>
                <div className="px-3 py-2.5 text-[12px] font-semibold text-slate-800 text-right tabular-nums">
                  {item.amount ? `$${item.amount}` : "—"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Download quote ────────────────────────────────────────────────────────────

function downloadQuote(opportunity: Opportunity) {
  const q = opportunity.quoteData;
  if (!q) return;

  // Summary sheet
  const summaryData = [
    ["APPROVED QUOTE SUMMARY"],
    [],
    ["Quote Subject", q.subject],
    ["Account Name", q.accountName],
    ["Opportunity Name", q.opportunityName],
    ["Quote Stage", q.quoteStage],
    ["Valid Date", q.validDate],
    ["Contact Name", q.contactName],
    ["Business Type", q.businessType],
    ["Opportunity Owner", q.opportunityOwner],
    [],
    ["FINANCIAL SUMMARY"],
    ["Subtotal", `$${q.subtotal}`],
    ["Discount", q.discount || "$0"],
    ["Tax", q.tax || "$0"],
    ["Adjustment", q.adjustment || "$0"],
    ["Grand Total", `$${q.grandTotal}`],
    [],
    ["COMPARISON"],
    ["Expected Revenue", opportunity.expectedRevenue],
    ["Quoted Grand Total", `$${q.grandTotal}`],
  ];

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  summaryWs["!cols"] = [{ wch: 28 }, { wch: 32 }];

  // Items sheet
  const itemsHeader = ["#", "Product Name (SKU)", "Description", "Quantity", "Unit Price", "Amount"];
  const itemsData = [
    itemsHeader,
    ...q.items.map((item, i) => [
      i + 1,
      item.productName,
      item.description,
      item.quantity,
      item.listPrice,
      `$${item.amount}`,
    ]),
    [],
    ["", "", "", "", "Subtotal", `$${q.subtotal}`],
    ["", "", "", "", "Discount", q.discount || "$0"],
    ["", "", "", "", "Tax", q.tax || "$0"],
    ["", "", "", "", "Adjustment", q.adjustment || "$0"],
    ["", "", "", "", "Grand Total", `$${q.grandTotal}`],
  ];
  const itemsWs = XLSX.utils.aoa_to_sheet(itemsData);
  itemsWs["!cols"] = [{ wch: 4 }, { wch: 30 }, { wch: 28 }, { wch: 10 }, { wch: 14 }, { wch: 14 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, summaryWs, "Quote Summary");
  XLSX.utils.book_append_sheet(wb, itemsWs, "Quote Items");

  const fileName = `Approved_Quote_${q.subject.replace(/\s+/g, "_") || opportunity.opportunityRef}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

// ─── Download & View Quote action card ────────────────────────────────────────

function QuoteDownloadCard({ opportunity }: { opportunity: Opportunity }) {
  const q = opportunity.quoteData;

  return (
    <div className="rounded-xl border border-[#002f93]/20 bg-[#002f93]/3 overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-[#002f93] to-[#0050d8]" />
      <div className="px-4 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#002f93]/10 flex items-center justify-center flex-shrink-0">
            <FileText size={18} className="text-[#002f93]" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-slate-800 leading-snug truncate">
              {q?.subject ? `Quote: ${q.subject}` : "Approved Quote Document"}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Grand Total: <span className="font-semibold text-[#002f93]">{q?.grandTotal ? `$${q.grandTotal}` : "—"}</span>
              {q?.validDate && (
                <> · Valid until: <span className="font-medium">{q.validDate}</span></>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => downloadQuote(opportunity)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#002f93] border border-[#002f93]/20 hover:bg-[#002f93]/5 transition-colors"
          >
            <DownloadCloud size={13} />
            Download
          </button>
          <button
            type="button"
            onClick={() => downloadQuote(opportunity)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white bg-[#002f93] hover:bg-[#001f6b] transition-colors"
          >
            <Eye size={13} />
            View Quote
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Modal ────────────────────────────────────────────────────────────────

export interface NegotiationStageChangeModalProps {
  opportunity: Opportunity;
  onSave: (updates: { amount: string; campaignSource: string; followUpDate: string }) => void;
  onCancel: () => void;
}

export function NegotiationStageChangeModal({
  opportunity,
  onSave,
  onCancel,
}: NegotiationStageChangeModalProps) {
  const q = opportunity.quoteData;

  // Editable fields
  const [amount, setAmount] = useState(opportunity.amount ?? "");
  const [campaignSource, setCampaignSource] = useState(opportunity.campaignSource ?? "");
  const [followUpDate, setFollowUpDate] = useState(q?.followUpDate ?? "");
  const [oppInfoOpen, setOppInfoOpen] = useState(false);

  function handleSave() {
    onSave({ amount, campaignSource, followUpDate });
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[70]" onClick={onCancel} />

      {/* Modal */}
      <div className="fixed inset-0 z-[71] flex items-start justify-center overflow-y-auto py-6 px-4">
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[860px] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Modal Header ── */}
          <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={18} className="text-amber-500" />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-slate-900">Opportunity Stage Change</h2>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  You just moved your opportunity to{" "}
                  <span className="font-semibold text-amber-600">Negotiation / Review</span>
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* ── Scrollable Body ── */}
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5 max-h-[calc(100vh-160px)]">

            {/* Note banner */}
            <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-100 rounded-lg px-3.5 py-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
              <p className="text-[12px] text-amber-800 font-medium">
                Note: You might want to review and update these fields before continuing to negotiations.
              </p>
            </div>

            {/* Editable quick-update fields */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <Label>Amount</Label>
                <Input value={amount} onChange={setAmount} placeholder="Enter amount" />
              </div>
              <div>
                <Label>Campaign Source</Label>
                <Select
                  value={campaignSource}
                  onChange={setCampaignSource}
                  options={["Q2 Medical Campaign", "Partner Referral Program", "Medical Trade Show 2026", "LinkedIn Outreach Q2", "Cold Call", "Internal Referral", "External Referral", "Trade Show"]}
                  placeholder="Select campaign source"
                />
              </div>
            </div>

            {/* ── Quote download / view card ── */}
            <QuoteDownloadCard opportunity={opportunity} />

            {/* ── Quote Information section ── */}
            <div>
              <SectionHeader>Quote Information</SectionHeader>
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
                  <ReadOnlyField label="Carrier" value={q?.shippingMethod || "—"} />
                </div>
                {/* Right */}
                <div className="space-y-3.5">
                  <ReadOnlyField label="Quote Stage" value={q?.quoteStage || "—"} />
                  <ReadOnlyField
                    label="Valid Until"
                    value={
                      q?.validDate ? (
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-slate-400" />
                          {q.validDate}
                        </span>
                      ) : null
                    }
                  />
                </div>
              </div>
            </div>

            {/* ── Quote totals ── */}
            <QuoteTotalsStrip
              grandTotal={q?.grandTotal ?? "0"}
              adjustment={q?.adjustment ?? "0"}
              subtotal={q?.subtotal ?? "0"}
            />

            {/* ── Quote items (collapsible, read-only) ── */}
            <QuoteItemsReadOnly opportunity={opportunity} />

            {/* ── Opportunity Information (collapsible) ── */}
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
                    <ReadOnlyField label="Account Name" value={opportunity.accountName} />
                    <ReadOnlyField label="Contact Name" value={opportunity.contactName} />
                    <ReadOnlyField label="Pipeline" value={opportunity.pipeline} />
                    <ReadOnlyField label="Business Type" value={opportunity.businessType} />
                    <ReadOnlyField label="Created Date" value={opportunity.createdDate} />
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
                    <ReadOnlyField
                      label="Expected Revenue"
                      value={<span className="text-emerald-600">{opportunity.expectedRevenue}</span>}
                    />
                    <ReadOnlyField label="Amount" value={amount || "—"} />
                    <ReadOnlyField label="Lead Source" value={opportunity.leadSource} />
                    <ReadOnlyField label="Probability" value="10%" />
                    <ReadOnlyField label="Campaign Source" value={campaignSource || "—"} />
                  </div>
                </div>
              )}
            </div>

            {/* ── Your Next Action ── */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <ArrowRight size={14} className="text-[#002f93]" />
                <p className="text-[12px] font-bold text-slate-700">
                  Your Next Action: Follow-up on Negotiations
                </p>
              </div>
              <div className="flex items-end gap-6">
                <div className="w-48">
                  <Label>Due Date</Label>
                  <div className="relative">
                    <Input value={followUpDate} onChange={setFollowUpDate} type="date" />
                    <Calendar size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer pb-0.5">
                  <input type="checkbox" className="rounded accent-[#002f93]" />
                  <span className="text-[12px] text-slate-600">Done</span>
                </label>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="flex-shrink-0 px-5 py-4 border-t border-slate-100 bg-white rounded-b-2xl flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {}}
              className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-[#002f93] border border-[#002f93]/20 rounded-lg hover:bg-[#002f93]/5 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              Send Email
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-[13px] font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 text-[13px] font-semibold text-white bg-[#002f93] rounded-lg hover:bg-[#001f6b] transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
