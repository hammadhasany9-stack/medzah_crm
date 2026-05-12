"use client";

import { useState } from "react";
import {
  X, DownloadCloud, Send,
  CheckCircle2, Clock, XCircle,
} from "lucide-react";
import { Opportunity, QuoteData } from "@/lib/types";
import { getAccountById, getAccountByName } from "@/lib/mock-data/accounts";
import type { AccountRecord } from "@/lib/mock-data/accounts";
import { QuoteCommercialLogisticsShippingReadOnly } from "@/components/quotes/QuoteExtendedSummary";
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

/** Template-style price with space after $ */
function fmtTemplate(value: number): string {
  return fmt(value).replace("$", "$ ");
}

function formatItemUnitPrice(raw: string | undefined): string {
  if (!raw?.trim()) return "—";
  return fmtTemplate(parseMoney(raw));
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
    ["Quote Stage", q.quoteStage],
    ["Valid Date", q.validDate],
    ["Contact Name", q.contactName],
    ["Business Type", q.businessType],
    ["Opportunity Owner", q.opportunityOwner],
    [],
    ["COMMERCIAL & LOGISTICS"],
    ["Payment Terms", q.paymentTerms || "—"],
    ["Expected Demand", q.expectedDemand || "—"],
    ["Delivery Locations", q.deliveryLocations || "—"],
    ["Number of Delivery Locations", q.deliveryLocationCount || "—"],
    ["First Order Delivery", q.firstOrderDeliveryDate || "—"],
    ["Freight Responsibility", q.freightResponsibility || "—"],
    ["Delivery Charges", q.deliveryCharges || "—"],
    ["Carrier Billing", q.carrierBillingMethod || "—"],
    ["Customer Shipping Account #", q.customerShippingAccountNumber || "—"],
    [],
    ["FINANCIAL SUMMARY"],
    ["Subtotal", `$${q.subtotal}`],
    ["Discount", q.discount || "$0"],
    ["Tax", q.tax || "$0"],
    ["Adjustment", q.adjustment || "$0"],
    ["Grand Total (product)", `$${q.grandTotal}`],
    ["Overhead %", q.overheadInfrastructurePercent || "25"],
    ["Overhead ($)", `$${q.overheadAmount ?? "0"}`],
    ["Sales commission %", q.salesCommissionPercent || "0"],
    ["Sales commission ($)", `$${q.salesCommissionAmount ?? "0"}`],
    ["Final Quote Total", `$${q.finalQuoteTotal ?? q.grandTotal}`],
  ];
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  summaryWs["!cols"] = [{ wch: 28 }, { wch: 32 }];

  const itemsHeader = ["Item No.", "Product Details", "Description", "Quantity", "Price", "Total"];
  const itemsData = [
    itemsHeader,
    ...q.items.map((item, i) => [
      i + 1, item.productName, item.description, item.quantity,
      item.listPrice, `$${item.amount}`,
    ]),
    [],
    ["", "", "", "", "Sub Total", `$${q.subtotal}`],
    ["", "", "", "", "Discount", q.discount || "$0"],
    ["", "", "", "", "Tax", q.tax || "$0"],
    ["", "", "", "", "Adjustment", q.adjustment || "$0"],
    ["", "", "", "", "Total", `$${q.grandTotal}`],
    ["", "", "", "", "Overhead", `$${q.overheadAmount ?? "0"}`],
    ["", "", "", "", "Sales commission", `$${q.salesCommissionAmount ?? "0"}`],
    ["", "", "", "", "Final Quote Total", `$${q.finalQuoteTotal ?? q.grandTotal}`],
  ];
  const itemsWs = XLSX.utils.aoa_to_sheet(itemsData);
  itemsWs["!cols"] = [{ wch: 6 }, { wch: 28 }, { wch: 28 }, { wch: 10 }, { wch: 14 }, { wch: 14 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, summaryWs, "Quote Summary");
  XLSX.utils.book_append_sheet(wb, itemsWs, "Quote Items");

  const fileName = `Quote_${(q.subject || opp.opportunityRef).replace(/\s+/g, "_")}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

function isBlank(s: string | undefined): boolean {
  return !s?.trim();
}

/** True when all shipping address parts are empty — Ship To should mirror billing. */
function isShippingAddressEmpty(q: QuoteData): boolean {
  return (
    isBlank(q.shippingStreet) &&
    isBlank(q.shippingCity) &&
    isBlank(q.shippingState) &&
    isBlank(q.shippingCode) &&
    isBlank(q.shippingCountry)
  );
}

/** True when all shipping address parts are empty on an account — mirror billing. */
function isAccountShippingEmpty(acc: AccountRecord): boolean {
  return (
    isBlank(acc.shippingStreet) &&
    isBlank(acc.shippingCity) &&
    isBlank(acc.shippingState) &&
    isBlank(acc.shippingCode) &&
    isBlank(acc.shippingCountry)
  );
}

/** One line per field; country uppercased like the reference PDF. */
function addressLinesFromParts(
  street: string,
  city: string,
  state: string,
  code: string,
  country: string
): string[] {
  const lines: string[] = [];
  if (street.trim()) lines.push(street.trim());
  if (city.trim()) lines.push(city.trim());
  if (state.trim()) lines.push(state.trim());
  if (country.trim()) lines.push(country.trim().toUpperCase());
  if (code.trim()) lines.push(code.trim());
  return lines;
}

function billingAddressLines(q: QuoteData): string[] {
  return addressLinesFromParts(
    q.billingStreet,
    q.billingCity,
    q.billingState,
    q.billingCode,
    q.billingCountry
  );
}

function effectiveShippingAddressLines(q: QuoteData): string[] {
  if (isShippingAddressEmpty(q)) {
    return billingAddressLines(q);
  }
  return addressLinesFromParts(
    q.shippingStreet,
    q.shippingCity,
    q.shippingState,
    q.shippingCode,
    q.shippingCountry
  );
}

function billingAddressLinesFromAccount(acc: AccountRecord): string[] {
  return addressLinesFromParts(
    acc.billingStreet,
    acc.billingCity,
    acc.billingState,
    acc.billingCode,
    acc.billingCountry
  );
}

function effectiveShippingAddressLinesFromAccount(acc: AccountRecord): string[] {
  if (isAccountShippingEmpty(acc)) {
    return billingAddressLinesFromAccount(acc);
  }
  return addressLinesFromParts(
    acc.shippingStreet,
    acc.shippingCity,
    acc.shippingState,
    acc.shippingCode,
    acc.shippingCountry
  );
}

/** CRM account tied to this quote (id first, then name match). */
function resolveAccountForQuote(opp: Opportunity, q: QuoteData): AccountRecord | null {
  const id = opp.linkedAccountId?.trim();
  if (id) {
    const byId = getAccountById(id);
    if (byId) return byId;
  }
  const names = [q.accountName, opp.accountName, opp.companyName];
  const seen = new Set<string>();
  for (const raw of names) {
    const name = raw?.trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    const acc = getAccountByName(name);
    if (acc) return acc;
  }
  return null;
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

function BorderedQuoteAddressBox({
  heading,
  lines,
}: {
  heading: string;
  lines: string[];
}) {
  return (
    <div className="border border-slate-300 bg-slate-50/40 p-4 min-h-[120px] flex flex-col">
      <p className="text-[12px] font-bold text-slate-900 mb-2">{heading}</p>
      <div className="space-y-0.5 flex-1">
        {lines.length === 0 ? (
          <p className="text-[13px] text-slate-400">—</p>
        ) : (
          lines.map((line, i) => (
            <p key={i} className="text-[13px] text-slate-800 leading-snug">
              {line}
            </p>
          ))
        )}
      </div>
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

  const quoteNumber = q.quoteId ?? opportunity.opportunityRef;
  const resolvedAccount = resolveAccountForQuote(opportunity, q);

  const billLines = resolvedAccount
    ? (() => {
        const fromAcc = billingAddressLinesFromAccount(resolvedAccount);
        return fromAcc.length > 0 ? fromAcc : billingAddressLines(q);
      })()
    : billingAddressLines(q);
  const shipLines = resolvedAccount
    ? (() => {
        const fromAcc = effectiveShippingAddressLinesFromAccount(resolvedAccount);
        return fromAcc.length > 0 ? fromAcc : effectiveShippingAddressLines(q);
      })()
    : effectiveShippingAddressLines(q);

  const accountDisplay = (() => {
    if (resolvedAccount) {
      const suffix =
        opportunity.linkedAccountId?.trim() ||
        resolvedAccount.accountNumber?.trim() ||
        resolvedAccount.id;
      return suffix ? `${resolvedAccount.name} (${suffix})` : resolvedAccount.name;
    }
    if (opportunity.linkedAccountId?.trim()) {
      return `${q.accountName} (${opportunity.linkedAccountId})`;
    }
    return q.accountName;
  })();

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
          <div className="overflow-y-auto max-h-[calc(100vh-130px)] text-slate-900">

            {/* Header — template layout */}
            <div className="px-8 pt-8 pb-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-shrink-0 min-w-0">
                  <div className="w-12 h-12 rounded-lg border-2 border-slate-800 flex flex-col items-center justify-center bg-white flex-shrink-0">
                    <span className="text-[11px] font-black leading-none tracking-tight">MD</span>
                    <span className="text-[8px] font-bold tracking-wide text-slate-600 mt-0.5">MEDZAH</span>
                  </div>
                  <p className="text-[22px] font-semibold text-slate-900 tracking-tight leading-tight">Medzah</p>
                </div>
                <div className="text-right flex-shrink-0 min-w-[200px]">
                  <p className="text-[32px] font-bold text-slate-900 leading-none tracking-tight">Quote</p>
                  <p className="text-[12px] text-slate-700 mt-3">
                    <span className="font-bold">Valid Until</span>
                    <span className="block mt-0.5">{formatDate(q.validDate)}</span>
                  </p>
                  <p className="text-[12px] mt-2">
                    <span className="font-bold">Quote Number :</span>{" "}
                    <span className="tabular-nums">{quoteNumber}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Bill To / Ship To */}
            <div className="px-8 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BorderedQuoteAddressBox heading="BILL TO:" lines={billLines} />
              <BorderedQuoteAddressBox heading="SHIP TO:" lines={shipLines} />
            </div>

            {/* Account metadata bar */}
            <div className="px-8 py-3 bg-slate-200/70 border-y border-slate-300">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px]">
                <p>
                  <span className="font-bold">Account Name: </span>
                  <span>{accountDisplay}</span>
                </p>
                
                <p>
                  <span className="font-bold">Contact Name: </span>
                  <span>{q.contactName || "—"}</span>
                </p>
                <p>
                  <span className="font-bold">Quote Stage: </span>
                  <span>{q.quoteStage || "—"}</span>
                </p>
              </div>
            </div>

            {/* Commercial, logistics & shipping (above line items) */}
            <div className="px-8 pb-4 pt-4 border-b border-slate-200">
              <QuoteCommercialLogisticsShippingReadOnly q={q} variant="structured" />
            </div>

            {/* Line items */}
            <div className="px-8 py-5">
              <div className="border border-slate-300 overflow-hidden">
                <div className="grid grid-cols-[44px_1fr_72px_88px_88px] bg-slate-200 border-b border-slate-300">
                  <div className="px-2 py-2.5 text-[11px] font-bold text-slate-800 text-center border-r border-slate-300">Item No.</div>
                  <div className="px-3 py-2.5 text-[11px] font-bold text-slate-800 border-r border-slate-300">Product Details</div>
                  <div className="px-2 py-2.5 text-[11px] font-bold text-slate-800 text-right border-r border-slate-300">Quantity</div>
                  <div className="px-2 py-2.5 text-[11px] font-bold text-slate-800 text-right border-r border-slate-300">Price</div>
                  <div className="px-2 py-2.5 text-[11px] font-bold text-slate-800 text-right">Total</div>
                </div>

                {q.items.length === 0 ? (
                  <div className="px-4 py-6 text-center text-[13px] text-slate-400">No line items</div>
                ) : (
                  <div className="divide-y divide-slate-200 bg-white">
                    {q.items.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`grid grid-cols-[44px_1fr_72px_88px_88px] items-start ${idx % 2 === 1 ? "bg-slate-50/50" : ""}`}
                      >
                        <div className="flex items-center justify-center py-3 text-[12px] text-slate-700 font-semibold border-r border-slate-200">
                          {idx + 1}
                        </div>
                        <div className="px-3 py-3 border-r border-slate-200">
                          <p className="text-[13px] font-bold text-slate-900 leading-snug">
                            {item.productName || <span className="text-slate-400 font-normal italic">—</span>}
                          </p>
                          {item.description ? (
                            <p className="text-[12px] text-slate-700 mt-1 leading-snug font-normal">{item.description}</p>
                          ) : null}
                        </div>
                        <div className="px-2 py-3 text-[12px] text-slate-800 text-right font-medium border-r border-slate-200 tabular-nums">
                          {item.quantity || "—"}
                        </div>
                        <div className="px-2 py-3 text-[12px] text-slate-800 text-right tabular-nums border-r border-slate-200">
                          {formatItemUnitPrice(item.listPrice)}
                        </div>
                        <div className="px-2 py-3 text-[12px] font-bold text-slate-900 text-right tabular-nums">
                          {item.amount ? fmtTemplate(parseMoney(item.amount)) : "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Totals — dashed separator */}
                <div className="border-t border-dashed border-slate-400 bg-white px-4 py-4">
                  <div className="flex justify-end">
                    <div className="space-y-1.5 min-w-[240px]">
                      <div className="flex justify-between text-[12px] text-slate-800 gap-8">
                        <span>Sub Total</span>
                        <span className="tabular-nums">{fmtTemplate(subtotal)}</span>
                      </div>
                      {discount !== 0 && (
                        <div className="flex justify-between text-[12px] text-slate-800 gap-8">
                          <span>Discount</span>
                          <span className="tabular-nums text-red-700">−{fmtTemplate(discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[12px] text-slate-800 gap-8">
                        <span>Tax</span>
                        <span className="tabular-nums">{fmtTemplate(tax)}</span>
                      </div>
                      <div className="flex justify-between text-[12px] text-slate-800 gap-8">
                        <span>Adjustment</span>
                        <span className="tabular-nums">{fmtTemplate(adjustment)}</span>
                      </div>
                      <div className="flex justify-between text-[13px] font-bold text-slate-900 gap-8 pt-1 border-t border-slate-300 mt-1">
                        <span>Total</span>
                        <span className="tabular-nums">{fmtTemplate(grandTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="px-8 pb-6">
              <div className="rounded-xl border border-slate-300 bg-slate-50/50 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-100/80">
                  <p className="text-[12px] font-bold text-slate-700">Terms and Conditions</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mt-0.5">Description</p>
                </div>
                <div className="px-4 py-4 min-h-[5rem]">
                  {q.termsAndConditions?.trim() ? (
                    <p className="text-[12px] text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {q.termsAndConditions}
                    </p>
                  ) : (
                    <p className="text-[12px] text-slate-400 italic">No terms and conditions on file for this quote.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional context (not on customer PDF template) */}
            <details className="px-8 pb-6 group">
              <summary className="text-[12px] font-semibold text-slate-500 cursor-pointer mb-2 select-none">
                Additional details
              </summary>
              <div className="mt-3 space-y-4 border border-slate-200 rounded-lg p-4 bg-slate-50/80">
                {(q.subject || q.orderNotes || q.description) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
                    {q.subject && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Subject</p>
                        <p className="text-slate-800 font-medium">{q.subject}</p>
                      </div>
                    )}
                    {q.orderNotes && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Order notes</p>
                        <p className="text-slate-700 leading-relaxed">{q.orderNotes}</p>
                      </div>
                    )}
                    {q.description && (
                      <div className="sm:col-span-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Description</p>
                        <p className="text-slate-700 leading-relaxed">{q.description}</p>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-[12px] text-slate-600">
                  <span><span className="text-slate-400">Prepared by:</span> <span className="font-semibold">{q.opportunityOwner || "—"}</span></span>
                  <span><span className="text-slate-400">Business type:</span> {q.businessType || "—"}</span>
                </div>
                <div className="grid grid-cols-2 gap-6 pt-2">
                  <div>
                    <div className="h-10 border-b border-slate-300 mb-1" />
                    <p className="text-[11px] text-slate-400">Customer signature &amp; date</p>
                  </div>
                  <div>
                    <div className="h-10 border-b border-slate-300 mb-1" />
                    <p className="text-[11px] text-slate-400">Authorized signature &amp; date</p>
                  </div>
                </div>
              </div>
            </details>

          </div>
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
