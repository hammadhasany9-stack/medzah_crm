"use client";

import { useState, useMemo } from "react";
import { Opportunity } from "@/lib/types";
import { useCRMShell } from "@/components/shell/CRMShellContext";
import { useTenant } from "@/components/providers/TenantProvider";
import { QuoteFilterBar, type QuoteTeamQuickTab } from "@/components/quotes/QuoteFilterBar";
import { QuoteTable } from "@/components/quotes/QuoteTable";
import { QuoteKanbanBoard } from "@/components/quotes/QuoteKanbanBoard";
import { QuoteSidePanel } from "@/components/quotes/QuoteSidePanel";
import { opportunityMatchesQuoteStatusFilters } from "@/lib/quotes-display";
import { applyQuoteKanbanDrop, quoteKanbanDroppableId } from "@/lib/quote-kanban-dnd";
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

function opportunityMatchesTeamQuickTab(o: Opportunity, tab: QuoteTeamQuickTab): boolean {
  if (tab === "all") return true;
  const a = (o.assignedTo ?? "").toLowerCase();
  if (tab === "denise") return a.includes("denise");
  if (tab === "walsh") return a.includes("walsh");
  if (tab === "mark") return a.includes("mark");
  return true;
}

export default function QuotesPage() {
  const { tenant } = useTenant();
  const { ownerTab, opportunities: allOpportunities, setOpportunities } = useCRMShell();

  const [statusFilters,  setStatusFilters]  = useState<string[]>([]);
  const [ownerFilters,   setOwnerFilters]   = useState<string[]>([]);
  const [dateFilters,    setDateFilters]    = useState<string[]>(["Last 30 Days"]);
  const [teamQuickTab,   setTeamQuickTab]   = useState<QuoteTeamQuickTab>("all");
  const [searchQuery,    setSearchQuery]    = useState("");
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
    setTeamQuickTab("all");
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

  // ─── Deep filter — table rows ─────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...viewFiltered];

    if (ownerFilters.length > 0 && !ownerFilters.includes("All")) {
      list = list.filter((o) => {
        if (ownerFilters.includes("Me")) return o.assignedTo === CURRENT_USER;
        return ownerFilters.some((owner) => o.assignedTo === owner);
      });
    }

    if (teamQuickTab !== "all") {
      list = list.filter((o) => opportunityMatchesTeamQuickTab(o, teamQuickTab));
    }

    if (statusFilters.length > 0) {
      list = list.filter((o) => opportunityMatchesQuoteStatusFilters(o, statusFilters));
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
  }, [viewFiltered, ownerFilters, teamQuickTab, statusFilters, dateFilters, searchQuery]);

  // ─── Actions ──────────────────────────────────────────────────────────────

  function handleApprovalRequest(opp: Opportunity) {
    setApprovalModalOpp(opp);
  }

  function handleApprovalConfirm(opp: Opportunity) {
    setOpportunities((prev) =>
      prev.map((o) =>
        o.id === opp.id
          ? {
              ...o,
              quoteStatus: "approved" as const,
              quoteRevised: false,
              quoteDecisionBy: CURRENT_USER,
            }
          : o
      )
    );
    setSelectedOpp((prev) =>
      prev?.id === opp.id
        ? { ...prev, quoteStatus: "approved" as const, quoteRevised: false, quoteDecisionBy: CURRENT_USER }
        : prev
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
          ? {
              ...o,
              quoteStatus: "rejected" as const,
              quoteRejectionReason: reason,
              quoteDecisionBy: CURRENT_USER,
            }
          : o
      )
    );
    setSelectedOpp((prev) =>
      prev?.id === opp.id
        ? {
            ...prev,
            quoteStatus: "rejected" as const,
            quoteRejectionReason: reason,
            quoteDecisionBy: CURRENT_USER,
          }
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

  function handleQuoteKanbanDrop(opportunityId: string, dropZoneId: string) {
    const opp = allOpportunities.find((o) => o.id === opportunityId);
    if (!opp) return;

    if (
      dropZoneId === quoteKanbanDroppableId("status", "approvedAdj") &&
      opp.quoteStatus === "pending"
    ) {
      setSelectedOpp(opp);
      if (opp.quoteRevised) {
        setAdjustModalOpp(opp);
      } else {
        setApprovalModalOpp(opp);
      }
      return;
    }

    if (
      dropZoneId === quoteKanbanDroppableId("status", "rejected") &&
      opp.quoteStatus === "pending"
    ) {
      setSelectedOpp(opp);
      setRejectModalOpp(opp);
      return;
    }

    setOpportunities((prev) =>
      prev.map((o) => (o.id === opportunityId ? applyQuoteKanbanDrop(o, dropZoneId) : o))
    );
    setSelectedOpp((prev) =>
      prev?.id === opportunityId ? applyQuoteKanbanDrop(prev, dropZoneId) : prev
    );
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
        teamQuickTab={teamQuickTab}
        onTeamQuickTabChange={setTeamQuickTab}
      />

      {tenant === "amanda" ? (
        <QuoteKanbanBoard
          opportunities={filtered}
          selectedId={selectedOpp?.id ?? null}
          onCardClick={(opp) => setSelectedOpp(opp)}
          onQuoteDrop={handleQuoteKanbanDrop}
        />
      ) : (
        <QuoteTable
          opportunities={filtered}
          selectedId={selectedOpp?.id ?? null}
          onRowClick={(opp) => setSelectedOpp(opp)}
        />
      )}

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
