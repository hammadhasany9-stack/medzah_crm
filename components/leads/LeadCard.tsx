"use client";

import type { LucideIcon } from "lucide-react";
import {
  PhoneCall, Globe, UserPlus, Building2,
  Link2, Megaphone, Users, Star, Zap,
  HelpCircle,
} from "lucide-react";
import { Lead, LeadStatus, Priority } from "@/lib/types";

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

function QualifiedAction() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium whitespace-nowrap flex-shrink-0 text-slate-700">
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-violet-500" />
      Qualified
    </span>
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
  return (
    <div
      onClick={() => onClick(lead)}
      className="bg-white rounded-2xl border border-slate-200 cursor-pointer
        shadow-[0_1px_4px_rgba(0,0,0,0.06)]
        hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] hover:-translate-y-0.5
        transition-all duration-200"
    >
      <div className="px-4 pt-4 pb-5 space-y-3">
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
          {lead.status === "Inactive" && lead.allocationRejection && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-rose-50 text-rose-800 border border-rose-200">
              Rejection
            </span>
          )}
        </div>

        <div>
          <h3 className="text-[15px] font-bold text-slate-900 leading-snug truncate">
            {lead.contactName}
          </h3>
          <p className="text-[13px] text-slate-500 mt-0.5 truncate">
            {lead.companyName}
          </p>
        </div>
      </div>

      <div className="h-px bg-slate-100 mx-4" />

      <div className="px-4 py-3 flex items-start justify-between gap-2 min-w-0">
        <div className="flex flex-col min-w-0 overflow-hidden">
          <p className="text-[13px] font-semibold text-slate-800 truncate leading-snug">
            {lead.assignedTo}
          </p>
          <p className="text-[11px] text-slate-400 leading-snug">{lead.leadRef}</p>
        </div>
        {lead.status === "Qualified" ? (
          <QualifiedAction />
        ) : lead.callDue ? (
          <CallDue label={lead.callDue} />
        ) : (
          <span className="text-[11px] text-slate-300 whitespace-nowrap flex-shrink-0">No action set</span>
        )}
      </div>

      {lead.status === "Inactive" && lead.allocationRejection && (
        <>
          <div className="h-px bg-slate-100 mx-4" />
          <div className="px-4 py-2.5 flex flex-col gap-1.5">
            <p className="text-[12px] font-semibold text-slate-800 leading-snug">
              {lead.allocationRejection.category}
            </p>
            {lead.allocationRejection.detail && (
              <p className="text-[11px] text-slate-500 leading-snug line-clamp-3">
                {lead.allocationRejection.detail}
              </p>
            )}
          </div>
        </>
      )}

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
  );
}
