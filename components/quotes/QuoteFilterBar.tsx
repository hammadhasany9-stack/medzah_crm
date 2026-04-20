"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Opportunity } from "@/lib/types";

// ─── Team member config ───────────────────────────────────────────────────────

export const TEAM_MEMBERS = ["All", "David", "Patrick", "Denise"] as const;
export type TeamMember = (typeof TEAM_MEMBERS)[number];

// ─── Filter options ───────────────────────────────────────────────────────────

const STATUS_OPTIONS = ["Pending", "Approved", "Rejected"];

const OWNER_OPTIONS = ["Me", "Katie Allen", "Kevin Calamari", "All"];

const DATE_RANGE_OPTIONS = [
  "Today",
  "Yesterday",
  "Last 7 Days",
  "Last 30 Days",
  "Last 90 Days",
  "This Month",
  "Last Month",
  "This Quarter",
  "This Year",
];

// ─── Stat tile colors ─────────────────────────────────────────────────────────

const STAT_TILES = [
  { key: "totalValue", label: "Total Value",  color: "#3B82F6" },
  { key: "pending",    label: "Pending",      color: "#F59E0B" },
  { key: "approved",   label: "Approved",     color: "#10B981" },
  { key: "rejected",   label: "Rejected",     color: "#EF4444" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseMoney(raw: string): number {
  return parseFloat(raw.replace(/[^0-9.]/g, "")) || 0;
}

function formatTotal(total: number): string {
  if (total >= 1_000_000) return `$${(total / 1_000_000).toFixed(1)}M`;
  if (total >= 1_000)     return `$${(total / 1_000).toFixed(0)}K`;
  return `$${total.toFixed(0)}`;
}

// ─── Dropdown ─────────────────────────────────────────────────────────────────

interface DropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  single?: boolean;
}

function FilterDropdown({ label, options, selected, onToggle, single }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const hasSelection = selected.length > 0;
  const displayLabel = hasSelection
    ? single
      ? `${label}: ${selected[0]}`
      : `${label} · ${selected.length}`
    : `${label}: All`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
          hasSelection
            ? "bg-[#002f93]/8 border-[#002f93]/30 text-[#002f93] font-semibold"
            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
        }`}
      >
        <span>{displayLabel}</span>
        <ChevronDown
          size={13}
          className={`transition-transform ${open ? "rotate-180" : ""} ${hasSelection ? "text-[#002f93]" : "text-slate-400"}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-50 bg-white rounded-xl border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.12)] py-1.5 min-w-[190px]">
          {options.map((opt) => {
            const active = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onToggle(opt);
                  if (single) setOpen(false);
                }}
                className="w-full flex items-center justify-between gap-3 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span className={active ? "font-semibold text-[#002f93]" : ""}>{opt}</span>
                {active && <Check size={13} className="text-[#002f93] flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface QuoteFilterBarProps {
  viewFilteredOpportunities: Opportunity[];
  statusFilters: string[];
  onStatusToggle: (v: string) => void;
  ownerFilters: string[];
  onOwnerToggle: (v: string) => void;
  dateFilters: string[];
  onDateToggle: (v: string) => void;
  onClearFilters: () => void;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  teamMember: TeamMember;
  onTeamMemberChange: (v: TeamMember) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function QuoteFilterBar({
  viewFilteredOpportunities,
  statusFilters,
  onStatusToggle,
  ownerFilters,
  onOwnerToggle,
  dateFilters,
  onDateToggle,
  onClearFilters,
  searchQuery,
  onSearchChange,
  teamMember,
  onTeamMemberChange,
}: QuoteFilterBarProps) {
  const pending  = viewFilteredOpportunities.filter((o) => o.quoteStatus === "pending").length;
  const approved = viewFilteredOpportunities.filter((o) => o.quoteStatus === "approved").length;
  const rejected = viewFilteredOpportunities.filter((o) => o.quoteStatus === "rejected").length;
  const totalValue = viewFilteredOpportunities.reduce(
    (sum, o) => sum + parseMoney(o.quoteData?.grandTotal ?? "0"),
    0
  );

  const statsValues: Record<string, string> = {
    totalValue: formatTotal(totalValue),
    pending:    String(pending),
    approved:   String(approved),
    rejected:   String(rejected),
  };

  const allActivePills = [
    ...statusFilters,
    ...ownerFilters,
    ...dateFilters,
  ];

  return (
    <div className="flex flex-col gap-2.5 flex-shrink-0">

      {/* ── Stats bar ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex overflow-hidden">
        {STAT_TILES.map((tile, idx) => {
          const val = statsValues[tile.key];
          const nonZero = parseFloat(val.replace(/[^0-9.]/g, "")) > 0;
          return (
            <div
              key={tile.key}
              className={`flex-1 px-5 py-4 flex flex-col gap-1.5 ${
                idx < STAT_TILES.length - 1 ? "border-r border-slate-100" : ""
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: tile.color }} />
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 truncate">
                  {tile.label}
                </span>
              </div>
              <span
                className="text-3xl font-bold tabular-nums"
                style={{ color: nonZero ? tile.color : "#CBD5E1" }}
              >
                {val}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Filter row ── */}
      <div className="flex items-center gap-2.5 flex-wrap">

        <FilterDropdown
          label="Status"
          options={STATUS_OPTIONS}
          selected={statusFilters}
          onToggle={onStatusToggle}
        />

        <FilterDropdown
          label="Owner"
          options={OWNER_OPTIONS}
          selected={ownerFilters}
          onToggle={onOwnerToggle}
          single
        />

        <FilterDropdown
          label="Date Range"
          options={DATE_RANGE_OPTIONS}
          selected={dateFilters}
          onToggle={onDateToggle}
          single
        />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Team member tabs */}
        <div className="flex items-center gap-1">
          {TEAM_MEMBERS.map((member) => (
            <button
              key={member}
              type="button"
              onClick={() => onTeamMemberChange(member)}
              className={`px-3 py-1.5 text-sm rounded-lg border font-semibold transition-colors ${
                teamMember === member
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {member}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-64">
          <Input
            icon={<Search size={14} />}
            placeholder="Search Quotes"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="py-1.5 text-xs"
          />
        </div>
      </div>

      {/* ── Active filter pills ── */}
      {allActivePills.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">Filters:</span>
          {allActivePills.map((pill) => (
            <span
              key={pill}
              className="flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-[#002f93]/8 text-[#002f93] rounded-full border border-[#002f93]/20"
            >
              {pill}
              <button
                type="button"
                onClick={() => {
                  onStatusToggle(pill);
                  onOwnerToggle(pill);
                  onDateToggle(pill);
                }}
                className="ml-0.5 hover:text-[#001a6e] leading-none"
              >
                ×
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={onClearFilters}
            className="text-[11px] text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
