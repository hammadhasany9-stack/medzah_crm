"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ContractCollapsible({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/80 hover:bg-slate-50 transition-colors text-left"
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{title}</p>
        <ChevronDown
          size={16}
          className={cn("text-slate-400 transition-transform flex-shrink-0", open && "rotate-180")}
        />
      </button>
      {open && <div className="px-5 py-4 border-t border-slate-50">{children}</div>}
    </div>
  );
}
