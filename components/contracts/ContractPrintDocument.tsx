"use client";

import type { Contract } from "@/lib/types";
import { contractStatusLabel, formatEffectiveFrom } from "@/components/contracts/contract-format";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden print:break-inside-avoid">
      <div className="px-5 py-3 border-b border-slate-100">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{title}</p>
      </div>
      <div className="px-5 py-4 text-sm text-slate-800">{children}</div>
    </div>
  );
}

function Cell({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-800 whitespace-pre-wrap">{value || "—"}</p>
    </div>
  );
}

export type ContractPrintSignatureMode = "filled" | "unfilled";

export function ContractPrintDocument({
  c,
  signatureMode,
  showStatusBadge = true,
}: {
  c: Contract;
  signatureMode: ContractPrintSignatureMode;
  /** Hide badge in print modal header if redundant */
  showStatusBadge?: boolean;
}) {
  const pendingSig = !c.sellerSignedAt || !c.buyerSignedAt;

  return (
    <div className="contract-print-document-inner space-y-5 text-slate-900">
      <div className="border-b border-slate-200 pb-4 mb-2">
        <h1 className="text-xl font-bold text-slate-900">{c.name}</h1>
        <p className="text-sm text-slate-600 font-mono mt-1">{c.contractRef}</p>
        {showStatusBadge && (
          <p className="text-xs text-slate-500 mt-2">
            Status: <span className="font-semibold text-slate-700">{contractStatusLabel(c.status)}</span>
          </p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-3 bg-white rounded-xl border border-slate-200 p-5">
        <Cell label="Contract type" value={c.type} />
        <Cell label="Contract term" value={c.term} />
        <Cell label="Effective date" value={c.effectiveDate} />
        <Cell label="Effective from" value={formatEffectiveFrom(c.effectiveAt)} />
        <Cell label="Opportunity ID" value={c.opportunityId || "—"} />
        <Cell label="Quote ID" value={c.quoteId || "—"} />
      </div>

      <Section title="Customer information">
        <div className="grid sm:grid-cols-2 gap-4">
          <Cell label="Account" value={c.customer.accountName} />
          <Cell label="Contact" value={c.customer.contactName} />
          <div className="sm:col-span-2">
            <Cell label="Company details" value={c.customer.companyDetails} />
          </div>
        </div>
      </Section>

      <Section title="Product / quote details">
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase text-slate-500">
                <th className="text-left px-3 py-2">SKU</th>
                <th className="text-left px-3 py-2">Product</th>
                <th className="text-right px-3 py-2">Qty</th>
                <th className="text-right px-3 py-2">Price</th>
                <th className="text-right px-3 py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {c.lineItems.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{row.sku || "—"}</td>
                  <td className="px-3 py-2">{row.productName}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.quantity}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.listPrice}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium">{row.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Payment terms">
        <div className="grid sm:grid-cols-2 gap-4">
          <Cell label="Payment method" value={c.paymentMethod} />
          <Cell label="Payment due" value={c.paymentDue} />
          <Cell label="Advance payment" value={c.advancePayment} />
          <Cell label="Late payment penalty" value={c.latePaymentPenalty} />
        </div>
      </Section>

      <Section title="Delivery terms">
        <div className="grid sm:grid-cols-2 gap-4">
          <Cell label="Delivery timeline" value={c.deliveryTimeline} />
          <Cell label="Delivery method" value={c.deliveryMethod} />
          <Cell label="Shipping responsibility" value={c.shippingResponsibility} />
          <Cell label="Partial delivery" value={c.partialDeliveryAllowed ? "Yes" : "No"} />
        </div>
      </Section>

      <Section title="Validity / expiry">
        <div className="grid sm:grid-cols-2 gap-4">
          <Cell label="Quote validity" value={c.quoteValidityDays} />
          <Cell label="Price lock duration" value={c.priceLockDuration} />
        </div>
      </Section>

      <Section title="Terms & conditions">
        <div className="space-y-3">
          <Cell label="Return policy" value={c.returnPolicy} />
          <Cell label="Cancellation terms" value={c.cancellationTerms} />
          <Cell label="Warranty" value={c.warranty} />
          <Cell label="Liability limitations" value={c.liabilityLimitations} />
        </div>
      </Section>

      <Section title="Special conditions">
        <div className="space-y-3">
          <Cell label="Custom pricing notes" value={c.customPricingNotes} />
          <Cell label="Discounts" value={c.discounts} />
          <Cell label="Contract-specific agreements" value={c.contractSpecificAgreements} />
        </div>
      </Section>

      {signatureMode === "filled" && c.approverEsignature && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden print:break-inside-avoid">
          <div className="px-5 py-3 border-b border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Approval e-signature</p>
          </div>
          <div className="px-5 py-4">
            <Cell label="Approver signature (recorded)" value={c.approverEsignature} />
            <p className="text-xs text-slate-500 mt-2">
              Recorded when this contract was approved on the Contract approval screen.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden print:break-inside-avoid">
        <div className="px-5 py-3 border-b border-slate-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Signatures</p>
        </div>
        <div className="px-5 py-4">
          {signatureMode === "unfilled" ? (
            <div className="space-y-8 text-sm">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
                  Internal approval
                </p>
                <div className="flex flex-wrap items-end gap-4">
                  <span className="text-slate-600 shrink-0">Signature</span>
                  <span className="flex-1 min-w-[200px] border-b border-slate-400 min-h-[28px]" />
                  <span className="text-slate-600 shrink-0">Date</span>
                  <span className="w-32 border-b border-slate-400 min-h-[28px]" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-10">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
                    Seller
                  </p>
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-end gap-2">
                      <span className="text-slate-600 text-xs w-16">Name</span>
                      <span className="flex-1 border-b border-slate-400 min-h-[24px]" />
                    </div>
                    <div className="flex flex-wrap items-end gap-2">
                      <span className="text-slate-600 text-xs w-16">Signature</span>
                      <span className="flex-1 border-b border-slate-400 min-h-[28px]" />
                    </div>
                    <div className="flex flex-wrap items-end gap-2">
                      <span className="text-slate-600 text-xs w-16">Date</span>
                      <span className="flex-1 border-b border-slate-400 min-h-[24px]" />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
                    Buyer
                  </p>
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-end gap-2">
                      <span className="text-slate-600 text-xs w-16">Name</span>
                      <span className="flex-1 border-b border-slate-400 min-h-[24px]" />
                    </div>
                    <div className="flex flex-wrap items-end gap-2">
                      <span className="text-slate-600 text-xs w-16">Signature</span>
                      <span className="flex-1 border-b border-slate-400 min-h-[28px]" />
                    </div>
                    <div className="flex flex-wrap items-end gap-2">
                      <span className="text-slate-600 text-xs w-16">Date</span>
                      <span className="flex-1 border-b border-slate-400 min-h-[24px]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : pendingSig ? (
            <p className="text-sm font-medium text-amber-700">Pending signature</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <Cell label="Seller signature" value={c.sellerName ?? "—"} />
                <p className="text-xs text-slate-500 mt-1">
                  {c.sellerSignedAt ? formatEffectiveFrom(c.sellerSignedAt) : "—"}
                </p>
              </div>
              <div>
                <Cell label="Buyer signature" value={c.buyerName ?? "—"} />
                <p className="text-xs text-slate-500 mt-1">
                  {c.buyerSignedAt ? formatEffectiveFrom(c.buyerSignedAt) : "—"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
