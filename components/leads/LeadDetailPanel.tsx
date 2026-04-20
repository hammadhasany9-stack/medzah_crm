"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  X, Eye, Pencil, Trash2,
  Mail, Phone, MapPin,
  PhoneCall, Globe, UserPlus, Building2, Link2, Megaphone, Users,
} from "lucide-react";
import { Lead, Priority, LeadStatus } from "@/lib/types";

// ─── Source badge ─────────────────────────────────────────────────────────────

const sourceIconMap: Record<string, LucideIcon> = {
  "Cold Call": PhoneCall, "Cold Outreach": PhoneCall,
  Referral: UserPlus, "Partner Referral": UserPlus,
  Website: Globe, LinkedIn: Link2,
  "Trade Show": Building2, "Email Campaign": Mail, "Social Media": Megaphone,
};

function SourceBadge({ source }: { source: string }) {
  const Icon = sourceIconMap[source] ?? Users;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-slate-600 bg-white border border-slate-300 whitespace-nowrap">
      <Icon size={10} className="text-slate-500 flex-shrink-0" />
      {source}
    </span>
  );
}

// ─── Priority badge ───────────────────────────────────────────────────────────

const priorityConfig: Record<Priority, { label: string; emoji: string; cls: string }> = {
  Hot:  { label: "HOT",  emoji: "🔥", cls: "bg-orange-100 text-orange-700 border border-orange-200" },
  Warm: { label: "WARM", emoji: "☀️", cls: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
  Cold: { label: "COLD", emoji: "❄️", cls: "bg-sky-50 text-sky-600 border border-sky-200" },
};

function PriorityBadge({ priority }: { priority: Priority }) {
  const c = priorityConfig[priority];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${c.cls}`}>
      <span>{c.emoji}</span>{c.label}
    </span>
  );
}

// ─── Inline select ────────────────────────────────────────────────────────────

function InlineSelect({
  label,
  value,
  options,
  onChange,
  disabled,
  title,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <div className="flex flex-col gap-1 flex-1">
      <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</label>
      <div className="relative" title={title}>
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 font-medium pr-8 focus:outline-none focus:ring-2 focus:ring-[#002f93] focus:ring-offset-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▾</span>
      </div>
    </div>
  );
}

// ─── Activity timeline ────────────────────────────────────────────────────────

const activityDotColor: Record<string, string> = {
  email: "bg-[#002f93]", call: "bg-emerald-500", note: "bg-amber-400", created: "bg-violet-500",
};

function ActivityTimeline({ events }: { events: Lead["activities"] }) {
  return (
    <div>
      {events.map((event, idx) => (
        <div key={event.id} className="flex gap-3">
          <div className="flex flex-col items-center pt-0.5">
            {idx === 0
              ? <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${activityDotColor[event.type]}`} />
              : <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 border-2 border-slate-300 bg-white" />
            }
            {idx < events.length - 1 && <div className="w-px flex-1 bg-slate-200 my-1" />}
          </div>
          <div className="pb-5 flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 leading-snug">{event.title}</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{event.description}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mt-1">{event.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Detail cell ──────────────────────────────────────────────────────────────

function DetailCell({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value ?? "—"}</p>
    </div>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: LeadStatus[] = ["New", "Attempted Contact", "Contacted", "Allocation", "Qualified", "Allocation on hold", "Inactive"];
const PRIORITY_OPTIONS: Priority[] = ["Hot", "Warm", "Cold"];

// ─── Panel ────────────────────────────────────────────────────────────────────

interface LeadDetailPanelProps {
  lead: Lead | null;
  onClose: () => void;
  onStatusChangeRequest?: (leadId: string, targetStatus: LeadStatus) => void;
  onPriorityChange?: (leadId: string, priority: Priority) => void;
}

export function LeadDetailPanel({
  lead,
  onClose,
  onStatusChangeRequest,
  onPriorityChange,
}: LeadDetailPanelProps) {
  const isOpen = !!lead;
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const initials = lead
    ? lead.contactName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "";

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={`fixed right-0 top-0 h-full w-[340px] bg-white z-50 flex flex-col
          shadow-[-20px_0_60px_rgba(0,0,0,0.15)]
          transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {!lead ? null : (
          <>
            {/* ── Header ── */}
            <div className="flex-shrink-0 px-5 pt-5 pb-4 space-y-4">
              {/* Icon row */}
              <div className="flex items-center justify-between">
                <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                  <X size={16} />
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => lead && router.push(`/leads/${lead.id}`)}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    title="Open full view"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => lead && router.push(`/leads/${lead.id}/edit`)}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    title="Edit lead"
                  >
                    <Pencil size={16} />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowDeleteConfirm((v) => !v)}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="Delete lead"
                    >
                      <Trash2 size={16} />
                    </button>

                    {showDeleteConfirm && (
                      <>
                        {/* Click-away backdrop */}
                        <div
                          className="fixed inset-0 z-[60]"
                          onClick={() => setShowDeleteConfirm(false)}
                        />
                        {/* Confirmation popover */}
                        <div className="absolute right-0 top-9 z-[61] w-64 bg-white rounded-xl border border-slate-200 shadow-lg p-4 space-y-3">
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
                                onClose();
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

              {/* Avatar + name + badges */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-1 flex-wrap">
                <SourceBadge source={lead.leadSource} />
                    <PriorityBadge priority={lead.priority} />
                    </div>
                    </div>
              <div className="flex items-center gap-2">
                {/* Avatar placeholder */}
                
                <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0 mt-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" fill="currentColor" opacity="0.6" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
                  </svg>
                </div>
                

              
                
                  <div className="flex-1 items-center flex-wrap">
                    <h2 className="text-base font-bold text-slate-900">{lead.contactName}</h2>
                    <p className="text-sm text-slate-500">{lead.companyName}</p>
                  </div>
                  </div>
                  
                 
                  <div className="flex items-center gap-2 mt-1.5">
                    {lead.callDue ? (
                      <>
                        <span className={`flex items-center gap-1.5 text-xs font-medium ${lead.callDue.toLowerCase().includes("today") ? "text-red-500" : "text-amber-600"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${lead.callDue.toLowerCase().includes("today") ? "bg-red-500" : "bg-amber-500"}`} />
                          {lead.callDue}
                        </span>
                        <button className="text-xs text-[#002f93] hover:underline">Change date</button>
                      </>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                        No action scheduled
                      </span>
                    )}
                  </div>
                
              

              {/* Status + Priority — driven by sales board (modals + restrictions match drag-and-drop) */}
              <div className="flex gap-3">
                <InlineSelect
                  label="Lead Status"
                  value={lead.status}
                  options={STATUS_OPTIONS}
                  disabled={!onStatusChangeRequest}
                  title={!onStatusChangeRequest ? "Status actions are unavailable." : undefined}
                  onChange={(v) => {
                    const next = v as LeadStatus;
                    if (next === lead.status) return;
                    onStatusChangeRequest?.(lead.id, next);
                  }}
                />
                <InlineSelect
                  label="Lead Priority"
                  value={lead.priority}
                  options={PRIORITY_OPTIONS}
                  disabled={!onPriorityChange}
                  title={!onPriorityChange ? "Priority actions are unavailable." : undefined}
                  onChange={(v) => {
                    const next = v as Priority;
                    if (next === lead.priority) return;
                    onPriorityChange?.(lead.id, next);
                  }}
                />
              </div>
            </div>

            {/* ── Scrollable body ── */}
            <div className="flex-1 overflow-y-auto">

              {/* CONTACT INFORMATION */}
              <section className="px-5 py-4 border-t border-slate-100">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Contact Information</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail size={14} className="text-slate-400 flex-shrink-0" />
                    <a href={`mailto:${lead.email}`} className="text-sm text-[#002f93] hover:underline truncate">{lead.email}</a>
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
              </section>

              {/* MORE DETAILS */}
              <section className="px-5 py-4 border-t border-slate-100">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">More Details</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <DetailCell label="Lead ID"       value={lead.leadRef} />
                  <DetailCell label="Lead Owner"    value={lead.assignedTo} />
                  <DetailCell label="Customer For"  value={lead.customerFor} />
                  <DetailCell label="Lead Status"   value={lead.status} />
                  <DetailCell label="Lead Source"   value={lead.leadSource} />
                  <DetailCell label="Lead Priority" value={lead.priority} />
                </div>
                {lead.contactTitle && (
                  <div className="mt-4">
                    <DetailCell label="Title" value={lead.contactTitle} />
                  </div>
                )}
              </section>

              {/* ACTIVITY HISTORY */}
              <section className="px-5 py-4 border-t border-slate-100">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-4">Activity History</p>
                <ActivityTimeline events={lead.activities} />
              </section>
            </div>

            {/* ── Sticky footer ── */}
            <div className="flex-shrink-0 px-5 py-4 border-t border-slate-100 bg-white">
              <button className="w-full bg-slate-900 hover:bg-black text-white text-sm font-semibold py-3 rounded-xl transition-colors duration-150 flex items-center justify-center gap-2">
                <Mail size={15} />
                Send Email
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
