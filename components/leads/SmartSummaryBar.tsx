"use client";

import { useState, useEffect } from "react";
import { Lead, LeadStatus } from "@/lib/types";

const TILES: { label: string; status: LeadStatus; color: string }[] = [
  { label: "New",                 status: "New",                 color: "#6366F1" },
  { label: "Attempted Contact",   status: "Attempted Contact",   color: "#F59E0B" },
  { label: "Contacted",           status: "Contacted",           color: "#10B981" },
  { label: "Allocation",          status: "Allocation",          color: "#002f93" },
  { label: "Qualified",           status: "Qualified",           color: "#8B5CF6" },
  { label: "On Hold",             status: "Allocation on hold",  color: "#64748B" },
  { label: "Inactive",            status: "Inactive",            color: "#EF4444" },
];

interface SmartSummaryBarProps {
  leads: Lead[];
}

export function SmartSummaryBar({ leads }: SmartSummaryBarProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex overflow-hidden">
      {TILES.map((tile, idx) => {
        const count = mounted ? leads.filter((l) => l.status === tile.status).length : 0;
        return (
          <div
            key={tile.status}
            className={`flex-1 px-5 py-4 flex flex-col gap-1.5 ${
              idx < TILES.length - 1 ? "border-r border-slate-100" : ""
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: tile.color }}
              />
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 truncate">
                {tile.label}
              </span>
            </div>
            <span
              className="text-3xl font-bold tabular-nums"
              style={{ color: count > 0 ? tile.color : "#CBD5E1" }}
            >
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
