"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Trash2, Plus, Calendar, FileSpreadsheet, PackageSearch, ChevronDown } from "lucide-react";
import { Opportunity, QuoteData, QuoteItem, QuoteRecord } from "@/lib/types";
import { useCRMShell } from "@/components/shell/CRMShellContext";
import { AllocationRecordDetailContent } from "@/components/leads/ViewAllocationModal";
import type { ProductCatalogItem } from "@/lib/mock-data/products";
import { QuoteProductNamePicker } from "@/components/quotes/QuoteProductNamePicker";
import { getAccountNamesForContactsPicker } from "@/lib/mock-data/accounts";
import { getContactDisplayNamesForQuotePicker } from "@/lib/mock-data/contacts";

// ─── Signature Pad (identical to approval modal) ──────────────────────────────

interface SignaturePadProps {
  onChange?: (hasSignature: boolean) => void;
}

function SignaturePad({ onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing   = useRef(false);
  const lastPos   = useRef<{ x: number; y: number } | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width  = width  * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }, []);

  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function startDrawing(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawing.current = true;
    lastPos.current = getPos(e, canvas);
    e.preventDefault();
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth   = 1.8;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    ctx.stroke();
    lastPos.current = pos;
    if (isEmpty) { setIsEmpty(false); onChange?.(true); }
    e.preventDefault();
  }

  function stopDrawing() { drawing.current = false; lastPos.current = null; }

  const clearPad = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onChange?.(false);
  }, [onChange]);

  return (
    <div className="space-y-2">
      <div className="relative rounded-lg border border-slate-200 bg-white overflow-hidden" style={{ height: 110 }}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
          onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
          onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
        />
        {isEmpty && (
          <p className="absolute inset-0 flex items-center justify-center text-[12px] text-slate-300 pointer-events-none select-none">
            Draw your signature here
          </p>
        )}
      </div>
      {!isEmpty && (
        <button type="button" onClick={clearPad} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-red-500 transition-colors">
          <Trash2 size={11} /> Clear signature
        </button>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("T")[0].split("-");
  return `${m}/${d}/${y} ; 21:00`;
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  const mm   = String(d.getMonth() + 1).padStart(2, "0");
  const dd   = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy} ; 21:00`;
}

function parseNum(val: string): number {
  return parseFloat(val.replace(/[^0-9.]/g, "")) || 0;
}

function fmtNum(n: number): string {
  return n.toFixed(2);
}

// ─── Reusable sub-components ──────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">{children}</p>;
}

function ReadCell({ label, value, accent }: { label: string; value?: string; accent?: "red" }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
      <p className={`text-[13px] font-semibold leading-snug ${accent === "red" ? "text-red-500" : "text-slate-900"}`}>
        {value || "—"}
      </p>
    </div>
  );
}

function EditField({
  label, value, onChange, type = "text", placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-[13px] text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#002f93] focus:border-transparent placeholder:text-slate-300 transition-shadow"
      />
    </div>
  );
}

function PickerSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#002f93] focus:border-transparent cursor-pointer ${
            value ? "text-slate-800" : "text-slate-400"
          }`}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}

function AdjustModalOldQuoteView({
  q,
  opportunity,
  record,
}: {
  q: QuoteData;
  opportunity: Opportunity;
  record: QuoteRecord;
}) {
  const datePart = q.validDate ? q.validDate.split("T")[0] : "";
  const validDisplay = datePart ? fmtDate(datePart) : "—";
  const expirationDisplay = datePart ? addDays(`${datePart}T00:00:00.000Z`, 30) : "—";
  const createdDisplay = opportunity.createdDate || "—";

  return (
    <div className="space-y-6">
      <p className="text-[11px] text-slate-500">
        Archived snapshot · prior status: {record.status}
        {record.archivedAt ? ` · ${record.archivedAt.slice(0, 10)}` : ""}
      </p>

      <section>
        <SectionLabel>Quote Details</SectionLabel>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <ReadCell label="Valid Till Date" value={validDisplay} accent="red" />
          <ReadCell label="Expected Revenue" value={opportunity.expectedRevenue} />
          <ReadCell label="Grand Total" value={`$${q.grandTotal}`} accent="red" />
          <ReadCell label="Opportunity Owner" value={q.opportunityOwner} />
          <ReadCell label="Subject" value={q.subject} />
          <ReadCell label="Contact Name" value={q.contactName} />
          <ReadCell label="Account Name" value={q.accountName} />
          <ReadCell label="Business Type" value={q.businessType} />
          <ReadCell label="Pipeline" value={opportunity.pipeline} />
          <ReadCell label="Lead Source" value={opportunity.leadSource} />
          <ReadCell label="Created Date" value={createdDisplay} />
          <ReadCell label="SKU / Quantity" value={String(q.items.length)} />
          <ReadCell label="Shipping Method" value={q.shippingMethod} />
        </div>
      </section>

      <section>
        <SectionLabel>Quote Items</SectionLabel>
        <div className="rounded-xl overflow-hidden border border-slate-200">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-700 text-white">
                <th className="px-3 py-2.5 text-[11px] font-semibold w-10">S.No</th>
                <th className="px-3 py-2.5 text-[11px] font-semibold">Product Name / SKU</th>
                <th className="px-3 py-2.5 text-[11px] font-semibold text-right w-24">Qty</th>
                <th className="px-3 py-2.5 text-[11px] font-semibold text-right w-28">List Price</th>
                <th className="px-3 py-2.5 text-[11px] font-semibold text-right w-28">Amount</th>
              </tr>
            </thead>
            <tbody>
              {q.items.map((item, idx) => (
                <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="px-3 py-2 text-[12px] text-slate-500">{idx + 1}</td>
                  <td className="px-3 py-2 text-[12px] text-slate-800 font-medium">{item.productName}</td>
                  <td className="px-3 py-2 text-[12px] text-right">{item.quantity}</td>
                  <td className="px-3 py-2 text-[12px] text-right">{item.listPrice}</td>
                  <td className="px-3 py-2 text-[12px] text-right font-medium">{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 space-y-1.5 text-[12px] text-slate-600">
          <div className="flex justify-between"><span>Subtotal ($)</span><span>{q.subtotal}</span></div>
          <div className="flex justify-between"><span>Discount ($)</span><span>{q.discount || "0"}</span></div>
          <div className="flex justify-between"><span>Tax ($)</span><span>{q.tax || "0"}</span></div>
          <div className="flex justify-between"><span>Adjustment</span><span>{q.adjustment || "—"}</span></div>
          <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1.5">
            <span>Grand Total ($)</span><span>${q.grandTotal}</span>
          </div>
        </div>
      </section>

      <section>
        <SectionLabel>Expiration Date</SectionLabel>
        <p className="text-[12px] text-slate-600 leading-relaxed">
          Expiration date of this quote is 30 days. Valid till{" "}
          <span className="font-semibold text-[#002f93]">{expirationDisplay}</span>
        </p>
      </section>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface QuoteAdjustModalProps {
  opportunity: Opportunity;
  onSubmit: (updatedOpp: Opportunity) => void;
  onCancel: () => void;
}

type QuoteModalDetailTab = "quote" | "allocation";

// ─── Modal ────────────────────────────────────────────────────────────────────

export function QuoteAdjustModal({ opportunity, onSubmit, onCancel }: QuoteAdjustModalProps) {
  const [detailTab, setDetailTab] = useState<QuoteModalDetailTab>("quote");
  const [quoteVersionTab, setQuoteVersionTab] = useState<"current" | "old">("current");
  const { allocations } = useCRMShell();
  const { quoteData, procurementAllocation } = opportunity;

  const oldRecord =
    opportunity.quoteHistory && opportunity.quoteHistory.length > 0
      ? opportunity.quoteHistory[opportunity.quoteHistory.length - 1]
      : null;

  useEffect(() => {
    setQuoteVersionTab("current");
  }, [opportunity.id]);

  const allocationRecord = opportunity.allocationId
    ? allocations.find((a) => a.id === opportunity.allocationId) ?? null
    : null;

  // ── Editable state ────────────────────────────────────────────────────────

  const [subject,         setSubject]         = useState(() => opportunity.quoteData?.subject ?? "");
  const [validDate,       setValidDate]       = useState(() =>
    opportunity.quoteData?.validDate ? opportunity.quoteData.validDate.split("T")[0] : ""
  );
  const [shippingMethod,  setShippingMethod]  = useState(() => opportunity.quoteData?.shippingMethod ?? "");
  const [customerPO,      setCustomerPO]      = useState(() => opportunity.quoteData?.customerPO || "");
  const [orderNotes,      setOrderNotes]      = useState(() => opportunity.quoteData?.orderNotes || "");
  const [adjustReason,    setAdjustReason]    = useState("");

  const [editAccountName, setEditAccountName] = useState(() => opportunity.quoteData?.accountName || "");
  const [editContactName, setEditContactName] = useState(() => opportunity.quoteData?.contactName || "");

  const [accountOptions, setAccountOptions] = useState<string[]>(() => {
    const acc = new Set(getAccountNamesForContactsPicker());
    const a = (opportunity.quoteData?.accountName || "").trim();
    if (a) acc.add(a);
    return Array.from(acc).sort((x, y) => x.localeCompare(y));
  });
  const [contactOptions, setContactOptions] = useState<string[]>(() => {
    const cn = new Set(getContactDisplayNamesForQuotePicker());
    const c = (opportunity.quoteData?.contactName || "").trim();
    if (c) cn.add(c);
    return Array.from(cn).sort((x, y) => x.localeCompare(y));
  });

  const refreshAccountContactPickers = useCallback(() => {
    const acc = new Set(getAccountNamesForContactsPicker());
    if (editAccountName.trim()) acc.add(editAccountName.trim());
    setAccountOptions(Array.from(acc).sort((a, b) => a.localeCompare(b)));
    const cn = new Set(getContactDisplayNamesForQuotePicker());
    if (editContactName.trim()) cn.add(editContactName.trim());
    setContactOptions(Array.from(cn).sort((a, b) => a.localeCompare(b)));
  }, [editAccountName, editContactName]);

  useEffect(() => {
    refreshAccountContactPickers();
  }, [refreshAccountContactPickers]);

  useEffect(() => {
    function onFocus() {
      refreshAccountContactPickers();
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshAccountContactPickers]);

  useEffect(() => {
    const qd = opportunity.quoteData;
    if (!qd) return;
    setEditAccountName(qd.accountName || "");
    setEditContactName(qd.contactName || "");
  }, [opportunity.id, opportunity.quoteData?.accountName, opportunity.quoteData?.contactName]);

  // Line items (fully editable)
  const [items, setItems] = useState<QuoteItem[]>(() =>
    (opportunity.quoteData?.items ?? []).map((it) => ({ ...it }))
  );

  // Financial fields
  const [discount,   setDiscount]   = useState(() => opportunity.quoteData?.discount   || "0");
  const [tax,        setTax]        = useState(() => opportunity.quoteData?.tax        || "0");
  const [adjustment, setAdjustment] = useState(() => opportunity.quoteData?.adjustment || "0");
  const [agreed,     setAgreed]     = useState(false);

  // ── Derived totals ────────────────────────────────────────────────────────

  const subtotal   = items.reduce((s, it) => s + parseNum(it.amount), 0);
  const grandTotal = subtotal - parseNum(discount) + parseNum(tax) + parseNum(adjustment);

  // ── Item helpers ──────────────────────────────────────────────────────────

  function updateItem<K extends keyof QuoteItem>(idx: number, key: K, value: QuoteItem[K]) {
    setItems((prev) => {
      const next = prev.map((it, i) => i === idx ? { ...it, [key]: value } : it);
      return next;
    });
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, productName: "", quantity: "1", listPrice: "0.00", amount: "0.00", description: "" },
    ]);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function applyCatalogProduct(idx: number, p: ProductCatalogItem) {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== idx) return it;
        const qtyStr = it.quantity.trim() ? it.quantity : "1";
        const q = parseFloat(qtyStr) || 1;
        const listPrice = p.price.toFixed(2);
        return {
          ...it,
          productName: `${p.productName} (${p.sku})`,
          quantity: qtyStr,
          listPrice,
          amount: (q * p.price).toFixed(2),
        };
      })
    );
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  function handleSubmit() {
    const q = opportunity.quoteData;
    if (!q) return;
    const updatedQuoteData: QuoteData = {
      ...q,
      subject,
      accountName: editAccountName,
      contactName: editContactName,
      validDate: validDate ? `${validDate}T21:00:00.000Z` : q.validDate,
      shippingMethod,
      customerPO,
      orderNotes,
      items,
      subtotal:   fmtNum(subtotal),
      discount,
      tax,
      adjustment,
      grandTotal: fmtNum(grandTotal),
    };
    onSubmit({
      ...opportunity,
      accountName: editAccountName,
      contactName: editContactName,
      quoteData: updatedQuoteData,
      quoteStatus: "pending",
      quoteAdjusted: true,
      quoteRevised: false,
    });
  }

  const expirationDisplay = validDate ? addDays(`${validDate}T00:00:00.000Z`, 30) : "—";
  const validDisplay      = validDate ? fmtDate(`${validDate}T00:00:00.000Z`) : "—";
  const createdDisplay    = opportunity.createdDate || "—";

  if (!quoteData) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50" onClick={onCancel} />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[680px] max-h-[92vh] flex flex-col min-h-0 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors z-10"
          >
            <X size={16} />
          </button>

          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex-shrink-0">
            <h2 className="text-[18px] font-bold text-slate-900 text-center">Adjust Quote</h2>
            <p className="text-[12px] text-slate-500 text-center mt-1 leading-relaxed">
              Edit the quote details below and submit for re-review.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex-shrink-0 px-6 pt-3 pb-0 border-b border-slate-100">
            <div className="flex p-0.5 bg-slate-100 rounded-lg mb-3">
              <button
                type="button"
                onClick={() => setDetailTab("quote")}
                className={`flex-1 py-2 text-[12px] font-semibold rounded-md transition-colors ${
                  detailTab === "quote"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Quote
              </button>
              <button
                type="button"
                onClick={() => setDetailTab("allocation")}
                className={`flex-1 py-2 text-[12px] font-semibold rounded-md transition-colors ${
                  detailTab === "allocation"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Allocation
              </button>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5 space-y-6">
            {detailTab === "quote" && (
              <>
            {oldRecord && (
              <div className="flex p-0.5 bg-slate-100 rounded-lg">
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
            )}

            {quoteVersionTab === "old" && oldRecord ? (
              <AdjustModalOldQuoteView q={oldRecord.quoteData} opportunity={opportunity} record={oldRecord} />
            ) : (
              <>
            {/* ── Quote Details ── */}
            <section>
              <SectionLabel>Quote Details</SectionLabel>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">

                {/* Editable fields */}
                <EditField label="Subject"          value={subject}        onChange={setSubject} />
                <EditField label="Shipping Method"  value={shippingMethod} onChange={setShippingMethod} />
                <EditField label="Customer PO"      value={customerPO}     onChange={setCustomerPO} />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Valid Till Date</p>
                  <div className="relative">
                    <input
                      type="date"
                      value={validDate}
                      onChange={(e) => setValidDate(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-[13px] text-red-500 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#002f93] transition-shadow"
                    />
                    <Calendar size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Read-only context */}
                <ReadCell label="Opportunity Owner" value={quoteData.opportunityOwner} />
                <PickerSelect
                  label="Contact Name"
                  value={editContactName}
                  onChange={setEditContactName}
                  options={contactOptions}
                  placeholder="Select contact"
                />
                <PickerSelect
                  label="Account Name"
                  value={editAccountName}
                  onChange={setEditAccountName}
                  options={accountOptions}
                  placeholder="Select account"
                />
                <ReadCell label="Business Type"      value={quoteData.businessType} />
                <ReadCell label="Pipeline"           value={opportunity.pipeline} />
                <ReadCell label="Lead Source"        value={opportunity.leadSource} />
                <ReadCell label="Created Date"       value={createdDisplay} />
                <ReadCell label="SKU / Quantity"     value={String(items.length)} />
              </div>
            </section>

            {/* ── Procurement File ── */}
            {quoteVersionTab === "current" && procurementAllocation && (
              <section>
                <SectionLabel>Procurement File</SectionLabel>
                <div className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 bg-slate-50 w-fit">
                  <FileSpreadsheet size={14} className="text-[#002f93] flex-shrink-0" />
                  <span className="text-[12px] font-semibold text-[#002f93] hover:underline cursor-pointer">
                    {procurementAllocation.fileName}
                  </span>
                </div>
              </section>
            )}

            {/* ── Quote Items (editable) ── */}
            <section>
              <SectionLabel>Quote Items</SectionLabel>
              <div className="rounded-xl overflow-hidden border border-slate-200">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-700 text-white">
                      <th className="px-3 py-2.5 text-[11px] font-semibold w-10">S.No</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold">Product Name / SKU</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-right w-24">Qty</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-right w-28">List Price</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-right w-28">Amount</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td className="px-3 py-2 text-[12px] text-slate-500">{idx + 1}</td>
                        <td className="px-2 py-2">
                          <QuoteProductNamePicker
                            value={item.productName}
                            onValueChange={(v) => updateItem(idx, "productName", v)}
                            onSelectCatalog={(p) => applyCatalogProduct(idx, p)}
                            inputClassName="w-full pl-7 pr-7 py-1 text-[12px] border border-slate-200 rounded text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#002f93] placeholder:text-slate-400"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                            className="w-full border border-slate-200 rounded px-2 py-1 text-[12px] text-right text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#002f93]"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            value={item.listPrice}
                            onChange={(e) => updateItem(idx, "listPrice", e.target.value)}
                            className="w-full border border-slate-200 rounded px-2 py-1 text-[12px] text-right text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#002f93]"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            value={item.amount}
                            onChange={(e) => updateItem(idx, "amount", e.target.value)}
                            className="w-full border border-slate-200 rounded px-2 py-1 text-[12px] text-right text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#002f93]"
                          />
                        </td>
                        <td className="px-2 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="text-slate-300 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add item row */}
              <button
                type="button"
                onClick={addItem}
                className="mt-2 flex items-center gap-1.5 text-[12px] font-semibold text-[#002f93] hover:text-[#001f6b] transition-colors"
              >
                <Plus size={13} /> Add Line Item
              </button>

              {/* Financial summary */}
              <div className="mt-4 space-y-2">
                {/* Subtotal — auto-calculated, read-only */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[12px] text-slate-500 text-right flex-shrink-0 ml-auto pr-4" style={{ minWidth: 120 }}>
                    Subtotal ($)
                  </span>
                  <div className="w-[140px] flex-shrink-0 border border-slate-100 rounded px-3 py-1.5 text-[13px] text-right text-slate-500 bg-slate-50">
                    {fmtNum(subtotal)}
                  </div>
                </div>

                {/* Editable: Discount, Tax, Adjustment */}
                {[
                  { label: "Discount ($)", value: discount,   set: setDiscount   },
                  { label: "Tax ($)",       value: tax,        set: setTax        },
                  { label: "Adjustment",    value: adjustment, set: setAdjustment },
                ].map(({ label, value, set }) => (
                  <div key={label} className="flex items-center justify-between gap-4">
                    <span className="text-[12px] text-slate-500 text-right flex-shrink-0 ml-auto pr-4" style={{ minWidth: 120 }}>
                      {label}
                    </span>
                    <input
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      className="w-[140px] flex-shrink-0 border border-slate-200 rounded px-3 py-1.5 text-[13px] text-right text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#002f93]"
                    />
                  </div>
                ))}

                {/* Grand Total — auto-calculated */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[12px] font-bold text-slate-800 text-right flex-shrink-0 ml-auto pr-4" style={{ minWidth: 120 }}>
                    Grand Total ($)
                  </span>
                  <div className="w-[140px] flex-shrink-0 border border-slate-300 rounded px-3 py-1.5 text-[13px] text-right font-bold text-slate-900 bg-slate-50">
                    ${fmtNum(grandTotal)}
                  </div>
                </div>
              </div>
            </section>

            {/* ── Order Notes ── */}
            <section>
              <SectionLabel>Order Notes</SectionLabel>
              <textarea
                rows={3}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Add notes for this order..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-[13px] text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#002f93] resize-none placeholder:text-slate-300 leading-relaxed"
              />
            </section>

            {/* ── Reason for Adjustment ── */}
            <section>
              <SectionLabel>Reason for Adjustment</SectionLabel>
              <textarea
                rows={3}
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="Describe why this quote is being adjusted..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-[13px] text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#002f93] resize-none placeholder:text-slate-300 leading-relaxed"
              />
            </section>

            {/* ── Expiration Date ── */}
            <section>
              <SectionLabel>Expiration Date</SectionLabel>
              <p className="text-[12px] text-slate-600 leading-relaxed">
                Expiration date of this quote is 30 days. Valid till{" "}
                <span className="font-semibold text-[#002f93]">{expirationDisplay}</span>
              </p>
            </section>

            {/* ── E-Signature ── */}
            <section>
              <SectionLabel>E-Signature</SectionLabel>
              <SignaturePad />
            </section>

            {/* ── Terms & Conditions ── */}
            <section>
              <SectionLabel>Terms &amp; Conditions</SectionLabel>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-[12px] text-slate-600 leading-relaxed space-y-2 max-h-36 overflow-y-auto mb-3">
                <p>
                  By submitting this adjustment, you confirm that all changes to product details,
                  quantities, pricing, and shipping information have been reviewed and are accurate.
                  This adjustment will reset the quote status to <strong>Pending Approval</strong> and
                  must be re-approved by the authorised signatory before fulfilment proceeds.
                </p>
                <p>
                  Payment terms are as agreed in the master service agreement (default: <strong>Net 30</strong>).
                  Any further amendments post-adjustment must be submitted in writing and are subject to
                  re-approval.
                </p>
                <p>
                  Medzah reserves the right to adjust pricing in the event of unforeseen supply-chain
                  changes. The customer will be notified within <strong>2 business days</strong> of any
                  such adjustment before fulfilment proceeds.
                </p>
              </div>
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-300 accent-[#002f93] cursor-pointer flex-shrink-0"
                />
                <span className="text-[12px] text-slate-700 leading-snug">
                  I have read and agree to the{" "}
                  <span className="font-semibold text-[#002f93]">Terms &amp; Conditions</span>{" "}
                  and confirm that the adjusted quote is ready for re-submission.
                </span>
              </label>
            </section>
              </>
            )}
              </>
            )}

            {detailTab === "allocation" && (
              allocationRecord ? (
                <AllocationRecordDetailContent allocation={allocationRecord} compact={false} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <PackageSearch className="text-slate-300 mb-3" size={40} strokeWidth={1.25} />
                  <p className="text-[13px] font-semibold text-slate-700">No allocation linked</p>
                  <p className="text-[12px] text-slate-500 mt-2 max-w-sm leading-relaxed">
                    There is no allocation record on this opportunity. Details from View Allocation appear here when an allocation is linked (for example from the lead allocation flow).
                  </p>
                </div>
              )
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-slate-100 flex justify-center bg-white rounded-b-2xl">
            <button
              onClick={handleSubmit}
              disabled={!agreed || (detailTab === "quote" && quoteVersionTab === "old")}
              className="px-10 py-2.5 text-[13px] font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit Approval
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
