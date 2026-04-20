"use client";

import { useState, useMemo } from "react";
import { Opportunity, QuoteStatus } from "@/lib/types";
import { useCRMShell } from "@/components/shell/CRMShellContext";
import { QuoteFilterBar, TeamMember } from "@/components/quotes/QuoteFilterBar";
import { QuoteKanbanBoard } from "@/components/quotes/QuoteKanbanBoard";
import { QuoteSidePanel } from "@/components/quotes/QuoteSidePanel";
import { QuoteApprovalModal } from "@/components/quotes/QuoteApprovalModal";
import { QuoteAdjustModal } from "@/components/quotes/QuoteAdjustModal";
import { QuoteRejectModal } from "@/components/quotes/QuoteRejectModal";

// Must match the CURRENT_USER in the Opportunity page so "Me" filters are consistent
const CURRENT_USER = "Kevin Calamari";

// ─── Date cutoff helper ───────────────────────────────────────────────────────

function getDateCutoff(label: string): Date | null {
  const now = new Date();
  switch (label) {
    case "Today":        { const d = new Date(now); d.setHours(0, 0, 0, 0); return d; }
    case "Yesterday":    { const d = new Date(now); d.setDate(d.getDate() - 1); d.setHours(0, 0, 0, 0); return d; }
    case "Last 7 Days":  { const d = new Date(now); d.setDate(d.getDate() - 7); return d; }
    case "Last 30 Days": { const d = new Date(now); d.setDate(d.getDate() - 30); return d; }
    case "Last 90 Days": { const d = new Date(now); d.setDate(d.getDate() - 90); return d; }
    case "This Month":   return new Date(now.getFullYear(), now.getMonth(), 1);
    case "Last Month":   return new Date(now.getFullYear(), now.getMonth() - 1, 1);
    case "This Quarter": return new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    case "This Year":    return new Date(now.getFullYear(), 0, 1);
    default:             return null;
  }
}

export default function QuotesPage() {
  const { ownerTab, opportunities: allOpportunities, setOpportunities } = useCRMShell();

  const [statusFilters,  setStatusFilters]  = useState<string[]>([]);
  const [ownerFilters,   setOwnerFilters]   = useState<string[]>([]);
  const [dateFilters,    setDateFilters]    = useState<string[]>(["Last 30 Days"]);
  const [searchQuery,    setSearchQuery]    = useState("");
  const [teamMember,     setTeamMember]     = useState<TeamMember>("All");
  const [selectedOpp,      setSelectedOpp]      = useState<Opportunity | null>(null);
  const [approvalModalOpp, setApprovalModalOpp] = useState<Opportunity | null>(null);
  const [adjustModalOpp,   setAdjustModalOpp]   = useState<Opportunity | null>(null);
  const [rejectModalOpp,   setRejectModalOpp]   = useState<Opportunity | null>(null);

  // Only opportunities that have quote data participate in the Quotes board
  const quotedOpportunities = useMemo(
    () => allOpportunities.filter((o) => !!o.quoteData),
    [allOpportunities]
  );

  // ─── Toggle helpers ─────────────────────────────────────────────────────────

  function toggle(setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) {
    setter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function toggleSingle(setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) {
    setter((prev) => (prev[0] === value ? [] : [value]));
  }

  function clearAllFilters() {
    setStatusFilters([]);
    setOwnerFilters([]);
    setDateFilters([]);
  }

  // ─── View-level filter — drives stats bar ────────────────────────────────
  // ownerTab "my-leads" narrows to the current user only when the "Me" owner
  // filter is also active; otherwise always show the full quoted list so newly
  // created quotes (from either user) are immediately visible.
  const viewFiltered = useMemo(() => {
    if (ownerTab === "my-leads" && ownerFilters.includes("Me")) {
      return quotedOpportunities.filter((o) => o.assignedTo === CURRENT_USER);
    }
    return quotedOpportunities;
  }, [quotedOpportunities, ownerTab, ownerFilters]);

  // ─── Deep filter — what the kanban renders ────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...viewFiltered];

    if (ownerFilters.length > 0 && !ownerFilters.includes("All")) {
      list = list.filter((o) => {
        if (ownerFilters.includes("Me")) return o.assignedTo === CURRENT_USER;
        return ownerFilters.some((owner) => o.assignedTo === owner);
      });
    }

    if (statusFilters.length > 0) {
      const lowerStatuses = statusFilters.map((s) => s.toLowerCase());
      list = list.filter((o) => lowerStatuses.includes(o.quoteStatus ?? ""));
    }

    if (dateFilters.length > 0) {
      const cutoff = getDateCutoff(dateFilters[0]);
      if (cutoff) {
        list = list.filter((o) => {
          if (!o.quoteData?.validDate) return true;
          return new Date(o.quoteData.validDate) >= cutoff;
        });
      }
    }

    if (teamMember !== "All") {
      list = list.filter((o) =>
        o.quoteData?.teamForApproval?.some((m) =>
          m.toLowerCase().startsWith(teamMember.toLowerCase())
        )
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((o) =>
        o.quoteData?.subject?.toLowerCase().includes(q) ||
        o.quoteData?.contactName?.toLowerCase().includes(q) ||
        o.quoteData?.accountName?.toLowerCase().includes(q) ||
        o.opportunityName?.toLowerCase().includes(q) ||
        (o.quoteData?.quoteId?.toLowerCase().includes(q) ?? false)
      );
    }

    return list;
  }, [viewFiltered, ownerFilters, statusFilters, dateFilters, teamMember, searchQuery]);

  // ─── Actions ──────────────────────────────────────────────────────────────

  function updateStatus(opp: Opportunity, status: QuoteStatus) {
    setOpportunities((prev) =>
      prev.map((o) =>
        o.id === opp.id
          ? { ...o, quoteStatus: status, ...(status !== "pending" ? { quoteRevised: false } : {}) }
          : o
      )
    );
    setSelectedOpp((prev) =>
      prev?.id === opp.id
        ? { ...prev, quoteStatus: status, ...(status !== "pending" ? { quoteRevised: false } : {}) }
        : prev
    );
  }

  function handleApprovalRequest(opp: Opportunity) {
    setApprovalModalOpp(opp);
  }

  function handleApprovalConfirm(opp: Opportunity) {
    setOpportunities((prev) =>
      prev.map((o) =>
        o.id === opp.id ? { ...o, quoteStatus: "approved" as const, quoteRevised: false } : o
      )
    );
    setSelectedOpp((prev) =>
      prev?.id === opp.id ? { ...prev, quoteStatus: "approved" as const, quoteRevised: false } : prev
    );
    setApprovalModalOpp(null);
  }

  function handleAdjustRequest(opp: Opportunity) {
    setAdjustModalOpp(opp);
  }

  function handleRejectRequest(opp: Opportunity) {
    setRejectModalOpp(opp);
  }

  function handleRejectSubmit(opp: Opportunity, reason: string) {
    setOpportunities((prev) =>
      prev.map((o) =>
        o.id === opp.id
          ? { ...o, quoteStatus: "rejected" as const, quoteRejectionReason: reason }
          : o
      )
    );
    setSelectedOpp((prev) =>
      prev?.id === opp.id
        ? { ...prev, quoteStatus: "rejected" as const, quoteRejectionReason: reason }
        : prev
    );
    setRejectModalOpp(null);
  }

  function handleAdjustSubmit(updatedOpp: Opportunity) {
    setOpportunities((prev) =>
      prev.map((o) => (o.id === updatedOpp.id ? updatedOpp : o))
    );
    setSelectedOpp((prev) =>
      prev?.id === updatedOpp.id ? updatedOpp : prev
    );
    setAdjustModalOpp(null);
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="p-6 flex flex-col gap-5 min-h-full">
      <QuoteFilterBar
        viewFilteredOpportunities={viewFiltered}
        statusFilters={statusFilters}
        onStatusToggle={(v) => toggle(setStatusFilters, v)}
        ownerFilters={ownerFilters}
        onOwnerToggle={(v) => toggleSingle(setOwnerFilters, v)}
        dateFilters={dateFilters}
        onDateToggle={(v) => toggleSingle(setDateFilters, v)}
        onClearFilters={clearAllFilters}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        teamMember={teamMember}
        onTeamMemberChange={setTeamMember}
      />

      <QuoteKanbanBoard
        opportunities={filtered}
        onCardClick={(opp) => setSelectedOpp(opp)}
        onStatusChange={(opp, status) => updateStatus(opp, status)}
        onApprovalRequest={handleApprovalRequest}
      />

      <QuoteSidePanel
        opportunity={selectedOpp}
        onClose={() => setSelectedOpp(null)}
        onApprove={handleApprovalRequest}
        onAdjust={handleAdjustRequest}
        onReject={handleRejectRequest}
      />

      {approvalModalOpp && (
        <QuoteApprovalModal
          opportunity={approvalModalOpp}
          onApprove={handleApprovalConfirm}
          onCancel={() => setApprovalModalOpp(null)}
        />
      )}

      {adjustModalOpp && (
        <QuoteAdjustModal
          opportunity={adjustModalOpp}
          onSubmit={handleAdjustSubmit}
          onCancel={() => setAdjustModalOpp(null)}
        />
      )}

      {rejectModalOpp && (
        <QuoteRejectModal
          opportunity={rejectModalOpp}
          onSubmit={handleRejectSubmit}
          onCancel={() => setRejectModalOpp(null)}
        />
      )}
    </div>
  );
}
