"use client";

import type { ReactNode } from "react";
import type { QuoteData } from "@/lib/types";
import {
  OVERHEAD_INFRASTRUCTURE_PERCENT,
  computeQuoteFeeAmounts,
} from "@/lib/quote-pricing";

/** Dropdown option lists — aligned with proposal / create quote flows */
export const PAYMENT_TERMS_OPTIONS = ["Net 30", "Net 60", "Prepaid"] as const;
export const EXPECTED_DEMAND_OPTIONS = ["Volume forecast", "Estimated usage"] as const;
export const DELIVERY_LOCATIONS_OPTIONS = ["Single site", "Multi-site"] as const;
export const FREIGHT_RESPONSIBILITY_OPTIONS = ["Customer pays freight", "We cover freight"] as const;
export const DELIVERY_CHARGES_OPTIONS = ["Applicable", "Waived"] as const;
export const CARRIER_BILLING_OPTIONS = ["Our account (FedEx/UPS)", "Customer shipping account"] as const;

function parseMoney(value: string | undefined): number {
  if (!value) return 0;
  return parseFloat(String(value).replace(/[^0-9.-]/g, "")) || 0;
}

export function formatQuoteIsoDate(iso: string | undefined): string {
  if (!iso?.trim()) return "—";
  const raw = iso.includes("T") ? iso.split("T")[0] : iso.trim();
  const d = new Date(iso.includes("T") ? iso : `${raw}T12:00:00`);
  return Number.isNaN(d.getTime())
    ? raw
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function fmtUsd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

/** Prefer stored fee lines when present; otherwise derive from grand total + commission %. */
export function resolveQuotePricing(q: QuoteData) {
  const computed = computeQuoteFeeAmounts(q.grandTotal, q.salesCommissionPercent || "0");
  const storedFinal = q.finalQuoteTotal?.trim();
  const useStored =
    !!storedFinal &&
    q.overheadAmount !== undefined &&
    String(q.overheadAmount).trim() !== "" &&
    q.salesCommissionAmount !== undefined &&
    String(q.salesCommissionAmount).trim() !== "";

  const overheadMoney = useStored ? parseMoney(q.overheadAmount) : parseMoney(computed.overheadAmount);
  const commissionMoney = useStored
    ? parseMoney(q.salesCommissionAmount)
    : parseMoney(computed.salesCommissionAmount);
  const finalMoney = useStored ? parseMoney(q.finalQuoteTotal) : parseMoney(computed.finalQuoteTotal);

  const overheadPct =
    q.overheadInfrastructurePercent?.trim() || String(OVERHEAD_INFRASTRUCTURE_PERCENT);
  const commissionPct = q.salesCommissionPercent?.trim() || "0";

  return {
    overheadPct,
    overheadMoney,
    commissionPct,
    commissionMoney,
    finalMoney,
  };
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
      <p className="text-[13px] font-semibold text-slate-900 leading-snug">{value}</p>
    </div>
  );
}

/** Key / value row for quote document / modal panels (label + value align in two columns on sm+). */
function StructuredSpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(10rem,38%)_1fr] sm:gap-x-6 py-3 px-4 sm:items-start border-b border-slate-100 last:border-b-0">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 leading-snug">
        {label}
      </span>
      <span className="text-[13px] font-medium text-slate-900 leading-snug">{value}</span>
    </div>
  );
}

function StructuredSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-300 bg-white overflow-hidden">
      <div className="px-4 py-2.5 border-b border-slate-200 bg-gradient-to-r from-slate-100 to-slate-50/90">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-700">{title}</h3>
      </div>
      <div className="bg-white">{children}</div>
    </section>
  );
}

/** Commercial, logistics, and carrier billing captured on proposal / create quote. */
export function QuoteCommercialLogisticsShippingReadOnly({
  q,
  className = "",
  variant = "plain",
}: {
  q: QuoteData;
  className?: string;
  /** `structured`: bordered panels with section headers (e.g. quote preview). `plain`: compact grid (modals). */
  variant?: "plain" | "structured";
}) {
  const showAccount = q.carrierBillingMethod === "Customer shipping account";
  const dash = (v: string | undefined) => (v?.trim() ? v : "—");

  if (variant === "structured") {
    return (
      <div className={`flex flex-col gap-4 ${className}`}>
        <StructuredSection title="Commercial Details">
          <StructuredSpecRow label="Payment terms" value={dash(q.paymentTerms)} />
          <StructuredSpecRow label="Expected demand" value={dash(q.expectedDemand)} />
        </StructuredSection>
        <StructuredSection title="Logistics & Fulfilment">
          <StructuredSpecRow label="Delivery locations" value={dash(q.deliveryLocations)} />
          {q.deliveryLocations === "Multi-site" ? (
            <StructuredSpecRow
              label="Number of delivery locations"
              value={dash(q.deliveryLocationCount)}
            />
          ) : null}
          <StructuredSpecRow
            label="First order delivery"
            value={formatQuoteIsoDate(q.firstOrderDeliveryDate)}
          />
        </StructuredSection>
        <StructuredSection title="Shipping Details">
          <StructuredSpecRow label="Freight responsibility" value={dash(q.freightResponsibility)} />
          <StructuredSpecRow label="Delivery charges" value={dash(q.deliveryCharges)} />
          <StructuredSpecRow label="Carrier billing" value={dash(q.carrierBillingMethod)} />
          {showAccount ? (
            <StructuredSpecRow
              label="Customer shipping account #"
              value={dash(q.customerShippingAccountNumber)}
            />
          ) : null}
        </StructuredSection>
      </div>
    );
  }

  return (
    <div className={`space-y-5 ${className}`}>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
          Commercial Details
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <DetailRow label="Payment Terms" value={dash(q.paymentTerms)} />
          <DetailRow label="Expected Demand" value={dash(q.expectedDemand)} />
        </div>
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
          Logistics &amp; Fulfilment
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
          <DetailRow label="Delivery locations" value={dash(q.deliveryLocations)} />
          {q.deliveryLocations === "Multi-site" ? (
            <DetailRow label="Number of delivery locations" value={dash(q.deliveryLocationCount)} />
          ) : (
            <div className="hidden sm:block" aria-hidden />
          )}
          <DetailRow
            label="Delivery timeline for first order"
            value={formatQuoteIsoDate(q.firstOrderDeliveryDate)}
          />
        </div>
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
          Shipping Details
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <DetailRow label="Freight responsibility" value={dash(q.freightResponsibility)} />
          <DetailRow label="Delivery Charges" value={dash(q.deliveryCharges)} />
          <DetailRow label="Carrier billing" value={dash(q.carrierBillingMethod)} />
          {showAccount ? (
            <DetailRow label="Customer shipping account #" value={dash(q.customerShippingAccountNumber)} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Overhead (fixed %), sales commission (% + $), and final quote total (after items summary). */
export function QuotePricingCostBreakdown({
  q,
  productGrandTotalFmt,
  omitProductLine = false,
  className = "",
}: {
  q: QuoteData;
  /** When omitted and `omitProductLine` is false, grand total is formatted from `q.grandTotal`. */
  productGrandTotalFmt?: string;
  /** When product-line grand total is already shown above (e.g. after Grand Total row). */
  omitProductLine?: boolean;
  className?: string;
}) {
  const p = resolveQuotePricing(q);
  const gtLabel =
    productGrandTotalFmt ?? fmtUsd(parseMoney(q.grandTotal));

  return (
    <div className={`space-y-1.5 ${className}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
        Pricing &amp; fees
      </p>
      {!omitProductLine && (
        <div className="flex justify-between text-[12px] text-slate-600">
          <span>Product Grand Total</span>
          <span className="tabular-nums font-medium">{gtLabel}</span>
        </div>
      )}
      <div className="flex justify-between text-[12px] text-slate-600 border-t border-slate-200 pt-2">
        <span>Overhead ({p.overheadPct}% infrastructure markup)</span>
        <span className="tabular-nums font-medium">{fmtUsd(p.overheadMoney)}</span>
      </div>
      <div className="flex justify-between text-[12px] text-slate-600">
        <span>Sales commission ({p.commissionPct}%)</span>
        <span className="tabular-nums font-medium">{fmtUsd(p.commissionMoney)}</span>
      </div>
      <div className="flex justify-between text-[13px] font-black text-slate-900 border-t-2 border-slate-200 pt-2 mt-1">
        <span>Final Quote Total</span>
        <span className="tabular-nums text-[#002f93]">{fmtUsd(p.finalMoney)}</span>
      </div>
    </div>
  );
}
