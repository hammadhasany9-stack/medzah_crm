"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  PhoneCall, Globe, UserPlus, Building2,
  Link2, Megaphone, Users, Star, Zap,
  HelpCircle, Loader2, ShieldCheck, ChevronDown, Package, Eye, CircleDot,
} from "lucide-react";
import { Lead, LeadStatus, ProcurementStatus, Priority, AllocationRecord } from "@/lib/types";
import { useCRMShell } from "@/components/shell/CRMShellContext";
import { canDownloadAllocationExport } from "@/lib/export-allocation-xlsx";
import { DownloadAllocationButton } from "@/components/allocations/DownloadAllocationButton";
import { ViewAllocationModal } from "./ViewAllocationModal";

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
  "Yamas Rental Commerce": Building2,
  Unaccounted:             HelpCircle,
  "Social Media":          Megaphone,
  Website:                 Globe,
};

function SourceBadge({ source, color }: { source: string; color?: string }) {
  const Icon = sourceIconMap[source] ?? Users;
  const borderColor = color ? `${color}66` : undefined;
  const iconColor   = color ?? "#60A5FA";
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-medium bg-white text-slate-700 whitespace-nowrap border"
      style={{ borderColor: borderColor ?? "#93C5FD" }}
    >
      <Icon size={11} style={{ color: iconColor }} className="flex-shrink-0" />
      {source}
    </span>
  );
}

// ─── Temperature badge ────────────────────────────────────────────────────────

const priorityStyles: Record<Priority, { bg: string; text: string; emoji: string; label: string }> = {
  Hot:  { bg: "bg-orange-100",  text: "text-orange-600", emoji: "🔥", label: "HOT"  },
  Warm: { bg: "bg-amber-100",   text: "text-amber-600",  emoji: "☀️", label: "WARM" },
  Cold: { bg: "bg-sky-100",     text: "text-sky-600",    emoji: "❄️", label: "COLD" },
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

// ─── Reason tag ──────────────────────────────────────────────────────────────

const reasonColors: Record<string, string> = {
  Budget:           "bg-red-50 text-red-600 border-red-200",
  Busy:             "bg-amber-50 text-amber-600 border-amber-200",
  "Internal Delay": "bg-violet-50 text-violet-600 border-violet-200",
  "Internal issue": "bg-violet-50 text-violet-600 border-violet-200",
  Other:            "bg-slate-100 text-slate-500 border-slate-200",
};

function ReasonTag({ reason }: { reason: string }) {
  const cls = reasonColors[reason] ?? "bg-slate-100 text-slate-500 border-slate-200";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 flex-shrink-0" />
      {reason}
    </span>
  );
}

// ─── Call-due indicator ───────────────────────────────────────────────────────

function CallDue({ label }: { label: string }) {
  const isToday = label.toLowerCase().includes("today");
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium whitespace-nowrap flex-shrink-0 ${isToday ? "text-red-500" : "text-amber-600"}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isToday ? "bg-red-500" : "bg-amber-500"}`} />
      {label}
    </span>
  );
}

// ─── Procurement status badge ─────────────────────────────────────────────────

const procurementBadgeStyles: Record<ProcurementStatus, { icon: LucideIcon; label: string; className: string }> = {
  checking: {
    icon:      Loader2,
    label:     "Checking",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  approved: {
    icon:      ShieldCheck,
    label:     "Approved",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
};

function ProcurementBadge({ status }: { status: ProcurementStatus }) {
  const { icon: Icon, label, className } = procurementBadgeStyles[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${className}`}>
      <Icon size={11} className={status === "checking" ? "animate-spin" : ""} />
      {label}
    </span>
  );
}

/** Shown on Allocation / Allocation on hold column cards when the allocation record has a verdict. */
function AllocationRecordVerdictBadge({ record }: { record: AllocationRecord }) {
  if (record.status === "Approved") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-emerald-100 text-emerald-800 border border-emerald-200">
        <ShieldCheck size={11} className="flex-shrink-0" />
        Approved
      </span>
    );
  }
  if (record.status === "Partially Approved") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-amber-100 text-amber-800 border border-amber-200">
        <CircleDot size={11} className="flex-shrink-0" />
        Partially approved
      </span>
    );
  }
  return null;
}

// ─── View products section ────────────────────────────────────────────────────

function ViewProductsSection({ lead }: { lead: Lead }) {
  const [open, setOpen] = useState(false);
  const products = lead.procurementProducts ?? [];
  if (products.length === 0) return null;

  return (
    <>
      <div className="h-px bg-slate-100 mx-4" />
      <div className="px-4 py-2">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
          className="w-full flex items-center justify-between text-[12px] font-semibold text-[#002f93] hover:text-[#001f6b] transition-colors group"
        >
          <span className="flex items-center gap-1.5">
            <Package size={12} />
            View Products ({products.length})
          </span>
          <ChevronDown
            size={13}
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="mt-2 rounded-lg border border-slate-100 bg-slate-50 overflow-hidden">
            <div className="grid grid-cols-[1fr_auto] gap-x-3 px-3 py-1.5 border-b border-slate-100">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Product</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide text-right">Qty</p>
            </div>
            {products.map((p, i) => (
              <div
                key={p.id}
                className={`grid grid-cols-[1fr_auto] gap-x-3 px-3 py-1.5 ${i < products.length - 1 ? "border-b border-slate-100" : ""}`}
              >
                <div>
                  <p className="text-[12px] text-slate-700 font-medium truncate">{p.name}</p>
                  {p.sku && <p className="text-[10px] text-slate-400">SKU: {p.sku}</p>}
                </div>
                <p className="text-[12px] text-slate-500 text-right whitespace-nowrap">
                  {p.quantity || "—"}{p.uom ? ` ${p.uom}` : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Stage badge (used in Source view) ───────────────────────────────────────

const stageConfig: Record<LeadStatus, { color: string; dot: string }> = {
  "New":                 { color: "#6366F1", dot: "#818CF8" },
  "Attempted Contact":   { color: "#F59E0B", dot: "#FCD34D" },
  "Contacted":           { color: "#10B981", dot: "#34D399" },
  "Allocation":          { color: "#002f93", dot: "#3B6FD4" },
  "Qualified":           { color: "#8B5CF6", dot: "#A78BFA" },
  "Allocation on hold":  { color: "#64748B", dot: "#94A3B8" },
  "Inactive":            { color: "#EF4444", dot: "#F87171" },
};

function StageBadge({ status }: { status: LeadStatus }) {
  const { color, dot } = stageConfig[status] ?? { color: "#64748B", dot: "#94A3B8" };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold whitespace-nowrap border"
      style={{ borderColor: color + "44", color, backgroundColor: color + "0f" }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: dot }} />
      {status}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
  variant?: "pipeline" | "source";
}

export function LeadCard({ lead, onClick, variant = "pipeline" }: LeadCardProps) {
  const { allocations } = useCRMShell();
  const [showAllocModal, setShowAllocModal] = useState(false);

  const inAllocationColumn = lead.status === "Allocation" || lead.status === "Allocation on hold";
  const isApproved = lead.procurementStatus === "approved";
  const allocationRecord = lead.allocationId
    ? allocations.find((a) => a.id === lead.allocationId) ?? null
    : null;
  // Show the View Allocation button only when the record has a non-Pending status
  const allocViewable = allocationRecord &&
    (allocationRecord.status === "Approved" ||
     allocationRecord.status === "Partially Approved" ||
     allocationRecord.status === "On Hold");

  return (
    <>
      <div
        onClick={() => onClick(lead)}
        className="bg-white rounded-2xl border border-slate-200 cursor-pointer
          shadow-[0_1px_4px_rgba(0,0,0,0.06)]
          hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] hover:-translate-y-0.5
          transition-all duration-200"
      >
        {/* ── Top section ── */}
        <div className="px-4 pt-4 pb-5 space-y-3">

          {/* Badge row */}
          <div className="flex items-center gap-2 flex-wrap">
            {variant === "source" ? (
              <>
                <StageBadge status={lead.status} />
                {lead.status !== "Inactive" && <PriorityBadge priority={lead.priority} />}
              </>
            ) : (
              <>
                <SourceBadge source={lead.leadSource} />
                {lead.status !== "Inactive" && <PriorityBadge priority={lead.priority} />}
              </>
            )}
            {inAllocationColumn && allocationRecord && (
              <AllocationRecordVerdictBadge record={allocationRecord} />
            )}
          </div>

          {/* Contact name */}
          <div>
            <h3 className="text-[15px] font-bold text-slate-900 leading-snug truncate">
              {lead.contactName}
            </h3>
            <p className="text-[13px] text-slate-500 mt-0.5 truncate">
              {lead.companyName}
            </p>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-slate-100 mx-4" />

        {/* ── Bottom row ── */}
        <div className="px-4 py-3 flex items-start justify-between gap-2 min-w-0">
          <div className="flex flex-col min-w-0 overflow-hidden">
            <p className="text-[13px] font-semibold text-slate-800 truncate leading-snug">
              {lead.assignedTo}
            </p>
            <p className="text-[11px] text-slate-400 leading-snug">{lead.leadRef}</p>
          </div>
          {lead.callDue ? (
            <CallDue label={lead.callDue} />
          ) : (
            <span className="text-[11px] text-slate-300 whitespace-nowrap flex-shrink-0">No action set</span>
          )}
        </div>

        {/* ── View Products (procurement) ── */}
        <ViewProductsSection lead={lead} />

        {/* ── Procurement status badge ── */}
        {lead.procurementStatus && (
          <>
            <div className="h-px bg-slate-100 mx-4" />
            <div className="px-4 py-2.5 flex items-center justify-between gap-2">
              {/* Hide "Checking" badge once a verdict has been given */}
              {!allocViewable && <ProcurementBadge status={lead.procurementStatus} />}

              <div className="flex items-center gap-2 flex-wrap justify-end ml-auto">
                {allocationRecord && canDownloadAllocationExport(allocationRecord.status) && (
                  <DownloadAllocationButton record={allocationRecord} stopPropagation size="sm" />
                )}
                {/* View Allocation button — only when verdict is in */}
                {(isApproved || allocViewable) && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShowAllocModal(true); }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#002f93] border border-[#002f93]/25 hover:bg-[#002f93]/5 transition-colors"
                  >
                    <Eye size={11} />
                    View Allocation
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── Reason tag + note (Contacted & Inactive columns only) ── */}
        {lead.reason && (lead.status === "Contacted" || lead.status === "Inactive") && (
          <>
            <div className="h-px bg-slate-100 mx-4" />
            <div className="px-4 py-2.5 flex flex-col gap-1.5">
              <ReasonTag reason={lead.reason} />
              {lead.reasonNote && (
                <p className="text-[11px] text-slate-500 leading-snug line-clamp-2 pl-0.5">
                  {lead.reasonNote}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* View Allocation Modal — compact (products only) when triggered from card */}
      {showAllocModal && allocationRecord && (
        <ViewAllocationModal
          allocation={allocationRecord}
          onClose={() => setShowAllocModal(false)}
          compact
        />
      )}
    </>
  );
}
