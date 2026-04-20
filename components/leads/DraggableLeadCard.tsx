"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Lead } from "@/lib/types";
import { LeadCard } from "./LeadCard";

interface DraggableLeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
}

export function DraggableLeadCard({ lead, onClick }: DraggableLeadCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { lead },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.35 : 1,
    cursor: isDragging ? "grabbing" : "grab",
    transition: isDragging ? undefined : "opacity 150ms ease",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <LeadCard
        lead={lead}
        onClick={(l) => {
          // Only open panel if not a drag
          if (!transform) onClick(l);
        }}
      />
    </div>
  );
}
