"use client";

import { useState } from "react";
import { Opportunity, QuoteData, QuoteRecord } from "@/lib/types";
import { useCRMShell } from "@/components/shell/CRMShellContext";
import { OpportunitySummaryBar } from "@/components/opportunities/OpportunitySummaryBar";
import { OpportunityFilterBar } from "@/components/opportunities/OpportunityFilterBar";
import { OpportunityKanbanBoard } from "@/components/opportunities/OpportunityKanbanBoard";
import { OpportunityDetailPanel } from "@/components/opportunities/OpportunityDetailPanel";
import { OpportunityStageChangeModal } from "@/components/opportunities/OpportunityStageChangeModal";

const CURRENT_USER = "Kevin Calamari";

function generateId() { return Math.random().toString(36).slice(2, 9); }

function archiveCurrentQuote(opp: Opportunity): QuoteRecord[] {
  if (!opp.quoteData) return opp.quoteHistory ?? [];
  return [...(opp.quoteHistory ?? []), {
    id: generateId(),
    quoteData: opp.quoteData,
    status: opp.quoteStatus ?? "none",
    rejectionReason: opp.quoteRejectionReason,
    archivedAt: new Date().toISOString(),
  }];
}

export default function OpportunityPage() {
  const { ownerTab, opportunities, setOpportunities } = useCRMShell();

  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);
  const [panelCreateQuoteOpp, setPanelCreateQuoteOpp] = useState<Opportunity | null>(null);

  const selectedOpportunity = selectedOppId
    ? opportunities.find((o) => o.id === selectedOppId) ?? null
    : null;

  const visibleOpportunities =
    ownerTab === "my-leads"
      ? opportunities.filter((o) => o.assignedTo === CURRENT_USER)
      : opportunities;

  // Merges board-level changes (subset) back into the full shared list
  function handleBoardChange(updated: Opportunity[]) {
    setOpportunities((prev) => {
      const updatedIds = new Set(updated.map((o) => o.id));
      return [...prev.filter((o) => !updatedIds.has(o.id)), ...updated];
    });
  }

  return (
    <div className="flex flex-col gap-5 p-6 min-h-full">
      <OpportunitySummaryBar opportunities={visibleOpportunities} />

      <OpportunityFilterBar />

      <OpportunityKanbanBoard
        key={ownerTab}
        initialOpportunities={visibleOpportunities}
        onCardClick={(opp) => setSelectedOppId(opp.id)}
        onOpportunitiesChange={handleBoardChange}
      />


      <OpportunityDetailPanel
        opportunity={selectedOpportunity}
        onClose={() => setSelectedOppId(null)}
        onCreateQuote={(opp) => setPanelCreateQuoteOpp(opp)}
      />

      {/* Create New Quote modal — triggered from the detail panel */}
      {panelCreateQuoteOpp && (
        <OpportunityStageChangeModal
          opportunity={panelCreateQuoteOpp}
          onSave={(quoteData: QuoteData) => {
            setOpportunities((prev) =>
              prev.map((o) =>
                o.id === panelCreateQuoteOpp.id
                  ? {
                      ...o,
                      quoteStatus: "pending" as const,
                      quoteData,
                      quoteRejectionReason: undefined,
                      quoteHistory: archiveCurrentQuote(o),
                      quoteRevised: panelCreateQuoteOpp.opportunityStage === "Negotiation/Review",
                      quoteAdjusted: false,
                    }
                  : o
              )
            );
            setPanelCreateQuoteOpp(null);
          }}
          onCancel={() => setPanelCreateQuoteOpp(null)}
        />
      )}
    </div>
  );
}
