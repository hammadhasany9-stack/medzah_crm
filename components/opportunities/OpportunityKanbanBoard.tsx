"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { Inbox, X } from "lucide-react";
import { Opportunity, OpportunityStage, QuoteData, QuoteRecord } from "@/lib/types";
import { isAdvanceBlockedWithoutApprovedQuote } from "@/lib/opportunity-stage-guards";
import { QuoteApprovalRequiredDialog } from "@/components/opportunities/QuoteApprovalRequiredDialog";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

/** Pushes the current quoteData onto quoteHistory before replacing it. */
function archiveCurrentQuote(opp: Opportunity): QuoteRecord[] {
  if (!opp.quoteData) return opp.quoteHistory ?? [];
  const record: QuoteRecord = {
    id: generateId(),
    quoteData: opp.quoteData,
    status: opp.quoteStatus ?? "none",
    rejectionReason: opp.quoteRejectionReason,
    archivedAt: new Date().toISOString(),
  };
  return [...(opp.quoteHistory ?? []), record];
}
import { OpportunityCard } from "./OpportunityCard";
import { OpportunityStageChangeModal } from "./OpportunityStageChangeModal";
import { NegotiationStageChangeModal } from "./NegotiationStageChangeModal";
import { ClosedWonModal } from "./ClosedWonModal";
import { ClosedLostModal } from "./ClosedLostModal";

// ─── Column config ────────────────────────────────────────────────────────────

interface OppColumn {
  id: OpportunityStage;
  label: string;
  percentage?: string;
  accentColor: string;
  emptyText: string;
}

const COLUMNS: OppColumn[] = [
  { id: "Qualified",            label: "Qualified",            percentage: "10%",  accentColor: "#8B5CF6", emptyText: "No opportunities qualified" },
  { id: "Proposal/Price Quote", label: "Proposal/Price Quote", percentage: "75%",  accentColor: "#3B82F6", emptyText: "No opportunities in proposal/price quote" },
  { id: "Negotiation/Review",   label: "Negotiation/Review",   percentage: "90%",  accentColor: "#F59E0B", emptyText: "No opportunities in negotiation/review" },
  { id: "Closed Won",           label: "Closed Won",           percentage: "100%", accentColor: "#10B981", emptyText: "No opportunities closed won" },
  { id: "Closed Lost",          label: "Closed Lost",                              accentColor: "#EF4444", emptyText: "No opportunities closed lost" },
];

// ─── Draggable card wrapper ───────────────────────────────────────────────────

function DraggableOpportunityCard({
  opportunity,
  onClick,
  onCreateQuote,
}: {
  opportunity: Opportunity;
  onClick: (opp: Opportunity) => void;
  onCreateQuote?: (e: React.MouseEvent, opp: Opportunity) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: opportunity.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`touch-none transition-opacity duration-150 ${isDragging ? "opacity-40" : "opacity-100"}`}
    >
      <OpportunityCard
        opportunity={opportunity}
        onClick={onClick}
        onCreateQuote={onCreateQuote}
      />
    </div>
  );
}

// ─── Column ───────────────────────────────────────────────────────────────────

function OppKanbanColumn({
  column,
  opportunities,
  onCardClick,
  onCreateQuote,
}: {
  column: OppColumn;
  opportunities: Opportunity[];
  onCardClick: (opp: Opportunity) => void;
  onCreateQuote?: (e: React.MouseEvent, opp: Opportunity) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      className="flex-shrink-0 w-[320px] flex flex-col bg-gray-25 rounded-xl border border-slate-200 overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
    >
      {/* Accent strip */}
      <div className="h-0.5 w-full flex-shrink-0" style={{ backgroundColor: column.accentColor }} />

      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[13px] font-semibold text-slate-800 truncate uppercase tracking-wide">
            {column.label}
          </span>
          {column.percentage && (
            <span className="text-[11px] font-semibold text-slate-400">{column.percentage}</span>
          )}
        </div>
        <span
          className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold text-white flex-shrink-0"
          style={{ backgroundColor: column.accentColor }}
        >
          {opportunities.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-2.5 space-y-2 overflow-y-auto transition-colors duration-150
          min-h-[180px] max-h-[calc(100vh-268px)]
          ${isOver ? "bg-slate-50 ring-2 ring-inset ring-slate-300 rounded-b-xl" : "bg-transparent"}`}
      >
        {opportunities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 gap-2 text-center">
            <Inbox size={24} className={isOver ? "text-slate-400" : "text-slate-200"} />
            <p className={`text-[11px] leading-relaxed px-3 ${isOver ? "text-slate-500" : "text-slate-400"}`}>
              {isOver ? "Drop here" : column.emptyText}
            </p>
          </div>
        ) : (
          opportunities.map((opp) => (
            <DraggableOpportunityCard
              key={opp.id}
              opportunity={opp}
              onClick={onCardClick}
              onCreateQuote={onCreateQuote}
            />
          ))
        )}
      </div>
    </div>
  );
}


// ─── Board ────────────────────────────────────────────────────────────────────

interface OpportunityKanbanBoardProps {
  initialOpportunities: Opportunity[];
  onCardClick: (opp: Opportunity) => void;
  onOpportunitiesChange?: (opps: Opportunity[]) => void;
}

export function OpportunityKanbanBoard({
  initialOpportunities,
  onCardClick,
  onOpportunitiesChange,
}: OpportunityKanbanBoardProps) {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>(initialOpportunities);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Ref holds the latest committed opportunities so we can fire onOpportunitiesChange
  // AFTER the state update completes (not inside an updater function).
  const pendingSync = useRef<Opportunity[] | null>(null);
  useEffect(() => {
    if (pendingSync.current !== null) {
      onOpportunitiesChange?.(pendingSync.current);
      pendingSync.current = null;
    }
  }, [opportunities, onOpportunitiesChange]);

  // Stage-change modal state (Qualified → Proposal, or drag-triggered)
  const [pendingMove, setPendingMove] = useState<{ oppId: string; targetStage: OpportunityStage } | null>(null);

  // Recreate-quote modal state (Create Quote button on a rejected card)
  const [recreateQuoteOppId, setRecreateQuoteOppId] = useState<string | null>(null);

  // Negotiation modal state
  const [pendingNegotiationMove, setPendingNegotiationMove] = useState<{ oppId: string } | null>(null);

  // Closed Won modal state
  const [pendingClosedWonMove, setPendingClosedWonMove] = useState<{ oppId: string } | null>(null);

  // Closed Lost modal state
  const [pendingClosedLostMove, setPendingClosedLostMove] = useState<{ oppId: string } | null>(null);

  const [quoteApprovalRequiredOpen, setQuoteApprovalRequiredOpen] = useState(false);

  const activeOpp = opportunities.find((o) => o.id === activeId) ?? null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const oppId = String(active.id);
    const targetStage = String(over.id) as OpportunityStage;

    if (!COLUMNS.find((c) => c.id === targetStage)) return;

    const opp = opportunities.find((o) => o.id === oppId);
    if (!opp || opp.opportunityStage === targetStage) return;

    if (isAdvanceBlockedWithoutApprovedQuote(opp, targetStage)) {
      setQuoteApprovalRequiredOpen(true);
      return;
    }

    // Rule 1: Qualified → Proposal requires filling the quote modal
    if (opp.opportunityStage === "Qualified" && targetStage === "Proposal/Price Quote") {
      setPendingMove({ oppId, targetStage });
      return;
    }

    // Rule 2: Any card → Negotiation/Review always shows the negotiation modal
    if (targetStage === "Negotiation/Review") {
      setPendingNegotiationMove({ oppId });
      return;
    }

    // Rule 3: Any card → Closed Won shows the Closed Won congratulations modal
    if (targetStage === "Closed Won") {
      setPendingClosedWonMove({ oppId });
      return;
    }

    // Rule 4: Any card → Closed Lost shows the Closed Lost modal
    if (targetStage === "Closed Lost") {
      setPendingClosedLostMove({ oppId });
      return;
    }

    applyMove(oppId, targetStage);
  }

  function applyMove(oppId: string, targetStage: OpportunityStage, extra?: Partial<Opportunity>) {
    setOpportunities((prev) => {
      const next = prev.map((o) =>
        o.id === oppId ? { ...o, opportunityStage: targetStage, ...extra } : o
      );
      pendingSync.current = next;
      return next;
    });
  }

  function handleModalSave(quoteData: QuoteData) {
    if (!pendingMove) return;
    const opp = opportunities.find((o) => o.id === pendingMove.oppId);
    applyMove(pendingMove.oppId, pendingMove.targetStage, {
      quoteStatus: "pending",
      quoteData,
      quoteRejectionReason: undefined,
      quoteHistory: opp ? archiveCurrentQuote(opp) : [],
      quoteRevised: false,
      quoteAdjusted: false,
    });
    setPendingMove(null);
  }

  function handleModalCancel() {
    setPendingMove(null);
  }

  function handleNegotiationSave(updates: { amount: string; campaignSource: string; followUpDate: string }) {
    if (!pendingNegotiationMove) return;
    applyMove(pendingNegotiationMove.oppId, "Negotiation/Review", {
      amount: updates.amount,
      campaignSource: updates.campaignSource,
    });
    setPendingNegotiationMove(null);
  }

  function handleNegotiationCancel() {
    setPendingNegotiationMove(null);
  }

  function handleGoToCustomerIntake() {
    if (!pendingClosedWonMove) return;
    applyMove(pendingClosedWonMove.oppId, "Closed Won");
    setPendingClosedWonMove(null);
    router.push("/customer-intake/create");
  }

  function handleSaveAlreadyCustomer() {
    if (!pendingClosedWonMove) return;
    applyMove(pendingClosedWonMove.oppId, "Closed Won");
    setPendingClosedWonMove(null);
    router.push("/contracts/create");
  }

  function handleClosedWonSaveToBoard() {
    if (!pendingClosedWonMove) return;
    applyMove(pendingClosedWonMove.oppId, "Closed Won");
    setPendingClosedWonMove(null);
  }

  function handleClosedWonCancel() {
    setPendingClosedWonMove(null);
  }

  function handleClosedLostClose() {
    if (!pendingClosedLostMove) return;
    applyMove(pendingClosedLostMove.oppId, "Closed Lost");
    setPendingClosedLostMove(null);
  }

  function handleClosedLostCancel() {
    setPendingClosedLostMove(null);
  }

  // Recreate-quote handlers (Create Quote button on rejected Proposal cards or Negotiation cards)
  function handleCreateQuoteClick(_e: React.MouseEvent, opp: Opportunity) {
    setRecreateQuoteOppId(opp.id);
  }

  function handleRecreateQuoteSave(quoteData: QuoteData) {
    if (!recreateQuoteOppId) return;
    setOpportunities((prev) => {
      const next = prev.map((o) =>
        o.id === recreateQuoteOppId
          ? {
              ...o,
              quoteStatus: "pending" as const,
              quoteData,
              quoteRejectionReason: undefined,
              quoteHistory: archiveCurrentQuote(o),
              quoteRevised: o.opportunityStage === "Negotiation/Review",
              quoteAdjusted: false,
            }
          : o
      );
      pendingSync.current = next;
      return next;
    });
    setRecreateQuoteOppId(null);
  }

  function handleRecreateQuoteCancel() {
    setRecreateQuoteOppId(null);
  }

  const pendingOpp = pendingMove ? opportunities.find((o) => o.id === pendingMove.oppId) ?? null : null;
  const pendingNegotiationOpp = pendingNegotiationMove
    ? opportunities.find((o) => o.id === pendingNegotiationMove.oppId) ?? null
    : null;
  const pendingClosedWonOpp = pendingClosedWonMove
    ? opportunities.find((o) => o.id === pendingClosedWonMove.oppId) ?? null
    : null;
  const pendingClosedLostOpp = pendingClosedLostMove
    ? opportunities.find((o) => o.id === pendingClosedLostMove.oppId) ?? null
    : null;

  const recreateQuoteOpp = recreateQuoteOppId
    ? opportunities.find((o) => o.id === recreateQuoteOppId) ?? null
    : null;

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((column) => (
            <OppKanbanColumn
              key={column.id}
              column={column}
              opportunities={opportunities.filter((o) => o.opportunityStage === column.id)}
              onCardClick={onCardClick}
              onCreateQuote={handleCreateQuoteClick}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
          {activeOpp ? (
            <div className="rotate-1 scale-105 shadow-2xl rounded-xl opacity-95">
              <OpportunityCard opportunity={activeOpp} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Stage change modal (drag Qualified → Proposal) */}
      {pendingOpp && (
        <OpportunityStageChangeModal
          opportunity={pendingOpp}
          onSave={handleModalSave}
          onCancel={handleModalCancel}
        />
      )}

      {/* Recreate-quote modal (Create Quote button on a rejected card) */}
      {recreateQuoteOpp && (
        <OpportunityStageChangeModal
          opportunity={recreateQuoteOpp}
          onSave={handleRecreateQuoteSave}
          onCancel={handleRecreateQuoteCancel}
        />
      )}

      {/* Negotiation stage modal */}
      {pendingNegotiationOpp && (
        <NegotiationStageChangeModal
          opportunity={pendingNegotiationOpp}
          onSave={handleNegotiationSave}
          onCancel={handleNegotiationCancel}
        />
      )}

      {/* Closed Won modal */}
      {pendingClosedWonOpp && (
        <ClosedWonModal
          opportunity={pendingClosedWonOpp}
          onSaveToBoard={handleClosedWonSaveToBoard}
          onGoToCustomerIntake={handleGoToCustomerIntake}
          onSaveAlreadyCustomer={handleSaveAlreadyCustomer}
          onCancel={handleClosedWonCancel}
        />
      )}

      {/* Closed Lost modal */}
      {pendingClosedLostOpp && (
        <ClosedLostModal
          opportunity={pendingClosedLostOpp}
          onClose={handleClosedLostClose}
        />
      )}

      <QuoteApprovalRequiredDialog
        open={quoteApprovalRequiredOpen}
        onClose={() => setQuoteApprovalRequiredOpen(false)}
      />

    </>
  );
}
