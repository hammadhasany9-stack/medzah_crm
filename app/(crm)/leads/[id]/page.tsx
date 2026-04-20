"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Pencil,
  Trash2,
  PlusCircle,
  ChevronRight,
  PhoneCall,
  Globe,
  UserPlus,
  Building2,
  Link2,
  Megaphone,
  Users,
} from "lucide-react";
import { mockLeads } from "@/lib/mock-data/leads";
import { Lead, Priority, LeadStatus, ActivityEvent } from "@/lib/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sourceIconMap: Record<string, LucideIcon> = {
  "Cold Call": PhoneCall,
  "Cold Outreach": PhoneCall,
  Referral: UserPlus,
  "Partner Referral": UserPlus,
  "Internal Referral": UserPlus,
  "External Referral": UserPlus,
  Website: Globe,
  LinkedIn: Link2,
  "Trade Show": Building2,
  "Email Campaign": Mail,
  "Social Media": Megaphone,
};

function SourceBadge({ source }: { source: string }) {
  const Icon = sourceIconMap[source] ?? Users;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-slate-600 bg-white border border-slate-200 whitespace-nowrap">
      <Icon size={11} className="text-slate-400 flex-shrink-0" />
      {source}
    </span>
  );
}

const priorityConfig: Record<Priority, { label: string; emoji: string; cls: string }> = {
  Hot:  { label: "HOT",  emoji: "🔥", cls: "bg-orange-100 text-orange-700 border border-orange-200" },
  Warm: { label: "WARM", emoji: "☀️", cls: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
  Cold: { label: "COLD", emoji: "❄️", cls: "bg-sky-50 text-sky-600 border border-sky-200" },
};

function PriorityBadge({ priority }: { priority: Priority }) {
  const c = priorityConfig[priority];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${c.cls}`}>
      <span>{c.emoji}</span>{c.label}
    </span>
  );
}

const statusColors: Record<LeadStatus, string> = {
  "New":                  "bg-indigo-100 text-indigo-700",
  "Attempted Contact":    "bg-amber-100 text-amber-700",
  "Contacted":            "bg-emerald-100 text-emerald-700",
  "Allocation":           "bg-blue-100 text-blue-700",
  "Qualified":            "bg-violet-100 text-violet-700",
  "Allocation on hold":   "bg-slate-100 text-slate-600",
  "Inactive":             "bg-red-100 text-red-600",
};

function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusColors[status]}`}>
      {status}
    </span>
  );
}

// ─── Stage stepper ────────────────────────────────────────────────────────────

const ALL_STAGES: { status: LeadStatus; short: string }[] = [
  { status: "New",                 short: "New" },
  { status: "Attempted Contact",   short: "Attempted" },
  { status: "Contacted",           short: "Contacted" },
  { status: "Allocation",          short: "Allocation" },
  { status: "Qualified",           short: "Qualified" },
  { status: "Allocation on hold",  short: "On Hold" },
  { status: "Inactive",            short: "Inactive" },
];

function LeadStageStepper({ status }: { status: LeadStatus }) {
  const activeIdx = ALL_STAGES.findIndex((s) => s.status === status);

  return (
    <div className="flex items-start w-full">
      {ALL_STAGES.map(({ status: s, short }, idx) => {
        const isPast    = idx < activeIdx;
        const isCurrent = idx === activeIdx;

        return (
          <div key={s} className="flex items-start flex-1 min-w-0">
            {/* Step column */}
            <div className="flex flex-col items-center flex-1 min-w-0 gap-1.5">
              {/* Dot row: line — dot — line */}
              <div className="flex items-center w-full">
                {/* Left line */}
                <div className={`flex-1 h-px transition-colors ${idx === 0 ? "invisible" : isPast || isCurrent ? "bg-[#002f93]" : "bg-slate-200"}`} />
                {/* Dot */}
                <div
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all ${
                    isCurrent
                      ? "bg-[#002f93] ring-2 ring-[#002f93]/25 ring-offset-1"
                      : isPast
                      ? "bg-[#002f93]/50"
                      : "bg-slate-200"
                  }`}
                />
                {/* Right line */}
                <div className={`flex-1 h-px transition-colors ${idx === ALL_STAGES.length - 1 ? "invisible" : isPast ? "bg-[#002f93]" : "bg-slate-200"}`} />
              </div>
              {/* Label */}
              <span
                className={`text-[9px] text-center leading-tight w-full px-0.5 truncate transition-colors ${
                  isCurrent
                    ? "text-[#002f93] font-bold"
                    : isPast
                    ? "text-slate-400 font-medium"
                    : "text-slate-300 font-medium"
                }`}
              >
                {short}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Select option lists ──────────────────────────────────────────────────────

const STATUS_OPTIONS: LeadStatus[] = [
  "New", "Attempted Contact", "Contacted",
  "Allocation", "Qualified", "Allocation on hold", "Inactive",
];
const PRIORITY_OPTIONS: Priority[] = ["Hot", "Warm", "Cold"];

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  actionLabel,
  children,
}: {
  title: string;
  actionLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          {title}
        </p>
        {actionLabel && (
          <button className="flex items-center gap-1 text-xs font-medium text-[#002f93] hover:opacity-70 transition-opacity">
            <PlusCircle size={12} />
            {actionLabel}
          </button>
        )}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

// ─── Detail cell ──────────────────────────────────────────────────────────────

function Cell({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value || "—"}</p>
    </div>
  );
}

// ─── Stat cell ────────────────────────────────────────────────────────────────

function StatCell({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col items-start gap-0.5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value ?? "—"}</p>
    </div>
  );
}

// ─── Activity dot ─────────────────────────────────────────────────────────────

const activityDotColor: Record<string, string> = {
  email:   "bg-[#002f93]",
  call:    "bg-emerald-500",
  note:    "bg-amber-400",
  created: "bg-violet-500",
};

function TimelineEvent({ event, isLast }: { event: ActivityEvent; isLast: boolean }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center pt-0.5">
        <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${activityDotColor[event.type] ?? "bg-slate-400"}`} />
        {!isLast && <div className="w-px flex-1 bg-slate-200 my-1" />}
      </div>
      <div className={`flex-1 min-w-0 ${!isLast ? "pb-5" : ""}`}>
        <p className="text-sm font-semibold text-slate-900 leading-snug">{event.title}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{event.description}</p>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mt-1">{event.timestamp}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "timeline">("overview");
  const [status,            setStatus]            = useState<string>("");
  const [priority,          setPriority]          = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const lead: Lead | undefined = mockLeads.find((l) => l.id === id);

  const currentStatus   = (status   || lead?.status)   as LeadStatus;
  const currentPriority = (priority || lead?.priority) as Priority;

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
        <p className="text-lg font-semibold">Lead not found</p>
        <button
          onClick={() => router.push("/leads")}
          className="flex items-center gap-2 text-sm text-[#002f93] hover:underline"
        >
          <ArrowLeft size={14} /> Back to Leads
        </button>
      </div>
    );
  }

  const initials = lead.contactName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col h-full">
      {/* ── Sticky top bar ── */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: back + breadcrumb */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => router.push("/leads")}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-1.5 text-sm text-slate-500 min-w-0">
            <span
              className="hover:text-[#002f93] cursor-pointer"
              onClick={() => router.push("/leads")}
            >
              Leads
            </span>
            <ChevronRight size={13} className="flex-shrink-0 text-slate-300" />
            <span className="font-semibold text-slate-900 truncate">{lead.contactName}</span>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#002f93] text-white hover:bg-[#001f6b] transition-colors">
            <Mail size={16} />
            Send Email
          </button>
          <button
            onClick={() => router.push(`/leads/${id}/edit`)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            title="Edit lead"
          >
            <Pencil size={20} />
          </button>

          {/* Delete with confirmation popover */}
          <div className="relative">
            <button
              onClick={() => setShowDeleteConfirm((v) => !v)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <Trash2 size={20} />
            </button>

            {showDeleteConfirm && (
              <>
                {/* Click-away backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDeleteConfirm(false)}
                />
                {/* Popover */}
                <div className="absolute right-0 top-10 z-50 w-64 bg-white rounded-xl border border-slate-200 shadow-lg p-4 space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">Delete this lead?</p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      This action cannot be undone. All data associated with{" "}
                      <span className="font-medium text-slate-700">{lead.contactName}</span> will be permanently removed.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        router.push("/leads");
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-5">

          {/* ── Card 1: Lead identity ── */}
          <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-base flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <h1 className="text-lg font-bold text-slate-900 leading-tight">{lead.contactName}</h1>
                <p className="text-sm text-slate-500">{lead.companyName}</p>
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <SourceBadge source={lead.leadSource} />
                  <PriorityBadge priority={currentPriority} />
                  <StatusBadge status={currentStatus} />
                  {lead.callDue ? (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${lead.callDue.toLowerCase().includes("today") ? "bg-red-50 text-red-600 border-red-100" : "bg-amber-50 text-amber-600 border-amber-100"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${lead.callDue.toLowerCase().includes("today") ? "bg-red-500" : "bg-amber-500"}`} />
                      {lead.callDue}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-400 border border-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                      No action scheduled
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Card 2: Stage stepper ── */}
          <div className="bg-white rounded-xl border border-slate-200 px-6 py-4 space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Created&nbsp;
              <span className="text-slate-600 normal-case tracking-normal font-semibold">{lead.createdDate}</span>
            </p>
            <LeadStageStepper status={currentStatus} />
          </div>

          {/* ── Card 3: Tab bar + dropdowns ── */}
          <div className="bg-white rounded-xl border border-slate-200 px-5">
            <div className="flex items-center justify-between gap-3">
              {/* Tabs */}
              <div className="flex gap-1">
                {(["overview", "timeline"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-sm font-semibold capitalize border-b-2 transition-colors ${
                      activeTab === tab
                        ? "border-[#002f93] text-[#002f93]"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Compact Status + Priority selects */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={currentStatus}
                    onChange={(e) => setStatus(e.target.value)}
                    className="appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-2.5 pr-6 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#002f93] focus:ring-offset-1 cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">▾</span>
                </div>
                <div className="relative">
                  <select
                    value={currentPriority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-2.5 pr-6 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#002f93] focus:ring-offset-1 cursor-pointer"
                  >
                    {PRIORITY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">▾</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Overview ── */}
          {activeTab === "overview" && (
            <div className="space-y-4">

              {/* Contact Information */}
              <Section title="Contact Information">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail size={14} className="text-slate-400 flex-shrink-0" />
                    <a href={`mailto:${lead.email}`} className="text-sm text-[#002f93] hover:underline">
                      {lead.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={14} className="text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-800">{lead.phone}</span>
                  </div>
                  {lead.location && (
                    <div className="flex items-center gap-3">
                      <MapPin size={14} className="text-slate-400 flex-shrink-0" />
                      <span className="text-sm text-slate-800">{lead.location}</span>
                    </div>
                  )}
                </div>
              </Section>

              {/* More Information */}
              <Section title="More Information">
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  <Cell label="Lead ID"       value={lead.leadRef} />
                  <Cell label="Lead Owner"    value={lead.assignedTo} />
                  <Cell label="Lead Source"   value={lead.leadSource} />
                  <Cell label="Lead Status"   value={currentStatus} />
                  <Cell label="Customer For"  value={lead.customerFor} />
                  <Cell label="Lead Priority" value={currentPriority} />
                  <Cell label="Title"         value={lead.contactTitle} />
                  <Cell label="Created Date"  value={lead.createdDate} />
                  {/* Next Action — always visible */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">
                      Next Action
                    </p>
                    {lead.callDue ? (
                      <span className={`flex items-center gap-1.5 text-sm font-medium ${lead.callDue.toLowerCase().includes("today") ? "text-red-600" : "text-amber-600"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${lead.callDue.toLowerCase().includes("today") ? "bg-red-500" : "bg-amber-500"}`} />
                        {lead.callDue}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-sm text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                        No action scheduled
                      </span>
                    )}
                  </div>
                  <Cell label="Mobile" />
                  <Cell label="Industry" />
                  <Cell label="Premier Rep" />
                  <Cell label="Premier Rep Email" />
                </div>
              </Section>

              {/* Billing Address Information */}
              <Section title="Billing Address Information">
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  <Cell label="Street" />
                  <Cell label="City" />
                  <Cell label="State" />
                  <Cell label="Zip Code" />
                  <Cell label="Country" />
                </div>
              </Section>

              {/* Description */}
              <Section title="Description">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {lead.note || "—"}
                </p>
              </Section>

              {/* Visit Summary */}
              <Section title="Visit Summary">
                <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                  <StatCell label="Most Recent Visit" />
                  <StatCell label="First Page Visited" />
                  <StatCell label="Average Time Spent" />
                  <StatCell label="Referrer" />
                  <StatCell label="No of Visits" />
                  <StatCell label="Visitor Score" />
                  <StatCell label="Days Visited" />
                </div>
              </Section>

              {/* Notes */}
              <Section title="Notes" actionLabel="Add a note">
                <p className="text-sm text-slate-400 italic">No notes yet.</p>
              </Section>

              {/* Connected Records */}
              <Section title="Connected Records" actionLabel="Add new">
                <p className="text-sm text-slate-400 italic">No connected records.</p>
              </Section>

              {/* Attachments */}
              <Section title="Attachments" actionLabel="Add new">
                <p className="text-sm text-slate-400 italic">No attachments.</p>
              </Section>

              {/* Products */}
              <Section title="Products" actionLabel="Add new">
                {lead.procurementProducts && lead.procurementProducts.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {lead.procurementProducts.map((p) => (
                      <div key={p.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                        <span className="text-sm font-medium text-slate-800">{p.name}</span>
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          Qty: {p.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">No products added.</p>
                )}
              </Section>

              {/* Open Activities */}
              <Section title="Open Activities" actionLabel="Add new">
                {lead.callDue ? (
                  <div className="flex items-center gap-3 py-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-800">{lead.callDue}</span>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">No open activities.</p>
                )}
              </Section>

              {/* Planned Activities */}
              <Section title="Planned Activities" actionLabel="Add new">
                <p className="text-sm text-slate-400 italic">No planned activities.</p>
              </Section>

              {/* Notes / Meetings */}
              <Section title="Notes / Meetings" actionLabel="Add new">
                <p className="text-sm text-slate-400 italic">No meetings scheduled.</p>
              </Section>

              {/* Emails */}
              <Section title="Emails" actionLabel="Compose Email">
                <p className="text-sm text-slate-400 italic">No emails logged.</p>
              </Section>

              {/* Campaigns */}
              <Section title="Campaigns" actionLabel="Add Campaigns">
                <p className="text-sm text-slate-400 italic">No campaigns linked.</p>
              </Section>

              {/* Social */}
              <Section title="Social">
                <p className="text-sm text-slate-400 italic">No social profiles linked.</p>
              </Section>

              {/* Opportunity Data (shown if qualified) */}
              {lead.opportunityData && (
                <Section title="Opportunity Details">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                    <Cell label="Opportunity Name"  value={lead.opportunityData.opportunityName} />
                    <Cell label="Account Name"       value={lead.opportunityData.accountName} />
                    <Cell label="Business Type"      value={lead.opportunityData.businessType} />
                    <Cell label="Pipeline"           value={lead.opportunityData.pipeline} />
                    <Cell label="Closing Date"       value={lead.opportunityData.closingDate} />
                    <Cell label="Follow-up Date"     value={lead.opportunityData.followUpDate} />
                    <Cell label="Expected Revenue"   value={lead.opportunityData.expectedRevenue} />
                    <Cell label="Amount"             value={lead.opportunityData.amount} />
                    <Cell label="Campaign Source"    value={lead.opportunityData.campaignSource} />
                    <Cell label="Lead Priority"      value={lead.opportunityData.leadPriority} />
                  </div>
                  {lead.opportunityData.description && (
                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <Cell label="Description" value={lead.opportunityData.description} />
                    </div>
                  )}
                </Section>
              )}

              {/* Allocation Details (shown if in allocation) */}
              {lead.procurementStatus && (
                <Section title="Allocation">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        lead.procurementStatus === "approved"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {lead.procurementStatus === "approved" ? "Approved" : "Checking"}
                    </span>
                    <span className="text-sm text-slate-500">
                      {lead.procurementStatus === "approved"
                        ? "Allocation has approved this lead."
                        : "Allocation check is in progress."}
                    </span>
                  </div>
                </Section>
              )}
            </div>
          )}

          {/* ── Timeline ── */}
          {activeTab === "timeline" && (
            <Section title="Activity History">
              {lead.activities.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No activity recorded.</p>
              ) : (
                <div>
                  {lead.activities.map((event, idx) => (
                    <TimelineEvent
                      key={event.id}
                      event={event}
                      isLast={idx === lead.activities.length - 1}
                    />
                  ))}
                </div>
              )}
            </Section>
          )}

          {/* Bottom spacer */}
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}
