"use client";

import { useDroppable } from "@dnd-kit/core";
import Link from "next/link";
import { Plus, Inbox } from "lucide-react";
import { Lead, KanbanColumn as KanbanColumnType } from "@/lib/types";
import { DraggableLeadCard } from "./DraggableLeadCard";

interface KanbanColumnProps {
  column: KanbanColumnType;
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

export function KanbanColumn({ column, leads, onLeadClick }: KanbanColumnProps) {
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
        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
          <span className="text-[13px] font-semibold text-slate-800 truncate">{column.label}</span>
          <span
            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold text-white flex-shrink-0"
            style={{ backgroundColor: column.accentColor }}
          >
            {leads.length}
          </span>
        </div>
        {column.id === "New" && (
          <Link
            href="/leads/create"
            className="w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            title="Add new lead"
          >
            <Plus size={13} />
          </Link>
        )}
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-2.5 space-y-2 overflow-y-auto transition-colors duration-150
          min-h-[180px] max-h-[calc(100vh-268px)]
          ${isOver ? "bg-slate-50 ring-2 ring-inset ring-slate-300 rounded-b-xl" : "bg-transparent"}`}
      >
        {leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 gap-2 text-center">
            <Inbox size={24} className={isOver ? "text-slate-400" : "text-slate-200"} />
            <p className={`text-[11px] leading-relaxed px-3 ${isOver ? "text-slate-500" : "text-slate-400"}`}>
              {isOver ? "Drop here" : column.emptyText}
            </p>
          </div>
        ) : (
          leads.map((lead) => (
            <DraggableLeadCard key={lead.id} lead={lead} onClick={onLeadClick} />
          ))
        )}
      </div>
    </div>
  );
}
