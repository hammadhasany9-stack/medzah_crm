"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, XCircle, Clock,
  Calendar, DollarSign, UserPlus, Printer,
} from "lucide-react";
import { mockOpportunities } from "@/lib/mock-data/opportunities";
import { Opportunity, QuoteData, QuoteStatus } from "@/lib/types";
import { QuoteAdjustModal } from "@/components/quotes/QuoteAdjustModal";
import { QuoteRejectModal } from "@/components/quotes/QuoteRejectModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatValidDate(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("T")[0].split("-");
  return `${m}/${d}/${y} - 21:00`;
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{title}</p>
        {action}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

// ─── Detail cell ──────────────────────────────────────────────────────────────

function Cell({ label, value, highlight }: { label: string; value?: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
      <p className={`text-sm font-medium ${highlight ? "text-red-500 font-semibold" : "text-slate-800"}`}>{value || "—"}</p>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status?: QuoteStatus }) {
  if (!status || status === "none") return null;
  const config = {
    pending:  { icon: <Clock size={12} className="text-amber-500" />,   text: "Pending Approval", cls: "bg-amber-50 border-amber-200 text-amber-700" },
    approved: { icon: <CheckCircle2 size={12} className="text-emerald-500" />, text: "Approved", cls: "bg-emerald-50 border-emerald-200 text-emerald-700" },
    rejected: { icon: <XCircle size={12} className="text-red-500" />,   text: "Rejected",  cls: "bg-red-50 border-red-200 text-red-700" },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.cls}`}>
      {c.icon}{c.text}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QuoteDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const [opp, setOpp] = useState<Opportunity | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored: Opportunity[] = JSON.parse(localStorage.getItem("crmOpportunities") ?? "[]");
        const found = stored.find((o) => o.id === id);
        if (found) return found;
      } catch { /* ignore */ }
    }
    return mockOpportunities.find((o) => o.id === id) ?? null;
  });

  useEffect(() => {
    if (!opp) {
      try {
        const stored: Opportunity[] = JSON.parse(localStorage.getItem("crmOpportunities") ?? "[]");
        const found = stored.find((o) => o.id === id);
        if (found) setOpp(found);
        else setOpp(mockOpportunities.find((o) => o.id === id) ?? null);
      } catch {
        setOpp(mockOpportunities.find((o) => o.id === id) ?? null);
      }
    }
  }, [id, opp]);

  function persistOpp(updated: Opportunity) {
    setOpp(updated);
    try {
      const stored: Opportunity[] = JSON.parse(localStorage.getItem("crmOpportunities") ?? "[]");
      const next = stored.map((o) => (o.id === id ? updated : o));
      localStorage.setItem("crmOpportunities", JSON.stringify(next));
    } catch { /* ignore */ }
  }

  function updateStatus(status: QuoteStatus) {
    if (!opp) return;
    persistOpp({ ...opp, quoteStatus: status });
  }

  function handleAdjustSubmit(updatedOpp: Opportunity) {
    persistOpp(updatedOpp);
    setShowAdjustModal(false);
  }

  function handleRejectSubmit(updatedOpp: Opportunity, reason: string) {
    persistOpp({ ...updatedOpp, quoteStatus: "rejected", quoteRejectionReason: reason });
    setShowRejectModal(false);
  }

  if (!opp || !opp.quoteData) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
        <p className="text-lg font-semibold">Quote not found</p>
        <button
          onClick={() => router.push("/quotes")}
          className="flex items-center gap-2 text-sm text-[#002f93] hover:underline"
        >
          <ArrowLeft size={14} /> Back to Quotes
        </button>
      </div>
    );
  }

  const q: QuoteData = opp.quoteData;
  const isPending  = opp.quoteStatus === "pending";
  const isApproved = opp.quoteStatus === "approved";
  const isRejected = opp.quoteStatus === "rejected";

  const validDisplay = formatValidDate(q.validDate);

  return (
    <div className="flex flex-col h-full">

      {/* ── Sticky top bar ── */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4">
        {/* Left — back + breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push("/quotes")}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2 min-w-0 text-sm">
            <span
              onClick={() => router.push("/quotes")}
              className="text-slate-400 hover:text-[#002f93] cursor-pointer transition-colors"
            >
              {opp.companyName || opp.accountName}
            </span>
            <span className="text-slate-300">&rsaquo;</span>
            <span className="font-semibold text-slate-800 truncate">{opp.opportunityName}</span>
          </div>
          <StatusBadge status={opp.quoteStatus} />
        </div>

        {/* Right — action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => updateStatus("approved")}
            disabled={isApproved}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-[#002f93] text-white hover:bg-[#001f6b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle2 size={14} />
            Approve
          </button>
          <button
            onClick={() => setShowAdjustModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Adjust
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={isRejected}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <XCircle size={14} />
            Reject
          </button>
          <button
            onClick={() => window.print()}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
            title="Print / Collapse Print"
          >
            <Printer size={16} />
          </button>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">

          {/* ── Quote Details ── */}
          <Section title="Quote Details">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <Cell label="Quote Owner"             value={q.opportunityOwner} />
              <Cell label="Quote ID"                value={q.quoteId} />
              <Cell label="Contact"                 value={q.contactName} />
              <Cell label="Account Name"            value={q.accountName} />
              <Cell label="Quote Stage"             value={q.quoteStage} />
              <Cell label="Order Submittal Method"  value={q.orderSubmittalMethod} />
              <Cell label="Opportunity Name"        value={q.opportunityName} />
              <Cell label="Business Type"           value={q.businessType} />
              <Cell label="Shipping Method"         value={q.shippingMethod} />
              <Cell label="Customer PO"             value={q.customerPO || "—"} />
              <Cell label="Spread Sheet"            value={q.spreadSheet || "—"} />
              <Cell
                label="Valid Till Date"
                value={`📅 ${validDisplay}`}
                highlight={new Date(q.validDate) < new Date()}
              />
            </div>
          </Section>

          {/* ── Tax Information ── */}
          <Section title="Tax Information To">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <Cell label="Billing Street"   value={q.billingStreet} />
              <Cell label="Shipping Street"  value={q.shippingStreet} />
              <Cell label="Billing City"     value={q.billingCity} />
              <Cell label="Shipping City"    value={q.shippingCity} />
              <Cell label="Billing State"    value={q.billingState} />
              <Cell label="Shipping State"   value={q.shippingState} />
              <Cell label="Billing Code"     value={q.billingCode} />
              <Cell label="Shipping Code"    value={q.shippingCode} />
              <Cell label="Billing Country"  value={q.billingCountry} />
              <Cell label="Shipping Country" value={q.shippingCountry} />
            </div>
          </Section>

          {/* ── Line Items ── */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Line Items</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["#", "Product Name (%)", "Quantity", "List Price", "Amount", "Tax (%)"].map((h) => (
                      <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-5 py-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {q.items.map((item, idx) => (
                    <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 text-slate-500 text-xs">{idx + 1}</td>
                      <td className="px-5 py-3 font-medium text-slate-800">{item.productName}</td>
                      <td className="px-5 py-3 text-slate-600">{item.quantity}</td>
                      <td className="px-5 py-3 text-slate-600">{item.listPrice}</td>
                      <td className="px-5 py-3 font-semibold text-slate-800">{item.amount}</td>
                      <td className="px-5 py-3 text-slate-500">$0.00</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="px-5 py-4 border-t border-slate-100">
              <div className="ml-auto w-64 space-y-2">
                {[
                  { label: "Subtotal",   value: q.subtotal },
                  { label: "Discount",   value: q.discount },
                  { label: "Tax (%)",    value: q.tax },
                  { label: "Adjustment", value: q.adjustment },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{label}</span>
                    <span className="text-slate-700 font-medium">{value || "—"}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-sm font-bold text-slate-900">Grand Total</span>
                  <span className="text-sm font-bold text-slate-900 flex items-center gap-1">
                    <DollarSign size={13} className="text-slate-400" />
                    {q.grandTotal}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Team for Approval ── */}
          {q.teamForApproval && q.teamForApproval.length > 0 && (
            <Section title="Team for Approval">
              <div className="flex items-center gap-3 flex-wrap">
                {q.teamForApproval.map((member) => (
                  <div key={member} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#002f93]/10 flex items-center justify-center text-[#002f93] text-xs font-bold flex-shrink-0">
                      {member.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-slate-700 font-medium">{member}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ── Contact Roles ── */}
          <Section
            title="Contact Roles"
            action={
              <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-black px-3 py-1.5 rounded-lg transition-colors">
                <UserPlus size={11} />
                Add Contact
              </button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Order Owner", "Account Name", "Phone", "Email", "Role Name"].map((h) => (
                      <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400 pb-2.5 pr-6 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="pt-3 pr-6 text-sm font-medium text-[#002f93] hover:underline cursor-pointer whitespace-nowrap">
                      {opp.assignedTo}
                    </td>
                    <td className="pt-3 pr-6 text-sm text-slate-700">{opp.accountName}</td>
                    <td className="pt-3 pr-6 text-sm text-slate-500">{opp.contactPhone || "—"}</td>
                    <td className="pt-3 pr-6 text-sm text-slate-500">{opp.contactEmail || "—"}</td>
                    <td className="pt-3 pr-6 text-sm text-slate-400">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          {/* ── Notes ── */}
          <Section title="Notes">
            {q.orderNotes || q.termsAndConditions ? (
              <div className="space-y-3">
                {q.orderNotes && (
                  <div className="rounded-lg bg-amber-50 border border-amber-100 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Order Notes</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{q.orderNotes}</p>
                  </div>
                )}
                {q.termsAndConditions && (
                  <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Terms & Conditions</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{q.termsAndConditions}</p>
                  </div>
                )}
              </div>
            ) : (
              <textarea
                rows={3}
                placeholder="Add a note..."
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#002f93] placeholder:text-slate-400 leading-relaxed"
              />
            )}
          </Section>

          {/* ── Rejection reason (if rejected) ── */}
          {isRejected && opp.quoteRejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-1">Rejection Reason</p>
              <p className="text-sm text-red-700 leading-relaxed">{opp.quoteRejectionReason}</p>
            </div>
          )}

          {/* ── Expiration footer ── */}
          <div className="bg-white rounded-xl border border-slate-200 px-5 py-3 flex items-center gap-2 text-sm text-slate-500">
            <Calendar size={14} className="text-slate-400 flex-shrink-0" />
            <span>
              Expiration date of this quote is 30 days. Valid till{" "}
              <span className={`font-semibold ${new Date(q.validDate) < new Date() ? "text-red-500" : "text-slate-700"}`}>
                {validDisplay}
              </span>
            </span>
          </div>

          <div className="h-4" />
        </div>
      </div>

      {/* ── Adjust Modal ── */}
      {showAdjustModal && opp && (
        <QuoteAdjustModal
          opportunity={opp}
          onSubmit={handleAdjustSubmit}
          onCancel={() => setShowAdjustModal(false)}
        />
      )}

      {/* ── Reject Modal ── */}
      {showRejectModal && opp && (
        <QuoteRejectModal
          opportunity={opp}
          onSubmit={handleRejectSubmit}
          onCancel={() => setShowRejectModal(false)}
        />
      )}
    </div>
  );
}
