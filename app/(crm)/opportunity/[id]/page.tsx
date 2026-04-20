"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft, Mail, Phone, Pencil, Trash2, PlusCircle,
  PhoneCall, Globe, UserPlus, Building2, Link2, Megaphone,
  Users, Star, Zap, HelpCircle,
  Calendar,
} from "lucide-react";
import { mockOpportunities } from "@/lib/mock-data/opportunities";
import { Opportunity, OpportunityStage, Priority } from "@/lib/types";
import { isAdvanceBlockedWithoutApprovedQuote } from "@/lib/opportunity-stage-guards";
import { QuoteApprovalRequiredDialog } from "@/components/opportunities/QuoteApprovalRequiredDialog";

// ─── Stage config ─────────────────────────────────────────────────────────────

const STAGES: { stage: OpportunityStage; probability: string }[] = [
  { stage: "Qualified",            probability: "10%"  },
  { stage: "Proposal/Price Quote", probability: "75%"  },
  { stage: "Negotiation/Review",   probability: "90%"  },
  { stage: "Closed Won",           probability: "100%" },
  { stage: "Closed Lost",          probability: "0%"   },
];

const STAGE_COLOR: Record<OpportunityStage, string> = {
  "Qualified":            "#8B5CF6",
  "Proposal/Price Quote": "#3B82F6",
  "Negotiation/Review":   "#F59E0B",
  "Closed Won":           "#10B981",
  "Closed Lost":          "#EF4444",
};

function probabilityForStage(stage: OpportunityStage): string {
  return STAGES.find((s) => s.stage === stage)?.probability ?? "—";
}

// ─── Source badge ─────────────────────────────────────────────────────────────

const sourceIconMap: Record<string, LucideIcon> = {
  "Cold Call":           PhoneCall, "Cold Outreach":   PhoneCall,
  "Internal Referral":   UserPlus,  "External Referral": UserPlus,
  Referral:              UserPlus,  "Chamber of Commerce": Building2,
  Premier:               Star,      "Premier Activation": Zap,
  Facebook:              Globe,     LinkedIn: Link2,
  "Trade Show":          Building2, "Social Media": Megaphone,
  Website:               Globe,     Unaccounted: HelpCircle,
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

// ─── Priority badge ───────────────────────────────────────────────────────────

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

// ─── Stage stepper ────────────────────────────────────────────────────────────

function OpportunityStageStepper({ currentStage }: { currentStage: OpportunityStage }) {
  const activeIdx = STAGES.findIndex((s) => s.stage === currentStage);

  return (
    <div className="flex items-start w-full">
      {STAGES.map(({ stage, probability }, idx) => {
        const isPast    = idx < activeIdx;
        const isCurrent = idx === activeIdx;
        const color     = isCurrent ? STAGE_COLOR[stage] : isPast ? "#002f93" : undefined;

        return (
          <div key={stage} className="flex items-start flex-1 min-w-0">
            <div className="flex flex-col items-center flex-1 min-w-0 gap-1.5">
              {/* Dot row */}
              <div className="flex items-center w-full">
                <div className={`flex-1 h-px transition-colors ${idx === 0 ? "invisible" : isPast || isCurrent ? "bg-[#002f93]" : "bg-slate-200"}`} />
                <div
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all ${
                    isCurrent
                      ? "ring-2 ring-offset-1"
                      : isPast
                      ? "opacity-60"
                      : "bg-slate-200"
                  }`}
                  style={color ? { backgroundColor: color } : undefined}
                />
                <div className={`flex-1 h-px transition-colors ${idx === STAGES.length - 1 ? "invisible" : isPast ? "bg-[#002f93]" : "bg-slate-200"}`} />
              </div>
              {/* Label */}
              <span
                className={`text-[9px] text-center leading-tight w-full px-0.5 truncate transition-colors font-medium`}
                style={{ color: isCurrent ? STAGE_COLOR[stage] : isPast ? "#64748B" : "#CBD5E1" }}
              >
                {stage}
              </span>
              {/* Probability */}
              <span
                className="text-[9px] font-bold text-center"
                style={{ color: isCurrent ? STAGE_COLOR[stage] : isPast ? "#94A3B8" : "#E2E8F0" }}
              >
                {probability}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  actionLabel,
  actionIcon,
  children,
}: {
  title: string;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{title}</p>
        {actionLabel && (
          <button className="flex items-center gap-1 text-xs font-semibold text-white bg-slate-900 hover:bg-black px-3 py-1.5 rounded-lg transition-colors">
            {actionIcon ?? <PlusCircle size={11} />}
            {actionLabel}
          </button>
        )}
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

// ─── Closing date display ─────────────────────────────────────────────────────

function formatClosingDate(raw: string): string {
  if (!raw) return "—";
  if (raw.includes("T")) {
    const [datePart, timePart] = raw.split("T");
    const [y, m, d] = datePart.split("-");
    return `${m}/${d}/${y} ; ${timePart.slice(0, 5)}`;
  }
  return raw;
}

function isClosingPast(raw: string): boolean {
  if (!raw) return false;
  return new Date(raw) < new Date();
}

// ─── Stage history table ──────────────────────────────────────────────────────

function StageHistoryTable({ opp }: { opp: Opportunity }) {
  const now = new Date();
  const modTime = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}/${String(now.getFullYear()).slice(2)} ; ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {["Stage", "Amount", "Probability", "Closing Date", "Stage Duration", "Modified Time", "Modified By"].map((h) => (
              <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400 pb-2.5 pr-4 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="pt-3 pr-4 text-sm font-medium text-slate-800 whitespace-nowrap">{opp.opportunityStage}</td>
            <td className="pt-3 pr-4 text-sm text-slate-500">{opp.amount || "—"}</td>
            <td className="pt-3 pr-4 text-sm text-slate-500">{probabilityForStage(opp.opportunityStage)}</td>
            <td className="pt-3 pr-4 text-sm text-slate-500 whitespace-nowrap">{formatClosingDate(opp.closingDate)}</td>
            <td className="pt-3 pr-4 text-sm text-slate-500">—</td>
            <td className="pt-3 pr-4 text-sm text-slate-500 whitespace-nowrap">{modTime}</td>
            <td className="pt-3 pr-4 text-sm text-slate-500">{opp.assignedTo}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─── Contact roles table ──────────────────────────────────────────────────────

function ContactRolesTable({ opp }: { opp: Opportunity }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {["Contact Name", "Account Name", "Phone", "Email", "Role Name"].map((h) => (
              <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400 pb-2.5 pr-4 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="pt-3 pr-4 text-sm font-medium text-[#002f93] hover:underline cursor-pointer">{opp.contactName}</td>
            <td className="pt-3 pr-4 text-sm text-slate-700">{opp.accountName}</td>
            <td className="pt-3 pr-4 text-sm text-slate-500">{opp.contactPhone || "—"}</td>
            <td className="pt-3 pr-4 text-sm text-slate-500">{opp.contactEmail || "—"}</td>
            <td className="pt-3 pr-4 text-sm text-slate-400">—</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OpportunityDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const [activeTab,         setActiveTab]         = useState<"overview" | "timeline">("overview");
  const [stage,             setStage]             = useState<OpportunityStage | "">("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noteText,          setNoteText]          = useState("");
  const [savedNotes,        setSavedNotes]        = useState<{ text: string; timestamp: string }[]>([]);
  const [quoteApprovalRequiredOpen, setQuoteApprovalRequiredOpen] = useState(false);

  // Find opportunity: localStorage (persisted by board) → mock data fallback
  const [opp, setOpp] = useState<Opportunity | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored: Opportunity[] = JSON.parse(localStorage.getItem("crmOpportunities") ?? "[]");
        const found = stored.find((o) => o.id === id);
        if (found) return found;
      } catch {
        // ignore
      }
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

  if (!opp) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
        <p className="text-lg font-semibold">Opportunity not found</p>
        <button
          onClick={() => router.push("/opportunity")}
          className="flex items-center gap-2 text-sm text-[#002f93] hover:underline"
        >
          <ArrowLeft size={14} /> Back to Opportunities
        </button>
      </div>
    );
  }

  const currentStage = (stage || opp.opportunityStage) as OpportunityStage;
  const closingIsPast = isClosingPast(opp.closingDate);

  function handleAddNote() {
    if (!noteText.trim()) return;
    const now = new Date();
    const ts = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}/${now.getFullYear()} - ${opp!.assignedTo}`;
    setSavedNotes((prev) => [...prev, { text: noteText.trim(), timestamp: ts }]);
    setNoteText("");
  }

  return (
    <>
    <div className="flex flex-col h-full">

      {/* ── Sticky top bar ── */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push("/opportunity")}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="text-base font-bold text-slate-900 truncate">🏆 {opp.opportunityName}</span>
            <SourceBadge source={opp.leadSource} />
            <PriorityBadge priority={opp.leadPriority} />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-slate-900 text-white hover:bg-black transition-colors">
            <Mail size={15} />
            Send Email
          </button>
          <button
            onClick={() => router.push(`/opportunity/${id}/edit`)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Pencil size={17} />
          </button>

          {/* Delete with confirm */}
          <div className="relative">
            <button
              onClick={() => setShowDeleteConfirm((v) => !v)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <Trash2 size={17} />
            </button>
            {showDeleteConfirm && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDeleteConfirm(false)} />
                <div className="absolute right-0 top-10 z-50 w-64 bg-white rounded-xl border border-slate-200 shadow-lg p-4 space-y-3">
                  <p className="text-sm font-semibold text-slate-900">Delete this opportunity?</p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    This action cannot be undone. All data for{" "}
                    <span className="font-medium text-slate-700">{opp.opportunityName}</span> will be removed.
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</button>
                    <button onClick={() => { setShowDeleteConfirm(false); router.push("/opportunity"); }} className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500 text-white hover:bg-red-600">Delete</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">

          {/* ── Date strip ── */}
          <div className="bg-white rounded-xl border border-slate-200 px-5 py-3">
            <div className="flex items-center gap-8 flex-wrap">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Start Date</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">{opp.createdDate}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Opportunity Owner</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">{opp.assignedTo}</p>
              </div>
              <div className="ml-auto">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Closing</p>
                <p className={`text-sm font-semibold mt-0.5 flex items-center gap-1.5 ${closingIsPast ? "text-red-500" : "text-slate-700"}`}>
                  <Calendar size={13} className="flex-shrink-0" />
                  {formatClosingDate(opp.closingDate)}
                </p>
              </div>
            </div>
          </div>

          {/* ── Stage stepper ── */}
          <div className="bg-white rounded-xl border border-slate-200 px-6 py-5">
            <OpportunityStageStepper currentStage={currentStage} />
          </div>

          {/* ── Tabs + stage dropdown ── */}
          <div className="bg-white rounded-xl border border-slate-200 px-5">
            <div className="flex items-center justify-between gap-3">
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
              <div className="relative">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mr-2">
                  Opportunity Stage
                </label>
                <select
                  value={currentStage}
                  onChange={(e) => {
                    const next = e.target.value as OpportunityStage;
                    if (isAdvanceBlockedWithoutApprovedQuote(opp, next)) {
                      setQuoteApprovalRequiredOpen(true);
                      return;
                    }
                    setStage(next);
                  }}
                  className="appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-2.5 pr-7 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#002f93] cursor-pointer"
                >
                  {STAGES.map(({ stage: s }) => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">▾</span>
              </div>
            </div>
          </div>

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <div className="space-y-4">

              {/* CONTACT PERSON */}
              <Section title="Contact Person">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" fill="currentColor" opacity="0.6" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900">{opp.contactName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{opp.accountName}</p>
                    <div className="mt-2 space-y-1.5">
                      {opp.contactEmail && (
                        <div className="flex items-center gap-2">
                          <Mail size={13} className="text-slate-400 flex-shrink-0" />
                          <a href={`mailto:${opp.contactEmail}`} className="text-sm text-[#002f93] hover:underline">{opp.contactEmail}</a>
                        </div>
                      )}
                      {opp.contactPhone && (
                        <div className="flex items-center gap-2">
                          <Phone size={13} className="text-slate-400 flex-shrink-0" />
                          <span className="text-sm text-slate-700">{opp.contactPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Section>

              {/* OPPORTUNITY INFORMATION */}
              <Section title="Opportunity Information">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <Cell label="Opportunity ID"     value={opp.opportunityRef} />
                  <Cell label="Opportunity Owner"  value={opp.assignedTo} />
                  <Cell
                    label="Closing Date"
                    value={`📅 ${formatClosingDate(opp.closingDate)}`}
                    highlight={closingIsPast}
                  />
                  <Cell label="Opportunity Name"   value={opp.opportunityName} />
                  <Cell label="Expected Revenue"   value={opp.expectedRevenue ? `💰 ${opp.expectedRevenue}` : undefined} />
                  <Cell label="Account Name"        value={opp.accountName} />
                  <Cell label="Amount"              value={opp.amount} />
                  <Cell label="Contact Name"        value={opp.contactName} />
                  <Cell label="Lead Source"         value={opp.leadSource} />
                  <Cell label="Pipeline"            value={opp.pipeline} />
                  <Cell label="Probability"         value={probabilityForStage(currentStage)} />
                  <Cell label="Business Type"       value={opp.businessType} />
                  <Cell label="Campaign Source"     value={opp.campaignSource || "—"} />
                  <Cell label="Lead Priority"       value={opp.leadPriority} />
                  <Cell label="Created Date"        value={opp.createdDate} />
                </div>
              </Section>

              {/* DESCRIPTION */}
              {(opp.description || opp.note) && (
                <Section title="Description">
                  <p className="text-sm text-slate-700 leading-relaxed">{opp.description || opp.note}</p>
                </Section>
              )}

              {/* NOTES (existing) */}
              <Section title="Notes" actionLabel="Add new">
                {opp.note || savedNotes.length > 0 ? (
                  <div className="space-y-3">
                    {opp.note && (
                      <div className="rounded-lg bg-amber-50 border border-amber-100 px-4 py-3">
                        <p className="text-sm text-slate-800 leading-relaxed">{opp.note}</p>
                        <p className="text-[11px] text-slate-400 mt-1.5">Note added: {opp.createdDate} - {opp.assignedTo}</p>
                      </div>
                    )}
                    {savedNotes.map((n, i) => (
                      <div key={i} className="rounded-lg bg-amber-50 border border-amber-100 px-4 py-3">
                        <p className="text-sm text-slate-800 leading-relaxed">{n.text}</p>
                        <p className="text-[11px] text-slate-400 mt-1.5">Note added: {n.timestamp}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">No notes yet.</p>
                )}
              </Section>

              {/* ATTACHMENTS */}
              <Section title="Attachments" actionLabel="Add new">
                <p className="text-sm text-slate-400 italic">No attachments.</p>
              </Section>

              {/* STAGE HISTORY */}
              <Section title="Stage History">
                <StageHistoryTable opp={opp} />
              </Section>

              {/* NOTE (add textarea) */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Note</p>
                </div>
                <div className="px-5 py-4 space-y-3">
                  <textarea
                    rows={3}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add a note..."
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#002f93] placeholder:text-slate-400 leading-relaxed"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-black transition-colors"
                  >
                    Save Note
                  </button>
                </div>
              </div>

              {/* PRODUCTS IN */}
              <Section title="Products In" actionLabel="Add new">
                <p className="text-sm text-slate-400 italic">No products added.</p>
              </Section>

              {/* ROOTS */}
              <Section title="Roots" actionLabel="Add one">
                <p className="text-sm text-slate-400 italic">No roots linked.</p>
              </Section>

              {/* SALES ORDERS */}
              <Section title="Sales Orders" actionLabel="Add one">
                <p className="text-sm text-slate-400 italic">No sales orders.</p>
              </Section>

              {/* EMAILS */}
              <Section title="Emails" actionLabel="Compose Email" actionIcon={<Mail size={11} />}>
                <p className="text-sm text-slate-400 italic">No emails logged.</p>
              </Section>

              {/* CONTACT ROLES */}
              <Section title="Contact Roles" actionLabel="Add Contact" actionIcon={<PlusCircle size={11} />}>
                <ContactRolesTable opp={opp} />
              </Section>

              {/* INVOICES */}
              <Section title="Invoices" actionLabel="Add Invoice">
                <p className="text-sm text-slate-400 italic">No invoices linked.</p>
              </Section>

            </div>
          )}

          {/* ── TIMELINE ── */}
          {activeTab === "timeline" && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Activity History</p>
              </div>
              <div className="px-5 py-4">
                {opp.activities.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">No activity recorded.</p>
                ) : (
                  <div>
                    {opp.activities.map((event, idx) => {
                      const dotColors: Record<string, string> = {
                        email: "bg-[#002f93]", call: "bg-emerald-500",
                        note: "bg-amber-400",  created: "bg-violet-500",
                      };
                      const isLast = idx === opp.activities.length - 1;
                      return (
                        <div key={event.id} className="flex gap-3">
                          <div className="flex flex-col items-center pt-0.5">
                            <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${dotColors[event.type] ?? "bg-slate-400"}`} />
                            {!isLast && <div className="w-px flex-1 bg-slate-200 my-1" />}
                          </div>
                          <div className={`flex-1 min-w-0 ${!isLast ? "pb-5" : ""}`}>
                            <p className="text-sm font-semibold text-slate-900 leading-snug">{event.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{event.description}</p>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mt-1">{event.timestamp}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="h-4" />
        </div>
      </div>
    </div>

    <QuoteApprovalRequiredDialog
      open={quoteApprovalRequiredOpen}
      onClose={() => setQuoteApprovalRequiredOpen(false)}
    />
    </>
  );
}
