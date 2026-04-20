"use client";

import { useState } from "react";
import {
  X, CheckCircle2, AlertTriangle, PackageSearch, ChevronDown, ChevronRight,
  MapPin, Phone, Mail, Building2, Clock, PauseCircle,
} from "lucide-react";
import { AllocationRecord, AllocationProduct } from "@/lib/types";
import { canDownloadAllocationExport } from "@/lib/export-allocation-xlsx";
import { DownloadAllocationButton } from "@/components/allocations/DownloadAllocationButton";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAvailabilityStatus(product: AllocationProduct): "available" | "partial" | "unavailable" {
  const avail = product.inventory.qtyAvailable;
  const req   = product.requiredQty;
  if (avail <= 0) return "unavailable";
  if (avail < req) return "partial";
  return "available";
}

// ─── Tier price table ─────────────────────────────────────────────────────────

function TierPriceTable({ product }: { product: AllocationProduct }) {
  const [open, setOpen] = useState(false);
  if (!product.tierPrices || product.tierPrices.length === 0) return null;

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[11px] font-semibold text-[#002f93] hover:text-[#001f6b] transition-colors"
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        Locked Tier Pricing
      </button>
      {open && (
        <div className="mt-1.5 rounded-lg border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-100">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wide">Range</div>
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wide text-right">Suggested</div>
            <div className="px-3 py-1.5 text-[10px] font-bold text-[#002f93] uppercase tracking-wide text-right">Locked Price</div>
          </div>
          {product.tierPrices.map((tier, idx) => (
            <div
              key={idx}
              className={`grid grid-cols-3 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"} border-b border-slate-50 last:border-0`}
            >
              <div className="px-3 py-1.5 text-[12px] text-slate-700 font-medium">{tier.rangeLabel}</div>
              <div className="px-3 py-1.5 text-[12px] text-slate-400 text-right tabular-nums">${tier.suggestedPrice.toFixed(2)}</div>
              <div className="px-3 py-1.5 text-[12px] font-bold text-[#002f93] text-right tabular-nums">${tier.userPrice.toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Product row ──────────────────────────────────────────────────────────────

function ProductRow({ product }: { product: AllocationProduct }) {
  const status = getAvailabilityStatus(product);
  const avail  = product.inventory.qtyAvailable;
  const req    = product.requiredQty;
  const shortfall = req - avail;

  const statusConfig = {
    available:   { badge: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2,   label: "Available"      },
    partial:     { badge: "bg-amber-100 text-amber-700 border-amber-200",       icon: AlertTriangle,  label: "Partial"        },
    unavailable: { badge: "bg-red-100 text-red-700 border-red-200",             icon: PackageSearch,  label: "Not Available"  },
  };
  const cfg = statusConfig[status];
  const Icon = cfg.icon;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Product header */}
      <div className={`px-4 py-3 flex items-start justify-between gap-3 ${status === "unavailable" ? "bg-red-50/40" : status === "partial" ? "bg-amber-50/40" : "bg-white"}`}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[13px] font-bold text-slate-900 leading-snug">{product.productName}</p>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.badge}`}>
              <Icon size={10} />
              {cfg.label}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">SKU: {product.sku} · UOM: {product.inventory.uom}</p>
        </div>
      </div>

      {/* Qty details */}
      <div className="border-t border-slate-100 px-4 py-2.5 bg-white">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Required Qty</p>
            <p className="text-[14px] font-bold text-slate-800 mt-0.5">{req}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Available Qty</p>
            <p className={`text-[14px] font-bold mt-0.5 ${avail <= 0 ? "text-red-600" : avail < req ? "text-amber-600" : "text-emerald-600"}`}>
              {avail}
            </p>
          </div>
          {status !== "available" && (
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                {status === "unavailable" ? "Shortfall" : "Shortfall"}
              </p>
              <p className="text-[14px] font-bold text-red-600 mt-0.5">{status === "unavailable" ? req : shortfall}</p>
            </div>
          )}
        </div>

        {/* Partial/unavailable note */}
        {status === "partial" && (
          <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <p className="text-[11px] text-amber-700 leading-snug">
              <span className="font-semibold">Partially available:</span> Only {avail} units in stock. 
              Consider pitching a reduced quantity of <span className="font-semibold">{avail} units</span> instead of {req}.
            </p>
          </div>
        )}
        {status === "unavailable" && (
          <div className="mt-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <p className="text-[11px] text-red-700 leading-snug">
              <span className="font-semibold">Not in stock.</span> Discuss alternative products or timeline with the customer.
            </p>
          </div>
        )}
      </div>

      {/* Tier prices */}
      <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50/60">
        <TierPriceTable product={product} />
      </div>
    </div>
  );
}

// ─── Status banner ────────────────────────────────────────────────────────────

function StatusBanner({ status }: { status: AllocationRecord["status"] }) {
  if (status === "Approved") {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border-b border-emerald-100">
        <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
        <p className="text-[12px] font-semibold text-emerald-700">Allocation Fully Approved — all products are available for quoting</p>
      </div>
    );
  }
  if (status === "Partially Approved") {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border-b border-amber-100">
        <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
        <p className="text-[12px] font-semibold text-amber-700">Partially Approved — some products have limited or no availability. Review details below.</p>
      </div>
    );
  }
  if (status === "On Hold") {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 border-b border-slate-200">
        <PauseCircle size={14} className="text-slate-500 flex-shrink-0" />
        <p className="text-[12px] font-semibold text-slate-600">Allocation is On Hold — pending fulfillment. See hold details below.</p>
      </div>
    );
  }
  return null;
}

// ─── Shared body (View Allocation modal + quote modals Allocation tab) ────────

export function AllocationRecordDetailContent({
  allocation,
  compact = false,
}: {
  allocation: AllocationRecord;
  compact?: boolean;
}) {
  return (
    <div className="space-y-4">
      <StatusBanner status={allocation.status} />

      {/* Customer info — hidden in compact mode */}
      {!compact && (
        <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-start gap-2">
            <Building2 size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Company</p>
              <p className="text-[13px] font-semibold text-slate-800">{allocation.companyName}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Mail size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Contact</p>
              <p className="text-[13px] font-semibold text-slate-800">{allocation.contactName}</p>
              <p className="text-[11px] text-slate-500">{allocation.email}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Phone size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Phone</p>
              <p className="text-[13px] text-slate-700">{allocation.phone}</p>
            </div>
          </div>
          {allocation.location && (
            <div className="flex items-start gap-2">
              <MapPin size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Location</p>
                <p className="text-[13px] text-slate-700">{allocation.location}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Products */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
            Products ({allocation.products.length})
          </p>
          <div className="flex-1 h-px bg-slate-200" />
        </div>
        <div className="space-y-3">
          {allocation.products.map((product, idx) => (
            <ProductRow key={idx} product={product} />
          ))}
        </div>
      </div>

      {/* On Hold details */}
      {allocation.status === "On Hold" && (allocation.onHoldNotes || allocation.onHoldFulfillmentTime) && (
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 border-b border-slate-200">
            <PauseCircle size={13} className="text-slate-500 flex-shrink-0" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">On Hold Details</p>
          </div>
          <div className="px-4 py-3 bg-white space-y-3">
            {allocation.onHoldFulfillmentTime && (
              <div className="flex items-start gap-2.5">
                <Clock size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Expected Fulfillment Time</p>
                  <p className="text-[13px] font-semibold text-slate-800 mt-0.5">{allocation.onHoldFulfillmentTime}</p>
                </div>
              </div>
            )}
            {allocation.onHoldNotes && (
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Reason / Notes</p>
                  <p className="text-[13px] text-slate-700 leading-relaxed mt-0.5">{allocation.onHoldNotes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

interface ViewAllocationModalProps {
  allocation: AllocationRecord;
  onClose: () => void;
  /** compact=true shows only the product table (no customer info block) */
  compact?: boolean;
}

export function ViewAllocationModal({ allocation, onClose, compact = false }: ViewAllocationModalProps) {
  const statusBadge = (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold border ${
      allocation.status === "Approved"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : allocation.status === "Partially Approved"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : allocation.status === "On Hold"
        ? "bg-slate-100 text-slate-600 border-slate-200"
        : "bg-blue-50 text-blue-700 border-blue-200"
    }`}>
      {allocation.status}
    </span>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[70]" onClick={onClose} />
      <div className="fixed inset-0 z-[71] flex items-start justify-center overflow-y-auto py-6 px-4">
        <div
          className={`relative bg-white rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden ${compact ? "max-w-[600px]" : "max-w-[700px]"}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#002f93] flex items-center justify-center flex-shrink-0">
                <PackageSearch size={16} className="text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-[15px] font-bold text-slate-900 leading-none">
                  {compact ? "Product Availability" : "Allocation Details"}
                </h2>
                <p className="text-[12px] text-slate-400 mt-0.5 truncate">
                  {compact
                    ? `${allocation.companyName} · ${allocation.allocationRef}`
                    : allocation.allocationRef}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {statusBadge}
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto px-5 py-4 max-h-[calc(100vh-180px)]">
            <AllocationRecordDetailContent allocation={allocation} compact={compact} />
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-5 py-4 border-t border-slate-100 bg-white rounded-b-2xl flex flex-wrap items-center justify-end gap-2">
            {canDownloadAllocationExport(allocation.status) && (
              <DownloadAllocationButton record={allocation} size="md" className="mr-auto" />
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-[13px] font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
