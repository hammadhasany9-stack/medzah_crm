"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, FileSpreadsheet, Calendar, Trash2, PackageSearch } from "lucide-react";
import { Opportunity } from "@/lib/types";
import { useCRMShell } from "@/components/shell/CRMShellContext";
import { AllocationRecordDetailContent } from "@/components/leads/ViewAllocationModal";

// ─── Signature Pad ────────────────────────────────────────────────────────────

interface SignaturePadProps {
  onChange?: (hasSignature: boolean) => void;
}

function SignaturePad({ onChange }: SignaturePadProps) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const drawing     = useRef(false);
  const lastPos     = useRef<{ x: number; y: number } | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  // Keep canvas pixel dimensions synced to its CSS size
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
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
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

    if (isEmpty) {
      setIsEmpty(false);
      onChange?.(true);
    }
    e.preventDefault();
  }

  function stopDrawing() {
    drawing.current = false;
    lastPos.current = null;
  }

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
      <div className="relative rounded-lg border border-slate-200 bg-white overflow-hidden"
           style={{ height: 110 }}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {isEmpty && (
          <p className="absolute inset-0 flex items-center justify-center text-[12px] text-slate-300 pointer-events-none select-none">
            Draw your signature here
          </p>
        )}
      </div>
      {!isEmpty && (
        <button
          type="button"
          onClick={clearPad}
          className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={11} />
          Clear signature
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
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy} ; 21:00`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
      {children}
    </p>
  );
}

function DetailCell({
  label,
  value,
  accent,
}: {
  label: string;
  value?: string;
  accent?: "red";
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
        {label}
      </p>
      <p
        className={`text-[13px] font-semibold leading-snug ${
          accent === "red" ? "text-red-500" : "text-slate-900"
        }`}
      >
        {value || "—"}
      </p>
    </div>
  );
}

function AmountRow({
  label,
  value,
  bold,
}: {
  label: string;
  value?: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={`text-[12px] text-right flex-shrink-0 ml-auto pr-4 ${
          bold ? "font-bold text-slate-800" : "text-slate-500"
        }`}
        style={{ minWidth: 120 }}
      >
        {label}
      </span>
      <div
        className={`w-[140px] flex-shrink-0 border rounded px-3 py-1.5 text-[13px] text-right ${
          bold
            ? "border-slate-300 font-bold text-slate-900 bg-slate-50"
            : "border-slate-200 text-slate-700 bg-white"
        }`}
      >
        {value || "0"}
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface QuoteApprovalModalProps {
  opportunity: Opportunity;
  onApprove: (opp: Opportunity) => void;
  onCancel: () => void;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

type QuoteModalDetailTab = "quote" | "allocation";

export function QuoteApprovalModal({
  opportunity,
  onApprove,
  onCancel,
}: QuoteApprovalModalProps) {
  const [agreed, setAgreed] = useState(false);
  const [detailTab, setDetailTab] = useState<QuoteModalDetailTab>("quote");
  const [quoteVersionTab, setQuoteVersionTab] = useState<"current" | "old">("current");
  const { allocations } = useCRMShell();
  const { quoteData, procurementAllocation } = opportunity;
  if (!quoteData) return null;

  const oldRecord =
    opportunity.quoteHistory && opportunity.quoteHistory.length > 0
      ? opportunity.quoteHistory[opportunity.quoteHistory.length - 1]
      : null;

  const displayQuote =
    quoteVersionTab === "old" && oldRecord ? oldRecord.quoteData : quoteData;

  const allocationRecord = opportunity.allocationId
    ? allocations.find((a) => a.id === opportunity.allocationId) ?? null
    : null;

  const expirationDisplay = displayQuote.validDate
    ? addDays(displayQuote.validDate, 30)
    : "—";

  const validDisplay = fmtDate(displayQuote.validDate);

  const createdDisplay = (() => {
    if (!opportunity.createdDate) return "—";
    const parts = opportunity.createdDate.split(" ; ");
    return parts.length === 2 ? opportunity.createdDate : opportunity.createdDate;
  })();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[680px] max-h-[90vh] flex flex-col min-h-0 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors z-10"
          >
            <X size={16} />
          </button>

          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex-shrink-0">
            <h2 className="text-[18px] font-bold text-slate-900 text-center">
              Quote Approval
            </h2>
            <p className="text-[12px] text-slate-500 text-center mt-1 leading-relaxed">
              You have just approved this quote, kindly review it once before submitting.
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
            {quoteVersionTab === "old" && oldRecord && (
              <p className="text-[11px] text-slate-500 -mt-2">
                Archived snapshot · prior status: {oldRecord.status}
                {oldRecord.archivedAt ? ` · ${oldRecord.archivedAt.slice(0, 10)}` : ""}
              </p>
            )}

            {/* ── Quote Details ── */}
            <section>
              <SectionLabel>Quote Details</SectionLabel>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                    Valid till Date
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-red-500">
                    <Calendar size={12} className="flex-shrink-0" />
                    {validDisplay}
                  </span>
                </div>
                <DetailCell
                  label="Expected Revenue"
                  value={opportunity.expectedRevenue}
                />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                    Grand Total
                  </p>
                  <p className="text-[13px] font-semibold text-red-500">
                    ${displayQuote.grandTotal}
                  </p>
                </div>
                <DetailCell
                  label="Opportunity Owner"
                  value={displayQuote.opportunityOwner}
                />
                <DetailCell label="Subject" value={displayQuote.subject} />
                <DetailCell label="Contact Name" value={displayQuote.contactName} />
                <DetailCell label="Account Name" value={displayQuote.accountName} />
                <DetailCell label="Business Type" value={displayQuote.businessType} />
                <DetailCell label="Pipeline" value={opportunity.pipeline} />
                <DetailCell
                  label="SKU/Quantity"
                  value={String(displayQuote.items.length)}
                />
                <DetailCell label="Lead Source" value={opportunity.leadSource} />
                <DetailCell
                  label="Shipping Method"
                  value={displayQuote.shippingMethod}
                />
                <DetailCell label="Created Date" value={createdDisplay} />
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

            {/* ── Quote Items ── */}
            <section>
              <SectionLabel>Quote Items</SectionLabel>
              <div className="rounded-xl overflow-hidden border border-slate-200">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-700 text-white">
                      <th className="px-3 py-2.5 text-[11px] font-semibold w-12">S.No</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold">Product Name /SKU</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-right">Quantity</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-right">List Price</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayQuote.items.map((item, idx) => (
                      <tr
                        key={item.id}
                        className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}
                      >
                        <td className="px-3 py-2.5 text-[12px] text-slate-700">{idx + 1}</td>
                        <td className="px-3 py-2.5 text-[12px] text-slate-800 font-medium">
                          {item.productName}
                        </td>
                        <td className="px-3 py-2.5 text-[12px] text-slate-700 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-2.5 text-[12px] text-slate-700 text-right">
                          {item.listPrice}
                        </td>
                        <td className="px-3 py-2.5 text-[12px] text-slate-700 text-right">
                          {item.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial summary */}
              <div className="mt-4 space-y-2">
                <AmountRow label="Subtotal ($)" value={displayQuote.subtotal} />
                <AmountRow label="Discount ($)" value={displayQuote.discount || "0"} />
                <AmountRow label="Tax ($)" value={displayQuote.tax || "0"} />
                <AmountRow label="Adjustment" value={displayQuote.adjustment || ""} />
                <AmountRow
                  label="Grand Total ($)"
                  value={`$${displayQuote.grandTotal}`}
                  bold
                />
              </div>
            </section>

            {/* ── Expiration Date ── */}
            <section>
              <SectionLabel>Expiration Date</SectionLabel>
              <p className="text-[12px] text-slate-600 leading-relaxed">
                Expiration date of this quote is 30 days. Valid till{" "}
                <span className="font-semibold text-[#002f93]">{expirationDisplay}</span>
              </p>
            </section>

            {quoteVersionTab === "current" && (
              <>
            {/* ── E-Signature ── */}
            <section>
              <SectionLabel>E-Signature</SectionLabel>
              <SignaturePad />
            </section>

            {/* ── Terms & Conditions ── */}
            <section>
              <SectionLabel>Terms &amp; Conditions</SectionLabel>

              {/* T&C text box */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-[12px] text-slate-600 leading-relaxed space-y-2 max-h-36 overflow-y-auto mb-3">
                <p>
                  By approving this quote, you confirm that all product details, quantities, pricing,
                  and shipping information have been reviewed and are accurate. This approval
                  constitutes a binding commitment to proceed with the order as specified.
                </p>
                <p>
                  Payment terms are as agreed in the master service agreement (default: <strong>Net 30</strong>).
                  Any amendments post-approval must be submitted in writing and are subject to
                  re-approval by the authorised signatory.
                </p>
                <p>
                  Medzah reserves the right to adjust pricing in the event of unforeseen supply-chain
                  changes. The customer will be notified within <strong>2 business days</strong> of any
                  such adjustment before fulfilment proceeds.
                </p>
              </div>

              {/* Acknowledgement checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-300 accent-[#002f93] cursor-pointer flex-shrink-0"
                />
                <span className="text-[12px] text-slate-700 leading-snug">
                  I have read and agree to the <span className="font-semibold text-[#002f93]">Terms &amp; Conditions</span> stated above
                  and confirm that this quote is ready for final submission.
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
              onClick={() => onApprove(opportunity)}
              className="px-10 py-2.5 text-[13px] font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition-colors"
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
