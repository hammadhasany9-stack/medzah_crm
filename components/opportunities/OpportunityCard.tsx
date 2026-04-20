"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  PhoneCall, Globe, UserPlus, Building2,
  Link2, Megaphone, Users, Star, Zap,
  HelpCircle, Calendar, DollarSign,
  Clock, XCircle, FilePlus, CheckCircle2, X, RefreshCw, Eye,
} from "lucide-react";
import { Opportunity, Priority } from "@/lib/types";
import { ViewQuoteModal } from "@/components/quotes/ViewQuoteModal";

// ─── Source badge ─────────────────────────────────────────────────────────────

const sourceIconMap: Record<string, LucideIcon> = {
  "Cold Call":             PhoneCall,
  "Cold Outreach":         PhoneCall,
  "Internal Referral":     UserPlus,
  "External Referral":     UserPlus,
  Referral:                UserPlus,
  "Chamber of Commerce":   Building2,
  Premier:                 Star,
  "Premier Activation":    Zap,
  Facebook:                Globe,
  LinkedIn:                Link2,
  "Trade Show":            Building2,
  "Yamas Rental Commerce": Building2,
  Unaccounted:             HelpCircle,
  "Social Media":          Megaphone,
  Website:                 Globe,
};

function SourceBadge({ source }: { source: string }) {
  const Icon = sourceIconMap[source] ?? Users;
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-medium bg-white text-slate-700 whitespace-nowrap border border-blue-200">
      <Icon size={11} className="text-blue-400 flex-shrink-0" />
      {source}
    </span>
  );
}

// ─── Priority badge ───────────────────────────────────────────────────────────

const priorityStyles: Record<Priority, { bg: string; text: string; emoji: string; label: string }> = {
  Hot:  { bg: "bg-orange-100", text: "text-orange-600", emoji: "🔥", label: "HOT"  },
  Warm: { bg: "bg-amber-100",  text: "text-amber-600",  emoji: "☀️", label: "WARM" },
  Cold: { bg: "bg-sky-100",    text: "text-sky-600",    emoji: "❄️", label: "COLD" },
};

function PriorityBadge({ priority }: { priority: Priority }) {
  const s = priorityStyles[priority];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-semibold whitespace-nowrap ${s.bg} ${s.text}`}>
      <span className="text-[13px] leading-none">{s.emoji}</span>
      {s.label}
    </span>
  );
}

function WonBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-semibold whitespace-nowrap bg-emerald-100 text-emerald-700">
      <CheckCircle2 size={12} className="flex-shrink-0" />
      WON
    </span>
  );
}

function LostBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-semibold whitespace-nowrap bg-red-100 text-red-600">
      <X size={12} className="flex-shrink-0" />
      LOST
    </span>
  );
}

function AdjustedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-violet-100 text-violet-700 border border-violet-200">
      <RefreshCw size={10} className="flex-shrink-0" />
      Quote Adjusted
    </span>
  );
}

function NegotiationQuotePendingBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-amber-100 text-amber-800 border border-amber-200">
      <Clock size={10} className="flex-shrink-0" />
      Quote pending
    </span>
  );
}

function NegotiationQuoteApprovedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-emerald-100 text-emerald-800 border border-emerald-200">
      <CheckCircle2 size={10} className="flex-shrink-0" />
      Quote approved
    </span>
  );
}

// ─── Next action follow-up indicator ─────────────────────────────────────────

function formatFollowUpLabel(isoDate: string): { label: string; urgent: boolean; soon: boolean } {
  const due  = new Date(isoDate);
  const now  = new Date();
  const diffMs   = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0)  return { label: "Overdue",    urgent: true,  soon: false };
  if (diffDays === 0) return { label: "Due Today",  urgent: true,  soon: false };
  if (diffDays === 1) return { label: "Due Tomorrow", urgent: false, soon: true };
  if (diffDays <= 3)  return { label: `Due in ${diffDays}d`, urgent: false, soon: true };

  const month = due.toLocaleString("default", { month: "short" });
  const day   = due.getDate();
  return { label: `Follow-up ${month} ${day}`, urgent: false, soon: false };
}

function NextActionIndicator({ followUpDate }: { followUpDate?: string }) {
  if (!followUpDate) {
    return (
      <span className="text-[11px] text-slate-300 whitespace-nowrap flex-shrink-0">
        No action set
      </span>
    );
  }

  const { label, urgent, soon } = formatFollowUpLabel(followUpDate);
  const dotCls  = urgent ? "bg-red-500"   : soon ? "bg-amber-500"  : "bg-[#002f93]";
  const textCls = urgent ? "text-red-500" : soon ? "text-amber-600" : "text-[#002f93]";

  return (
    <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium whitespace-nowrap flex-shrink-0 ${textCls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotCls}`} />
      {label}
    </span>
  );
}

// ─── Closing date indicator ───────────────────────────────────────────────────

function ClosingDateIndicator({ closingDate }: { closingDate: string }) {
  const date = new Date(closingDate);
  const now = new Date();
  const isPast = date < now;
  const isNear = !isPast && (date.getTime() - now.getTime()) < 7 * 24 * 60 * 60 * 1000;

  const displayDate = closingDate.includes("T")
    ? (() => {
        const [datePart, timePart] = closingDate.split("T");
        const [y, m, d] = datePart.split("-");
        return `${m}/${d}/${y} ; ${timePart.slice(0, 5)}`;
      })()
    : closingDate;

  const colorClass = isPast || isNear ? "text-red-500" : "text-slate-500";

  return (
    <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium whitespace-nowrap ${colorClass}`}>
      <Calendar size={12} className="flex-shrink-0" />
      {displayDate}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface OpportunityCardProps {
  opportunity: Opportunity;
  onClick: (opportunity: Opportunity) => void;
  onCreateQuote?: (e: React.MouseEvent, opp: Opportunity) => void;
}

export function OpportunityCard({
  opportunity,
  onClick,
  onCreateQuote,
}: OpportunityCardProps) {
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const isProposal      = opportunity.opportunityStage === "Proposal/Price Quote";
  const isNegotiation   = opportunity.opportunityStage === "Negotiation/Review";
  const isClosedWon     = opportunity.opportunityStage === "Closed Won";
  const isClosedLost    = opportunity.opportunityStage === "Closed Lost";
  const isPending       = isProposal && opportunity.quoteStatus === "pending";
  const isRejected      = isProposal && opportunity.quoteStatus === "rejected";
  const isApproved      = isProposal && opportunity.quoteStatus === "approved";
  const isAdjusted      = isProposal && !!opportunity.quoteAdjusted;

  const negotiationReviseAwaitingApproval =
    isNegotiation &&
    opportunity.quoteRevised === true &&
    opportunity.quoteStatus === "pending";
  const negotiationQuoteApproved =
    isNegotiation && opportunity.quoteStatus === "approved";

  // Left sideline strip colour
  const stripClass = isPending
    ? "bg-amber-400"
    : isRejected
    ? "bg-red-400"
    : isApproved
    ? "bg-emerald-400"
    : isAdjusted
    ? "bg-violet-400"
    : isNegotiation
    ? "bg-[#F59E0B]"
    : isClosedWon
    ? "bg-emerald-500"
    : isClosedLost
    ? "bg-red-400"
    : "bg-transparent";

  // Card border ring
  const borderClass = isClosedWon
    ? "border-emerald-300 ring-1 ring-emerald-200"
    : isClosedLost
    ? "border-red-300 ring-1 ring-red-200"
    : isPending
    ? "border-slate-200 ring-1 ring-amber-200"
    : isRejected
    ? "border-slate-200 ring-1 ring-red-200"
    : isAdjusted
    ? "border-slate-200 ring-1 ring-violet-200"
    : "border-slate-200";

  return (
    <>
    <div
      onClick={() => onClick(opportunity)}
      className={`bg-white rounded-2xl border cursor-pointer flex overflow-hidden
        shadow-[0_1px_4px_rgba(0,0,0,0.06)]
        hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] hover:-translate-y-0.5
        transition-all duration-200 ${borderClass}`}
    >
      {/* ── Left sideline strip ── */}
      <div className={`w-[3.5px] flex-shrink-0 rounded-l-2xl ${stripClass}`} />

      {/* ── Card body ── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Quote status banner (Proposal stage only) */}
        {isPending && (
          <div className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 border-b border-amber-100">
            <Clock size={11} className="text-amber-500 flex-shrink-0" />
            <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wide">
              Pending Approval
            </span>
          </div>
        )}
        {isRejected && (
          <div className="flex items-center gap-1.5 px-4 py-1.5 bg-red-50 border-b border-red-100">
            <XCircle size={11} className="text-red-500 flex-shrink-0" />
            <span className="text-[11px] font-semibold text-red-600 uppercase tracking-wide">
              Quote Rejected
            </span>
          </div>
        )}
        {isAdjusted && !isPending && !isRejected && (
          <div className="flex items-center gap-1.5 px-4 py-1.5 bg-violet-50 border-b border-violet-100">
            <RefreshCw size={11} className="text-violet-500 flex-shrink-0" />
            <span className="text-[11px] font-semibold text-violet-700 uppercase tracking-wide">
              Quote Adjusted
            </span>
          </div>
        )}

        {/* ── Top section ── */}
        <div className="px-4 pt-3.5 pb-3 space-y-2.5 flex-1">

          {/* Badge row */}
          <div className="flex items-center gap-2 flex-wrap">
            <SourceBadge source={opportunity.leadSource} />
            {isClosedWon
              ? <WonBadge />
              : isClosedLost
              ? <LostBadge />
              : <PriorityBadge priority={opportunity.leadPriority} />}
            {isAdjusted && <AdjustedBadge />}
            {negotiationReviseAwaitingApproval && <NegotiationQuotePendingBadge />}
            {negotiationQuoteApproved && <NegotiationQuoteApprovedBadge />}
          </div>

          {/* Opportunity name */}
          <div>
            <h3 className="text-[14px] font-bold text-slate-900 leading-snug line-clamp-2">
              🏆 {opportunity.opportunityName}
            </h3>
          </div>

          {/* Contact + company */}
          <div>
            <p className="text-[13px] font-semibold text-slate-800 truncate">
              {opportunity.contactName}
            </p>
            <p className="text-[12px] text-slate-500 mt-0.5 truncate">
              {opportunity.companyName}
            </p>
          </div>

          {/* Closing date (hidden once opportunity is closed) */}
          {!isClosedWon && !isClosedLost && (
            <ClosingDateIndicator closingDate={opportunity.closingDate} />
          )}

          {/* Expected revenue */}
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700">
            <DollarSign size={13} className="text-slate-400 flex-shrink-0" />
            {opportunity.expectedRevenue}
          </div>

          {/* Rejection reason */}
          {isRejected && opportunity.quoteRejectionReason && (
            <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-red-400 mb-0.5">
                Rejection Reason
              </p>
              <p className="text-[11px] text-red-700 leading-relaxed line-clamp-2">
                {opportunity.quoteRejectionReason}
              </p>
            </div>
          )}
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-slate-100 mx-4" />

        {/* ── Bottom row ── */}
        <div className="px-4 py-3 flex items-start justify-between gap-2 min-w-0">
          <div className="flex flex-col min-w-0 overflow-hidden">
            <p className="text-[12px] font-semibold text-slate-700 truncate leading-snug">{opportunity.assignedTo}</p>
            <p className="text-[11px] text-slate-400 leading-snug">{opportunity.opportunityRef}</p>
          </div>
          {!isClosedWon && !isClosedLost && (
            <NextActionIndicator followUpDate={opportunity.quoteData?.followUpDate} />
          )}
        </div>

        {/* ── Action buttons ── */}
        {(isProposal || isRejected || isNegotiation) && (
          <div className="px-4 pb-3.5 flex items-center gap-2">
            {isProposal && opportunity.quoteData && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowQuoteModal(true); }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-semibold rounded-lg bg-[#002f93] text-white hover:bg-[#001f6b] transition-colors"
              >
                <Eye size={12} />
                View Quote
              </button>
            )}
            {isRejected && onCreateQuote && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onCreateQuote(e, opportunity); }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-semibold rounded-lg bg-[#002f93] text-white hover:bg-[#001f6b] transition-colors"
              >
                <FilePlus size={12} />
                Create Quote
              </button>
            )}
            {isNegotiation && onCreateQuote && (
              <button
                type="button"
                disabled={negotiationReviseAwaitingApproval}
                onClick={(e) => { e.stopPropagation(); onCreateQuote(e, opportunity); }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-semibold rounded-lg border border-[#002f93]/20 text-[#002f93] hover:bg-[#002f93]/5 transition-colors disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                <FilePlus size={12} />
                Revise Quote
              </button>
            )}
          </div>
        )}
      </div>
    </div>

    {/* View Quote Modal */}
    {showQuoteModal && opportunity.quoteData && (
      <ViewQuoteModal
        opportunity={opportunity}
        onClose={() => setShowQuoteModal(false)}
      />
    )}
  </>
  );
}
