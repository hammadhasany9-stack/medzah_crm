"use client";

import { useState } from "react";
import { Inbox } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { Opportunity } from "@/lib/types";
import {
  getQuoteTableStatusLabel,
  QUOTE_STATUS_LABEL_APPROVED_ADJ,
} from "@/lib/quotes-display";
import { isKanbanTeamAssignee, quoteKanbanDroppableId } from "@/lib/quote-kanban-dnd";
import { DraggableQuoteCard } from "./DraggableQuoteCard";
import { QuoteCard } from "./QuoteCard";
import { cn } from "@/lib/utils";

type QuoteBoardColumnKey = "pending" | "approvedAdj" | "rejected";
type OwnerBoardKey = "denise" | "walsh" | "mark";

function columnForOpportunity(o: Opportunity): QuoteBoardColumnKey {
  const label = getQuoteTableStatusLabel(o);
  if (label === "Rejected") return "rejected";
  if (label === "Approved" || label === QUOTE_STATUS_LABEL_APPROVED_ADJ) return "approvedAdj";
  return "pending";
}

function matchesOwnerColumn(o: Opportunity, key: OwnerBoardKey): boolean {
  const a = (o.assignedTo ?? "").toLowerCase();
  if (key === "denise") return a.includes("denise");
  if (key === "walsh") return a.includes("walsh");
  if (key === "mark") return a.includes("mark");
  return false;
}

const STATUS_COLUMN_DEFS: {
  kind: "status";
  key: QuoteBoardColumnKey;
  label: string;
  accentColor: string;
  emptyText: string;
}[] = [
  {
    kind: "status",
    key: "pending",
    label: "Pending",
    accentColor: "#F59E0B",
    emptyText: "No pending quotes.",
  },
  {
    kind: "status",
    key: "approvedAdj",
    label: "Approved / Adjustment",
    accentColor: "#10B981",
    emptyText: "No approved quotes.",
  },
];

const REJECTED_COLUMN_DEF = {
  kind: "status" as const,
  key: "rejected" as const,
  label: "Rejected",
  accentColor: "#EF4444",
  emptyText: "No quotes rejected.",
};

const OWNER_COLUMN_DEFS: {
  kind: "owner";
  key: OwnerBoardKey;
  label: string;
  accentColor: string;
  emptyText: string;
}[] = [
  {
    kind: "owner",
    key: "denise",
    label: "Denise",
    accentColor: "#6366F1",
    emptyText: "No quotes for Denise.",
  },
  {
    kind: "owner",
    key: "walsh",
    label: "Walsh",
    accentColor: "#8B5CF6",
    emptyText: "No quotes for Walsh.",
  },
  {
    kind: "owner",
    key: "mark",
    label: "Mark",
    accentColor: "#EC4899",
    emptyText: "No quotes for Mark.",
  },
];

const ALL_COLUMNS = [...STATUS_COLUMN_DEFS, ...OWNER_COLUMN_DEFS, REJECTED_COLUMN_DEF];

type BoardColumnDef = (typeof ALL_COLUMNS)[number];

function opportunitiesForColumn(opps: Opportunity[], col: BoardColumnDef) {
  if (col.kind === "status") {
    if (col.key === "pending") {
      return opps.filter(
        (o) => columnForOpportunity(o) === "pending" && !isKanbanTeamAssignee(o)
      );
    }
    return opps.filter((o) => columnForOpportunity(o) === col.key);
  }
  return opps.filter((o) => matchesOwnerColumn(o, col.key));
}

interface QuoteKanbanBoardProps {
  opportunities: Opportunity[];
  selectedId: string | null;
  onCardClick: (opp: Opportunity) => void;
  onQuoteDrop: (opportunityId: string, dropZoneId: string) => void;
}

export function QuoteKanbanBoard({
  opportunities,
  selectedId,
  onCardClick,
  onQuoteDrop,
}: QuoteKanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const activeOpp = activeId ? opportunities.find((o) => o.id === activeId) ?? null : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const oppId = String(active.id);
    const dropId = String(over.id);
    if (!dropId.startsWith("quote-col-")) return;

    onQuoteDrop(oppId, dropId);
  }

  if (opportunities.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] px-4 py-12 text-center text-sm text-slate-400">
        No quotes match the current filters.
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-2 min-h-[min(70vh,820px)]">
        {ALL_COLUMNS.map((col) => {
          const colOpps = opportunitiesForColumn(opportunities, col);
          return (
            <BoardColumn
              key={`${col.kind}-${col.key}`}
              col={col}
              colOpps={colOpps}
              selectedId={selectedId}
              onCardClick={onCardClick}
            />
          );
        })}
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
        {activeOpp ? (
          <div className="rotate-1 scale-[1.02] shadow-2xl rounded-2xl opacity-[0.97] max-w-[320px] cursor-grabbing">
            <QuoteCard opportunity={activeOpp} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function BoardColumn({
  col,
  colOpps,
  selectedId,
  onCardClick,
}: {
  col: BoardColumnDef;
  colOpps: Opportunity[];
  selectedId: string | null;
  onCardClick: (opp: Opportunity) => void;
}) {
  const dropId = quoteKanbanDroppableId(col.kind, col.key);
  const { setNodeRef, isOver } = useDroppable({ id: dropId });

  return (
    <div
      className="flex-1 min-w-[260px] max-w-[380px] flex flex-col rounded-xl border border-slate-200 overflow-hidden bg-gray-25 min-h-[200px]"
      style={{
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div className="h-0.5 w-full flex-shrink-0" style={{ backgroundColor: col.accentColor }} />
      <div className="flex items-center gap-2 px-3.5 py-3 border-b border-slate-100 flex-shrink-0 bg-white">
        <span className="text-[13px] font-semibold text-slate-800 truncate uppercase tracking-wide">
          {col.label}
        </span>
        <span
          className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-[11px] font-bold text-white flex-shrink-0"
          style={{ backgroundColor: col.accentColor }}
        >
          {colOpps.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 p-2.5 space-y-2.5 overflow-y-auto bg-slate-50/50 max-h-[calc(100vh-268px)] min-h-[120px] transition-colors rounded-b-xl",
          isOver && "bg-[#002f93]/[0.07] ring-2 ring-inset ring-[#002f93]/20"
        )}
      >
        {colOpps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-center px-2">
            <Inbox size={24} className="text-slate-200" />
            <p className="text-[11px] leading-relaxed text-slate-400">{col.emptyText}</p>
            {isOver && (
              <p className="text-[11px] font-semibold text-[#002f93]">Drop here</p>
            )}
          </div>
        ) : (
          colOpps.map((opp) => (
            <div
              key={opp.id}
              className={cn(
                "rounded-2xl transition-shadow",
                selectedId === opp.id &&
                  "ring-2 ring-[#002f93] ring-offset-2 ring-offset-slate-50 shadow-md"
              )}
            >
              <DraggableQuoteCard opportunity={opp} onClick={onCardClick} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
