"use client";

import { useState } from "react";
import {
  X, DownloadCloud, Send, Building2, MapPin, User, Phone, Mail,
  CheckCircle2, Clock, XCircle, Printer,
} from "lucide-react";
import { Opportunity, QuoteData } from "@/lib/types";
import * as XLSX from "xlsx";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseMoney(value: string | undefined | null): number {
  if (!value) return 0;
  return parseFloat(String(value).replace(/[^0-9.-]/g, "")) || 0;
}

function fmt(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function downloadQuoteXLSX(opp: Opportunity, data?: QuoteData) {
  const q = data ?? opp.quoteData;
  if (!q) return;

  const summaryData = [
    ["QUOTE DOCUMENT"],
    [],
    ["Quote Ref", q.quoteId ?? opp.opportunityRef],
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
  ];
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  summaryWs["!cols"] = [{ wch: 28 }, { wch: 32 }];

  const itemsHeader = ["#", "Product Name (SKU)", "Description", "Quantity", "Unit Price", "Amount"];
  const itemsData = [
    itemsHeader,
    ...q.items.map((item, i) => [
      i + 1, item.productName, item.description, item.quantity,
      item.listPrice, `$${item.amount}`,
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

  const fileName = `Quote_${(q.subject || opp.opportunityRef).replace(/\s+/g, "_")}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

// ─── Status chip ──────────────────────────────────────────────────────────────

function StatusChip({ status }: { status: string | undefined }) {
  if (status === "approved") return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
      <CheckCircle2 size={12} /> APPROVED
    </span>
  );
  if (status === "pending") return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
      <Clock size={12} /> PENDING APPROVAL
    </span>
  );
  if (status === "rejected") return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-red-100 text-red-700 border border-red-200">
      <XCircle size={12} /> REJECTED
    </span>
  );
  return null;
}

// ─── Address block ────────────────────────────────────────────────────────────

function AddressBlock({
  title,
  lines,
}: { title: string; lines: string[] }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{title}</p>
      {lines.filter(Boolean).map((line, i) => (
        <p key={i} className="text-[13px] text-slate-700 leading-snug">{line}</p>
      ))}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ViewQuoteModalProps {
  opportunity: Opportunity;
  onClose: () => void;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function ViewQuoteModal({ opportunity, onClose }: ViewQuoteModalProps) {
  const [sendConfirm, setSendConfirm] = useState(false);
  const [quoteVersionTab, setQuoteVersionTab] = useState<"current" | "old">("current");

  const oldRecord =
    opportunity.quoteHistory && opportunity.quoteHistory.length > 0
      ? opportunity.quoteHistory[opportunity.quoteHistory.length - 1]
      : null;

  if (!opportunity.quoteData) return null;

  const q =
    quoteVersionTab === "old" && oldRecord
      ? oldRecord.quoteData
      : opportunity.quoteData;

  const statusForChip =
    quoteVersionTab === "old" && oldRecord ? oldRecord.status : opportunity.quoteStatus;

  const subtotal  = parseMoney(q.subtotal);
  const discount  = parseMoney(q.discount);
  const tax       = parseMoney(q.tax);
  const adjustment = parseMoney(q.adjustment);
  const grandTotal = parseMoney(q.grandTotal);

  const quoteRef = q.quoteId ?? opportunity.opportunityRef;
  const issueDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[70]" onClick={onClose} />
      <div className="fixed inset-0 z-[71] flex items-start justify-center overflow-y-auto py-6 px-4">
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[820px] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >

          {/* ── Toolbar ── */}
          <div className="flex items-center justify-between px-5 py-3 bg-slate-900 text-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <p className="text-[13px] font-semibold text-white/90">Quote Preview</p>
              <StatusChip status={statusForChip} />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => downloadQuoteXLSX(opportunity, q)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white/80 border border-white/20 hover:bg-white/10 transition-colors"
              >
                <DownloadCloud size={13} /> Download XLSX
              </button>
              <button
                type="button"
                onClick={() => setSendConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#002f93] hover:bg-[#001f6b] transition-colors"
              >
                <Send size={13} /> Send to Customer
              </button>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {oldRecord && (
            <div className="px-5 py-2.5 border-b border-slate-200 bg-slate-50/80 flex-shrink-0">
              <div className="flex p-0.5 bg-slate-200/60 rounded-lg max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => setQuoteVersionTab("current")}
                  className={`flex-1 py-2 text-[12px] font-semibold rounded-md transition-colors ${
                    quoteVersionTab === "current"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Current quote
                </button>
                <button
                  type="button"
                  onClick={() => setQuoteVersionTab("old")}
                  className={`flex-1 py-2 text-[12px] font-semibold rounded-md transition-colors ${
                    quoteVersionTab === "old"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Old quote
                </button>
              </div>
              {quoteVersionTab === "old" && (
                <p className="text-center text-[11px] text-slate-500 mt-2">
                  Snapshot before the latest submit (archived {formatDate(oldRecord.archivedAt)})
                </p>
              )}
            </div>
          )}

          {/* ── Quote Document ── */}
          <div className="overflow-y-auto max-h-[calc(100vh-130px)]">

            {/* Quote header */}
            <div className="px-8 pt-8 pb-6 border-b border-slate-100">
              <div className="flex items-start justify-between gap-6">
                {/* Company brand */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#002f93] flex items-center justify-center">
                      <Building2 size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[18px] font-black text-[#002f93] tracking-tight leading-none">MEDZAH</p>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Nexkara CRM</p>
                    </div>
                  </div>
                  <div className="text-[12px] text-slate-500 space-y-0.5 mt-3">
                    <p className="flex items-center gap-1.5"><MapPin size={11} className="flex-shrink-0" /> 123 Commerce Ave, Suite 400</p>
                    <p className="pl-4">Houston, TX 77002, USA</p>
                    <p className="flex items-center gap-1.5"><Phone size={11} className="flex-shrink-0" /> +1 (713) 555-0100</p>
                    <p className="flex items-center gap-1.5"><Mail size={11} className="flex-shrink-0" /> sales@medzah.com</p>
                  </div>
                </div>

                {/* Quote meta */}
                <div className="text-right space-y-2 min-w-[220px]">
                  <div>
                    <p className="text-[36px] font-black text-slate-900 leading-none tracking-tight">QUOTE</p>
                    <p className="text-[13px] font-semibold text-slate-500 mt-1">#{quoteRef}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-right mt-3">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide col-start-1">Issue Date:</p>
                    <p className="text-[12px] text-slate-700">{issueDate}</p>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Valid Until:</p>
                    <p className="text-[12px] text-slate-700">{formatDate(q.validDate)}</p>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Stage:</p>
                    <p className="text-[12px] text-slate-700">{q.quoteStage || "—"}</p>
                  </div>
                  {/* Grand total highlight */}
                  <div className="mt-3 bg-[#002f93] rounded-xl px-4 py-2.5 text-right">
                    <p className="text-[10px] font-semibold text-white/70 uppercase tracking-widest">Grand Total</p>
                    <p className="text-[22px] font-black text-white leading-tight">{fmt(grandTotal)}</p>
                  </div>
                </div>
              </div>

              {/* Subject */}
              {q.subject && (
                <div className="mt-4 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Subject</p>
                  <p className="text-[14px] font-semibold text-slate-800 mt-0.5">{q.subject}</p>
                </div>
              )}
            </div>

            {/* Bill To / Ship To */}
            <div className="px-8 py-5 grid grid-cols-2 gap-6 border-b border-slate-100">
              <div className="space-y-3">
                <AddressBlock
                  title="Bill To"
                  lines={[
                    q.accountName,
                    q.billingStreet,
                    [q.billingCity, q.billingState, q.billingCode].filter(Boolean).join(", "),
                    q.billingCountry,
                  ]}
                />
                <div className="flex items-center gap-1.5 text-[12px] text-slate-600">
                  <User size={12} className="text-slate-400 flex-shrink-0" />
                  <span className="font-semibold">{q.contactName}</span>
                </div>
              </div>
              <div className="space-y-3">
                <AddressBlock
                  title="Ship To"
                  lines={[
                    q.accountName,
                    q.shippingStreet,
                    [q.shippingCity, q.shippingState, q.shippingCode].filter(Boolean).join(", "),
                    q.shippingCountry,
                  ]}
                />
                <div className="text-[12px] text-slate-600 space-y-0.5">
                  <p><span className="text-slate-400">Shipping Method:</span> {q.shippingMethod || "—"}</p>
                  <p><span className="text-slate-400">Customer PO:</span> {q.customerPO || "—"}</p>
                  <p><span className="text-slate-400">Order Submittal:</span> {q.orderSubmittalMethod || "—"}</p>
                </div>
              </div>
            </div>

            {/* Prepared by */}
            <div className="px-8 py-3 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center justify-between text-[12px] text-slate-600">
                <span><span className="text-slate-400">Prepared by:</span> <span className="font-semibold">{q.opportunityOwner}</span></span>
                <span><span className="text-slate-400">Business Type:</span> {q.businessType}</span>
                <span><span className="text-slate-400">Opportunity:</span> {q.opportunityName}</span>
              </div>
            </div>

            {/* Line items table */}
            <div className="px-8 py-5">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[32px_1fr_80px_110px_110px] bg-[#002f93] text-white">
                  <div className="px-2 py-3 text-[11px] font-bold text-center text-white/70">#</div>
                  <div className="px-4 py-3 text-[11px] font-bold text-white/90">PRODUCT / SKU</div>
                  <div className="px-3 py-3 text-[11px] font-bold text-center text-white/90">QTY</div>
                  <div className="px-3 py-3 text-[11px] font-bold text-right text-white/90">UNIT PRICE</div>
                  <div className="px-3 py-3 text-[11px] font-bold text-right text-white/90">AMOUNT</div>
                </div>

                {/* Items */}
                {q.items.length === 0 ? (
                  <div className="px-4 py-6 text-center text-[13px] text-slate-400">No line items</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {q.items.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`grid grid-cols-[32px_1fr_80px_110px_110px] items-start ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}`}
                      >
                        <div className="flex items-center justify-center py-3 text-[11px] text-slate-400 font-semibold">
                          {idx + 1}
                        </div>
                        <div className="px-4 py-3">
                          <p className="text-[13px] font-semibold text-slate-800 leading-snug">
                            {item.productName || <span className="text-slate-300 italic">—</span>}
                          </p>
                          {item.description && (
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{item.description}</p>
                          )}
                        </div>
                        <div className="px-3 py-3 text-[13px] text-slate-700 text-center font-medium">
                          {item.quantity}
                        </div>
                        <div className="px-3 py-3 text-[13px] text-slate-700 text-right tabular-nums">
                          {item.listPrice ? `$${item.listPrice}` : "—"}
                        </div>
                        <div className="px-3 py-3 text-[13px] font-bold text-slate-800 text-right tabular-nums">
                          {item.amount ? `$${item.amount}` : "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Totals footer */}
                <div className="border-t-2 border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex justify-end">
                    <div className="space-y-1.5 min-w-[220px]">
                      <div className="flex justify-between text-[12px] text-slate-600">
                        <span>Subtotal</span>
                        <span className="tabular-nums font-medium">{fmt(subtotal)}</span>
                      </div>
                      {discount !== 0 && (
                        <div className="flex justify-between text-[12px] text-slate-600">
                          <span>Discount</span>
                          <span className="tabular-nums text-red-600">−{fmt(discount)}</span>
                        </div>
                      )}
                      {tax !== 0 && (
                        <div className="flex justify-between text-[12px] text-slate-600">
                          <span>Tax</span>
                          <span className="tabular-nums">{fmt(tax)}</span>
                        </div>
                      )}
                      {adjustment !== 0 && (
                        <div className="flex justify-between text-[12px] text-slate-600">
                          <span>Adjustment</span>
                          <span className="tabular-nums">{adjustment >= 0 ? fmt(adjustment) : `−${fmt(Math.abs(adjustment))}`}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[15px] font-black text-slate-900 border-t-2 border-slate-200 pt-2 mt-2">
                        <span>GRAND TOTAL</span>
                        <span className="tabular-nums text-[#002f93]">{fmt(grandTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {(q.orderNotes || q.description) && (
              <div className="px-8 pb-5">
                <div className="grid grid-cols-2 gap-4">
                  {q.orderNotes && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Order Notes</p>
                      <p className="text-[12px] text-slate-700 leading-relaxed">{q.orderNotes}</p>
                    </div>
                  )}
                  {q.description && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Description</p>
                      <p className="text-[12px] text-slate-700 leading-relaxed">{q.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Terms & Conditions */}
            {q.termsAndConditions && (
              <div className="px-8 pb-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Terms & Conditions</p>
                  <p className="text-[12px] text-slate-600 leading-relaxed whitespace-pre-wrap">{q.termsAndConditions}</p>
                </div>
              </div>
            )}

            {/* Signature area */}
            <div className="px-8 pb-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="h-12 border-b-2 border-slate-300 mb-1" />
                  <p className="text-[11px] text-slate-400">Customer Signature &amp; Date</p>
                </div>
                <div>
                  <div className="h-12 border-b-2 border-slate-300 mb-1" />
                  <p className="text-[11px] text-slate-400">Authorized Signature &amp; Date</p>
                </div>
              </div>
            </div>

          </div>{/* end scrollable body */}
        </div>
      </div>

      {/* Send to Customer confirmation */}
      {sendConfirm && (
        <>
          <div className="fixed inset-0 z-[80] bg-black/40" onClick={() => setSendConfirm(false)} />
          <div className="fixed inset-0 z-[81] flex items-center justify-center px-4">
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] p-6 flex flex-col gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#002f93] flex items-center justify-center">
                  <Send size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900">Send Quote to Customer</h3>
                  <p className="text-[12px] text-slate-400">
                    Send to: <span className="font-semibold text-slate-700">{q.contactName}</span>
                  </p>
                </div>
              </div>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                This will prepare the quote for delivery to <span className="font-semibold">{q.accountName}</span>.
                Download the XLSX to attach to your email or use your email client.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setSendConfirm(false)}
                  className="px-4 py-2 text-[13px] font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => { downloadQuoteXLSX(opportunity, q); setSendConfirm(false); }}
                  className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white bg-[#002f93] rounded-lg hover:bg-[#001f6b] transition-colors"
                >
                  <DownloadCloud size={13} />
                  Download &amp; Send
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
