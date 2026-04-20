import { Opportunity, OpportunityStage } from "@/lib/types";

const TILES: { label: string; stage: OpportunityStage; color: string }[] = [
  { label: "Qualified",            stage: "Qualified",            color: "#8B5CF6" },
  { label: "Proposal/Pricing Quote", stage: "Proposal/Price Quote", color: "#3B82F6" },
  { label: "Negotiation",          stage: "Negotiation/Review",   color: "#F59E0B" },
  { label: "Closed Won",           stage: "Closed Won",           color: "#10B981" },
  { label: "Closed Lost",          stage: "Closed Lost",          color: "#EF4444" },
];

interface OpportunitySummaryBarProps {
  opportunities: Opportunity[];
}

export function OpportunitySummaryBar({ opportunities }: OpportunitySummaryBarProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex overflow-hidden">
      {TILES.map((tile, idx) => {
        const count = opportunities.filter((o) => o.opportunityStage === tile.stage).length;
        return (
          <div
            key={tile.stage}
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
