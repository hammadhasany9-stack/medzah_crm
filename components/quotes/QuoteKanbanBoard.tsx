"use client";

import { useState } from "react";
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
import { Inbox } from "lucide-react";
import { Opportunity, QuoteStatus } from "@/lib/types";
import { QuoteCard } from "./QuoteCard";
import { DraggableQuoteCard } from "./DraggableQuoteCard";

// ─── Column config ────────────────────────────────────────────────────────────

interface QuoteColumn {
  id: QuoteStatus;
  label: string;
  accentColor: string;
  emptyText: string;
}

const COLUMNS: QuoteColumn[] = [
  { id: "pending",  label: "PENDING",            accentColor: "#F59E0B", emptyText: "No pending quotes"  },
  { id: "approved", label: "APPROVED/ADJUSTMENT", accentColor: "#10B981", emptyText: "No quotes approved" },
  { id: "rejected", label: "REJECTED",            accentColor: "#EF4444", emptyText: "No quotes rejected" },
];

// ─── Droppable column ─────────────────────────────────────────────────────────

interface DroppableColumnProps {
  col: QuoteColumn;
  cards: Opportunity[];
  onCardClick: (opp: Opportunity) => void;
}

function DroppableColumn({ col, cards, onCardClick }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });

  return (
    <div
      className="flex-shrink-0 w-[525px] flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
    >
      {/* Accent strip */}
      <div className="h-0.5 w-full flex-shrink-0" style={{ backgroundColor: col.accentColor }} />

      {/* Column header */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-slate-100 flex-shrink-0">
        <span className="text-[13px] font-semibold text-slate-800 uppercase tracking-wide truncate">
          {col.label}
        </span>
        <span
          className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold text-white flex-shrink-0"
          style={{ backgroundColor: col.accentColor }}
        >
          {cards.length}
        </span>
      </div>

      {/* Cards / drop area */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-2.5 space-y-2 overflow-y-auto min-h-[180px] max-h-[calc(100vh-268px)] transition-colors duration-150
          ${isOver ? "bg-slate-50 ring-2 ring-inset ring-slate-300 rounded-b-xl" : "bg-transparent"}`}
      >
        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 gap-2 text-center">
            <Inbox size={24} className={isOver ? "text-slate-400" : "text-slate-200"} />
            <p className={`text-[11px] leading-relaxed px-3 ${isOver ? "text-slate-500" : "text-slate-400"}`}>
              {isOver ? "Drop here" : col.emptyText}
            </p>
          </div>
        ) : (
          cards.map((opp) => (
            <DraggableQuoteCard key={opp.id} opportunity={opp} onClick={onCardClick} />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface QuoteKanbanBoardProps {
  opportunities: Opportunity[];
  onCardClick: (opp: Opportunity) => void;
  onStatusChange: (opp: Opportunity, newStatus: QuoteStatus) => void;
  onApprovalRequest: (opp: Opportunity) => void;
}

// ─── Board ────────────────────────────────────────────────────────────────────

export function QuoteKanbanBoard({
  opportunities,
  onCardClick,
  onStatusChange,
  onApprovalRequest,
}: QuoteKanbanBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  const activeOpp = opportunities.find((o) => o.id === activeId) ?? null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const oppId       = String(active.id);
    const targetCol   = String(over.id) as QuoteStatus;
    if (!COLUMNS.find((c) => c.id === targetCol)) return;

    const opp = opportunities.find((o) => o.id === oppId);
    if (!opp || opp.quoteStatus === targetCol) return;

    if (targetCol === "approved") {
      onApprovalRequest(opp);
    } else {
      onStatusChange(opp, targetCol);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const cards = opportunities.filter((o) => o.quoteStatus === col.id);
          return (
            <DroppableColumn
              key={col.id}
              col={col}
              cards={cards}
              onCardClick={onCardClick}
            />
          );
        })}
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
        {activeOpp ? (
          <div className="rotate-1 scale-105 shadow-2xl rounded-xl opacity-95">
            <QuoteCard opportunity={activeOpp} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
