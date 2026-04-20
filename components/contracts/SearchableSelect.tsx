"use client";

import { Search, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

const inputCls =
  "w-full pl-7 pr-8 py-2 text-[13px] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93]/30 focus:border-[#002f93] bg-white placeholder:text-slate-400";

/** Searchable dropdown: `value` is committed option id; empty string means none. */
export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Search or select…",
  disabled,
}: {
  options: SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const selected = options.find((o) => o.value === value);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(selected?.label ?? "");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setText(selected?.label ?? "");
  }, [value, selected?.label]);

  const filtered = useMemo(() => {
    const q = text.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
    );
  }, [options, text]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          disabled={disabled}
          value={text}
          placeholder={placeholder}
          onChange={(e) => {
            const v = e.target.value;
            setText(v);
            onValueChange("");
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className={cn(inputCls, disabled && "opacity-60 cursor-not-allowed")}
        />
        <ChevronDown
          size={14}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>
      {open && !disabled && (
        <div className="absolute z-[60] top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg max-h-[220px] overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-[12px] text-slate-400">No matches</p>
          ) : (
            filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onValueChange(o.value);
                  setText(o.label);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-[12px] hover:bg-slate-50 border-b border-slate-50 last:border-0"
              >
                {o.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
