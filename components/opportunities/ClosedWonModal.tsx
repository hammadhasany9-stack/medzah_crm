"use client";

import { useState } from "react";
import {
  X, CheckCircle2, Calendar, DownloadCloud, Eye, FileText, ArrowRight, ChevronDown, Save,
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

// ─── Download helper ──────────────────────────────────────────────────────────

function downloadQuote(opportunity: Opportunity) {
  const q = opportunity.quoteData;
  if (!q) return;

  const summaryData = [
    ["FINAL QUOTE — CLOSED WON"],
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

  const fileName = `Final_Quote_${q.subject.replace(/\s+/g, "_") || opportunity.opportunityRef}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

// ─── Quote download card ──────────────────────────────────────────────────────

function QuoteDownloadCard({ opportunity }: { opportunity: Opportunity }) {
  const q = opportunity.quoteData;
  const grand = parseMoney(q?.grandTotal);

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-emerald-600" />
      <div className="px-4 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <FileText size={18} className="text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-slate-800 leading-snug truncate">
              {q?.subject ? `Final Quote: ${q.subject}` : "Final Quote Document"}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Grand Total:{" "}
              <span className="font-semibold text-emerald-700">
                {grand > 0 ? formatMoney(grand) : "—"}
              </span>
              {q?.validDate && (
                <>
                  {" "}
                  · Valid until:{" "}
                  <span className="font-medium">{q.validDate}</span>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => downloadQuote(opportunity)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-emerald-700 border border-emerald-300 hover:bg-emerald-100 transition-colors"
          >
            <DownloadCloud size={13} />
            Download
          </button>
          <button
            type="button"
            onClick={() => downloadQuote(opportunity)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
          >
            <Eye size={13} />
            View Quote
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Quote items read-only table ──────────────────────────────────────────────

function QuoteItemsReadOnly({ opportunity }: { opportunity: Opportunity }) {
  const [open, setOpen] = useState(false);
  const items = opportunity.quoteData?.items ?? [];
  if (items.length === 0) return null;

  return (
    <div>
      <SectionHeader collapsible open={open} onToggle={() => setOpen((v) => !v)}>
        Final Quote Items ({items.length})
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
                <div className="flex items-center justify-center py-2.5 text-[11px] text-slate-400 font-semibold">
                  {idx + 1}
                </div>
                <div className="px-3 py-2.5">
                  <p className="text-[12px] font-medium text-slate-800 leading-snug">
                    {item.productName || <span className="text-slate-300 italic">—</span>}
                  </p>
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
          {/* Totals footer */}
          {opportunity.quoteData?.grandTotal && (
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-2.5 flex justify-end">
              <div className="space-y-1 min-w-[180px]">
                {opportunity.quoteData.discount && (
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Discount</span>
                    <span className="tabular-nums">{opportunity.quoteData.discount}</span>
                  </div>
                )}
                {opportunity.quoteData.tax && (
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Tax</span>
                    <span className="tabular-nums">{opportunity.quoteData.tax}</span>
                  </div>
                )}
                {opportunity.quoteData.adjustment && (
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Adjustment</span>
                    <span className="tabular-nums">{opportunity.quoteData.adjustment}</span>
                  </div>
                )}
                <div className="flex justify-between text-[12px] font-bold text-slate-800 border-t border-slate-200 pt-1">
                  <span>Grand Total</span>
                  <span className="tabular-nums text-emerald-700">
                    {formatMoney(parseMoney(opportunity.quoteData.grandTotal))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ────────────────────────────────────────────────────────────────

export interface ClosedWonModalProps {
  opportunity: Opportunity;
  /** Move the card to the Closed Won column and close the modal (no navigation). */
  onSaveToBoard: () => void;
  onGoToCustomerIntake: () => void;
  onSaveAlreadyCustomer: () => void;
  onCancel: () => void;
}

export function ClosedWonModal({
  opportunity,
  onSaveToBoard,
  onGoToCustomerIntake,
  onSaveAlreadyCustomer,
  onCancel,
}: ClosedWonModalProps) {
  const q = opportunity.quoteData;
  const [quoteInfoOpen, setQuoteInfoOpen] = useState(true);
  const [oppInfoOpen, setOppInfoOpen] = useState(true);

  const grand = parseMoney(q?.grandTotal);

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
          {/* ── Celebration Header ── */}
          <div className="relative flex flex-col items-center pt-8 pb-5 px-5 border-b border-slate-100">
            {/* Close button */}
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X size={16} />
            </button>

            {/* Checkmark badge */}
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3 ring-4 ring-emerald-50">
              <CheckCircle2 size={26} className="text-emerald-500" />
            </div>

            <h2 className="text-[20px] font-bold text-slate-900 text-center tracking-tight">
              Congratulations, You Won!!!!
            </h2>
            <p className="text-[12px] text-slate-500 mt-1">
              You just closed won a lead
            </p>
          </div>

          {/* ── Scrollable Body ── */}
          <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5 max-h-[calc(100vh-200px)]">

            {/* ── Final Quote download card ── */}
            {q && <QuoteDownloadCard opportunity={opportunity} />}

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
                        grand > 0 ? (
                          <span className="flex items-center gap-1.5 text-emerald-700 font-bold text-[15px]">
                            {formatMoney(grand)}
                          </span>
                        ) : null
                      }
                      highlight="green"
                    />
                    <ReadOnlyField label="Quote Stage" value={q?.quoteStage || null} />
                  </div>
                </div>
              )}
            </div>

            {/* ── Quote Items (collapsible, read-only) ── */}
            <QuoteItemsReadOnly opportunity={opportunity} />

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
                          <span className="text-emerald-600">
                            {opportunity.expectedRevenue}
                          </span>
                        ) : null
                      }
                      highlight="green"
                    />
                    <ReadOnlyField label="Amount" value={opportunity.amount || null} />
                    <ReadOnlyField label="Lead Source" value={opportunity.leadSource} />
                    <ReadOnlyField label="Probability" value="10%" />
                    <ReadOnlyField label="Campaign Source" value={opportunity.campaignSource || null} />
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
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* ── Footer ── */}
          <div className="flex-shrink-0 px-5 py-4 border-t border-slate-100 bg-white rounded-b-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="flex flex-col items-start sm:items-start gap-1.5 min-w-0 order-2 sm:order-1">
                <p className="text-[11px] text-slate-500 leading-tight">new customer</p>
                <button
                  type="button"
                  onClick={onGoToCustomerIntake}
                  className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <ArrowRight size={14} className="text-slate-500" />
                  Create customer intake form
                </button>
              </div>

              <div className="flex flex-col items-center gap-1.5 order-1 sm:order-2">
                <p className="text-[11px] text-slate-500 leading-tight text-center">Closed Won board</p>
                <button
                  type="button"
                  onClick={onSaveToBoard}
                  className="flex items-center justify-center gap-2 px-6 py-2 text-[13px] font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors w-full sm:w-auto"
                >
                  <Save size={15} className="flex-shrink-0" />
                  Save
                </button>
              </div>

              <div className="flex flex-col items-end gap-1.5 min-w-0 text-right order-3">
                <p className="text-[11px] text-slate-500 leading-tight">Already a customer</p>
                <button
                  type="button"
                  onClick={onSaveAlreadyCustomer}
                  className="px-5 py-2 text-[13px] font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Create contract
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
