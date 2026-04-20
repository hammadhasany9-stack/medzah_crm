"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface DateRangePickerProps {
  value: DateRange;
  label: string;
  onChange: (range: DateRange, label: string) => void;
}

const PRESETS = [
  {
    label: "Today",
    getDates: () => {
      const t = new Date();
      t.setHours(0, 0, 0, 0);
      return { start: t, end: t };
    },
  },
  {
    label: "Last 7 Days",
    getDates: () => {
      const e = new Date();
      const s = new Date();
      s.setDate(s.getDate() - 6);
      s.setHours(0, 0, 0, 0);
      return { start: s, end: e };
    },
  },
  {
    label: "Last 30 Days",
    getDates: () => {
      const e = new Date();
      const s = new Date();
      s.setDate(s.getDate() - 29);
      s.setHours(0, 0, 0, 0);
      return { start: s, end: e };
    },
  },
  {
    label: "Last 90 Days",
    getDates: () => {
      const e = new Date();
      const s = new Date();
      s.setDate(s.getDate() - 89);
      s.setHours(0, 0, 0, 0);
      return { start: s, end: e };
    },
  },
  {
    label: "This Year",
    getDates: () => {
      const now = new Date();
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear(), 11, 31),
      };
    },
  },
  {
    label: "All Time",
    getDates: () => ({ start: null, end: null }),
  },
  {
    label: "Custom Range",
    getDates: () => ({ start: null, end: null }),
  },
];

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function DateRangePicker({ value, label, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    const d = value.start ?? new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectionStep, setSelectionStep] = useState<"start" | "end">("start");
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [activePreset, setActivePreset] = useState(label);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSelectionStep("start");
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  function getRangeEnd(): Date | null {
    if (selectionStep === "end" && hoveredDate) return hoveredDate;
    return value.end;
  }

  function isInRange(date: Date) {
    const start = value.start;
    const end = getRangeEnd();
    if (!start || !end) return false;
    const s = start <= end ? start : end;
    const e = start <= end ? end : start;
    return date > s && date < e;
  }

  function isRangeStart(date: Date) {
    const start = value.start;
    const end = getRangeEnd();
    if (!start) return false;
    if (!end) return isSameDay(date, start);
    return start <= end ? isSameDay(date, start) : isSameDay(date, end);
  }

  function isRangeEnd(date: Date) {
    const start = value.start;
    const end = getRangeEnd();
    if (!start || !end) return false;
    return start <= end ? isSameDay(date, end) : isSameDay(date, start);
  }

  function handleDayClick(date: Date) {
    if (selectionStep === "start") {
      onChange({ start: date, end: null }, "Custom Range");
      setActivePreset("Custom Range");
      setSelectionStep("end");
    } else {
      const start = value.start!;
      const newStart = date < start ? date : start;
      const newEnd = date < start ? start : date;
      onChange({ start: newStart, end: newEnd }, "Custom Range");
      setActivePreset("Custom Range");
      setSelectionStep("start");
      setOpen(false);
    }
  }

  function handlePreset(preset: (typeof PRESETS)[0]) {
    if (preset.label === "Custom Range") {
      setActivePreset("Custom Range");
      setSelectionStep("start");
      return;
    }
    const dates = preset.getDates();
    onChange(dates, preset.label);
    setActivePreset(preset.label);
    setOpen(false);
  }

  function formatDate(d: Date) {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  const today = new Date();

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors",
          open
            ? "border-[#002f93] bg-[#EFF3FF] text-[#002f93]"
            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        )}
      >
        <Calendar size={14} className={open ? "text-[#002f93]" : "text-slate-400"} />
        <span>{label}</span>
        {label !== "Last 30 Days" && label !== "All Time" && (
          <X
            size={12}
            className="text-slate-400 hover:text-slate-600"
            onClick={(e) => {
              e.stopPropagation();
              const preset = PRESETS.find((p) => p.label === "Last 30 Days")!;
              onChange(preset.getDates(), preset.label);
              setActivePreset("Last 30 Days");
            }}
          />
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 bg-white rounded-xl border border-slate-200 shadow-2xl flex overflow-hidden">
          {/* Preset list */}
          <div className="w-44 border-r border-slate-100 py-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-4 py-1.5">
              Quick Select
            </p>
            <div className="mt-0.5">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePreset(preset)}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm transition-colors",
                    activePreset === preset.label
                      ? "bg-[#002f93] text-white font-semibold"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar panel */}
          <div className="p-4 w-72">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setViewDate(new Date(year, month - 1, 1))}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-sm font-bold text-slate-800">
                {MONTHS[month]} {year}
              </span>
              <button
                onClick={() => setViewDate(new Date(year, month + 1, 1))}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map((d) => (
                <div
                  key={d}
                  className="text-center text-[11px] font-bold text-slate-400 py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {cells.map((date, i) => {
                if (!date) return <div key={i} />;
                const isStart = isRangeStart(date);
                const isEnd = isRangeEnd(date);
                const inRange = isInRange(date);
                const isToday = isSameDay(date, today);

                return (
                  <button
                    key={i}
                    onClick={() => handleDayClick(date)}
                    onMouseEnter={() => {
                      if (selectionStep === "end") setHoveredDate(date);
                    }}
                    onMouseLeave={() => setHoveredDate(null)}
                    className={cn(
                      "relative w-full aspect-square flex items-center justify-center text-xs transition-colors rounded-lg",
                      isStart || isEnd
                        ? "bg-[#002f93] text-white font-bold z-10"
                        : inRange
                        ? "bg-[#EFF3FF] text-[#002f93] rounded-none"
                        : isToday
                        ? "font-bold text-[#002f93] hover:bg-slate-100"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Selection hint */}
            {selectionStep === "end" && (
              <p className="text-xs text-[#002f93] font-medium text-center mt-3 bg-[#EFF3FF] rounded-lg py-1.5 px-2">
                Now select the end date
              </p>
            )}

            {/* Date range display */}
            {(value.start || value.end) && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex flex-col items-center">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      From
                    </span>
                    <span className="text-slate-700 font-semibold mt-0.5">
                      {value.start ? formatDate(value.start) : "—"}
                    </span>
                  </div>
                  <div className="w-6 h-px bg-slate-200" />
                  <div className="flex flex-col items-center">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      To
                    </span>
                    <span className="text-slate-700 font-semibold mt-0.5">
                      {value.end ? formatDate(value.end) : "—"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
