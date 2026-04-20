"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Opportunity } from "@/lib/types";
import { QuoteCard } from "./QuoteCard";

interface DraggableQuoteCardProps {
  opportunity: Opportunity;
  onClick: (opp: Opportunity) => void;
}

export function DraggableQuoteCard({ opportunity, onClick }: DraggableQuoteCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: opportunity.id,
    data: { opportunity },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.35 : 1,
    cursor: isDragging ? "grabbing" : "grab",
    transition: isDragging ? undefined : "opacity 150ms ease",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <QuoteCard
        opportunity={opportunity}
        onClick={(opp) => {
          if (!transform) onClick(opp);
        }}
      />
    </div>
  );
}
