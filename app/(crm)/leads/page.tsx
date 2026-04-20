"use client";

import { useState, useEffect, useRef } from "react";
import { SmartSummaryBar } from "@/components/leads/SmartSummaryBar";
import { LeadsFilterBar, LeadsViewMode } from "@/components/leads/LeadsFilterBar";
import { LeadsKanbanBoard, type LeadBoardActions } from "@/components/leads/LeadsKanbanBoard";
import { LeadDetailPanel } from "@/components/leads/LeadDetailPanel";
import { SourceView } from "@/components/leads/SourceView";
import { AddSourceModal } from "@/components/leads/AddSourceModal";
import { INITIAL_SOURCES } from "@/lib/mock-data/sources";
import { Lead, Opportunity, SourceColumn, AllocationRecord } from "@/lib/types";
import { useCRMShell } from "@/components/shell/CRMShellContext";

const CURRENT_USER = "Kevin Calamari";

export default function LeadsPage() {
  const { ownerTab, leads, setLeads, setAllocations, opportunities, setOpportunities } = useCRMShell();

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [viewMode, setViewMode]             = useState<LeadsViewMode>("sales");
  const [sources, setSources]               = useState<SourceColumn[]>(INITIAL_SOURCES);
  const [showAddSource, setShowAddSource]   = useState(false);

  const boardActionsRef = useRef<LeadBoardActions | null>(null);

  const selectedLead = selectedLeadId
    ? leads.find((l) => l.id === selectedLeadId) ?? null
    : null;

  const visibleLeads = ownerTab === "my-leads"
    ? leads.filter((l) => l.assignedTo === CURRENT_USER)
    : leads;

  function handleAddSource(name: string, color: string, iconName: string) {
    const id = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    setSources((prev) => [...prev, { id, label: name, badgeColor: color, iconName }]);
    setShowAddSource(false);
  }

  function handleDeleteSource(sourceId: string) {
    setSources((prev) => prev.filter((s) => s.id !== sourceId));
  }

  // Absorb pending lead from create-lead flow (sessionStorage bridge)
  useEffect(() => {
    const raw = sessionStorage.getItem("pendingLead");
    if (raw) {
      try {
        const lead: Lead = JSON.parse(raw);
        setLeads((prev) => [lead, ...prev]);
      } catch {
        // ignore malformed data
      }
      sessionStorage.removeItem("pendingLead");
    }
  }, [setLeads]);

  function handleCreateLead(lead: Lead) {
    setLeads((prev) => [lead, ...prev]);
  }

  // Directly write opportunity into context (no sessionStorage bridge)
  function handleOpportunityCreated(opp: Opportunity, leadId: string) {
    setOpportunities((prev) => {
      const exists = prev.some((o) => o.id === opp.id);
      return exists ? prev : [opp, ...prev];
    });
    // Save opportunityId back to the lead
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, opportunityId: opp.id } : l))
    );
  }

  function handleOpportunityUpdated(opp: Opportunity) {
    setOpportunities((prev) => prev.map((o) => (o.id === opp.id ? opp : o)));
  }

  function handleAllocationCreated(record: AllocationRecord, leadId: string) {
    setAllocations((prev) => {
      const exists = prev.some((a) => a.id === record.id);
      const next = exists ? prev : [record, ...prev];
      // Write directly to localStorage immediately so the allocation page
      // always sees the latest data even before the context effect flushes
      try {
        localStorage.setItem("medzah_crm_allocations_v2", JSON.stringify(next));
      } catch { /* ignore */ }
      return next;
    });
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, allocationId: record.id } : l))
    );
  }

  return (
    <div className="flex flex-col gap-5 p-6 min-h-full">
      <SmartSummaryBar leads={visibleLeads} />

      <LeadsFilterBar activeView={viewMode} onViewChange={setViewMode} />

      {/* Kanban chrome hidden in Source view; board component stays visible for modals (not under display:none) */}
      <LeadsKanbanBoard
        key={ownerTab}
        initialLeads={visibleLeads}
        opportunities={opportunities}
        boardActionsRef={boardActionsRef}
        boardChromeHidden={viewMode !== "sales"}
        onLeadClick={(lead) => setSelectedLeadId(lead.id)}
        onLeadsChange={(updated) =>
          setLeads((prev) => {
            const updatedIds = new Set(updated.map((l) => l.id));
            return [...prev.filter((l) => !updatedIds.has(l.id)), ...updated];
          })
        }
        onOpportunityCreated={handleOpportunityCreated}
        onOpportunityUpdated={handleOpportunityUpdated}
        onAllocationCreated={handleAllocationCreated}
      />
      <div className={viewMode === "source" ? "block" : "hidden"} aria-hidden={viewMode !== "source"}>
        <SourceView
          leads={visibleLeads}
          sources={sources}
          onLeadClick={(lead) => setSelectedLeadId(lead.id)}
          onAddSource={() => setShowAddSource(true)}
          onDeleteSource={handleDeleteSource}
          onCreateLead={handleCreateLead}
        />
      </div>

      <LeadDetailPanel
        lead={selectedLead}
        onClose={() => setSelectedLeadId(null)}
        onStatusChangeRequest={(leadId, targetStatus) =>
          boardActionsRef.current?.requestStatusTransition(leadId, targetStatus)
        }
        onPriorityChange={(leadId, priority) =>
          boardActionsRef.current?.applyPriority(leadId, priority)
        }
      />

      {showAddSource && (
        <AddSourceModal
          onSave={handleAddSource}
          onCancel={() => setShowAddSource(false)}
        />
      )}
    </div>
  );
}
