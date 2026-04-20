"use client";

import { useRef, useState } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { DateRangePicker, DateRange } from "@/components/accounts/DateRangePicker";
import { Priority } from "@/lib/types";

const SOURCES = ["Cold Call", "Referral", "Trade Show", "Website", "LinkedIn"];
const OWNERS  = ["Kevin Calamari", "Katie Allen"];
const PRIORITIES: Priority[] = ["Hot", "Warm", "Cold"];

interface AllocationFilterBarProps {
  source: string;
  owner: string;
  priority: string;
  dateRange: DateRange;
  dateLabel: string;
  search: string;
  recordCount: number;
  totalCount: number;
  onSourceChange: (v: string) => void;
  onOwnerChange: (v: string) => void;
  onPriorityChange: (v: string) => void;
  onDateChange: (range: DateRange, label: string) => void;
  onSearchChange: (v: string) => void;
  onClear: () => void;
}

function Dropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg transition-colors
          ${value
            ? "border-[#002f93] text-[#002f93] bg-blue-50 font-semibold"
            : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
          }`}
      >
        {value || label}
        {value ? (
          <X
            size={12}
            className="text-[#002f93]"
            onClick={(e) => { e.stopPropagation(); onChange(""); setOpen(false); }}
          />
        ) : (
          <ChevronDown size={13} className="text-slate-400" />
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-30 bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-[160px]">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt === value ? "" : opt); setOpen(false); }}
              className={`w-full text-left px-3.5 py-2 text-sm transition-colors
                ${opt === value ? "bg-blue-50 text-[#002f93] font-semibold" : "text-slate-700 hover:bg-slate-50"}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AllocationFilterBar({
  source, owner, priority, dateRange, dateLabel, search,
  recordCount, totalCount,
  onSourceChange, onOwnerChange, onPriorityChange, onDateChange, onSearchChange, onClear,
}: AllocationFilterBarProps) {
  const hasFilters = !!(source || owner || priority || dateRange.start || search);

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex items-center gap-3 flex-wrap">
      <DateRangePicker value={dateRange} label={dateLabel} onChange={onDateChange} />

      <div className="w-px h-5 bg-slate-200" />

      <Dropdown label="Source"   value={source}   options={SOURCES}     onChange={onSourceChange} />
      <Dropdown label="Owner"    value={owner}    options={OWNERS}      onChange={onOwnerChange} />
      <Dropdown label="Priority" value={priority} options={PRIORITIES}  onChange={onPriorityChange} />

      <div className="w-px h-5 bg-slate-200" />

      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search contact, company, SKU…"
          className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93] placeholder:text-slate-400"
        />
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          Clear
        </button>
      )}

      <div className="ml-auto text-xs text-slate-400 font-medium whitespace-nowrap">
        {recordCount} of {totalCount} request{totalCount !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
