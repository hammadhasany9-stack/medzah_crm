"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { Input } from "@/components/ui/Input";

// ─── Options ──────────────────────────────────────────────────────────────────

const SOURCE_OPTIONS = [
  "Cold Call",
  "Chamber of Commerce",
  "Internal Referral",
  "External Referral",
  "Premier",
  "Premier Activation",
  "Facebook",
  "LinkedIn",
  "Trade Show",
  "Yamas Rental Commerce",
];

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

// ─── Generic dropdown ─────────────────────────────────────────────────────────

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

// ─── Main component ───────────────────────────────────────────────────────────

export function OpportunityFilterBar() {
  const [sources,   setSources]   = useState<string[]>([]);
  const [owners,    setOwners]    = useState<string[]>(["Me"]);
  const [dateRange, setDateRange] = useState<string[]>(["Last 30 Days"]);

  function toggle(setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) {
    setter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function toggleSingle(setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) {
    setter((prev) => (prev[0] === value ? [] : [value]));
  }

  const allActive = [...sources, ...owners.filter((o) => o !== "Me"), ...dateRange.filter((d) => d !== "Last 30 Days")];

  return (
    <div className="flex flex-col gap-2.5">
      {/* Filters row */}
      <div className="flex items-center gap-2.5 flex-wrap">

        {/* Source */}
        <FilterDropdown
          label="Source"
          options={SOURCE_OPTIONS}
          selected={sources}
          onToggle={(v) => toggle(setSources, v)}
        />

        {/* Owner */}
        <FilterDropdown
          label="Owner"
          options={OWNER_OPTIONS}
          selected={owners}
          onToggle={(v) => toggleSingle(setOwners, v)}
          single
        />

        {/* Date Range */}
        <FilterDropdown
          label="Date Range"
          options={DATE_RANGE_OPTIONS}
          selected={dateRange}
          onToggle={(v) => toggleSingle(setDateRange, v)}
          single
        />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <div className="w-80">
          <Input
            icon={<Search size={16} />}
            placeholder="Search Opportunities"
            className="py-2 text-xs"
          />
        </div>

      </div>

      {/* Active filter pills */}
      {allActive.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">Filters:</span>
          {allActive.map((pill) => (
            <span
              key={pill}
              className="flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-[#002f93]/8 text-[#002f93] rounded-full border border-[#002f93]/20"
            >
              {pill}
              <button
                type="button"
                onClick={() => {
                  setSources((p) => p.filter((v) => v !== pill));
                  setOwners((p) => p.filter((v) => v !== pill));
                  setDateRange((p) => p.filter((v) => v !== pill));
                }}
                className="ml-0.5 hover:text-[#001a6e] leading-none"
              >
                ×
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => { setSources([]); setOwners([]); setDateRange([]); }}
            className="text-[11px] text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
