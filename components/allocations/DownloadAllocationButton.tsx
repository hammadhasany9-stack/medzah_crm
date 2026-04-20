"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { AllocationRecord } from "@/lib/types";
import { downloadAllocationXlsx } from "@/lib/export-allocation-xlsx";
import { cn } from "@/lib/utils";

interface DownloadAllocationButtonProps {
  record: AllocationRecord;
  /** Stops parent click handlers (e.g. lead card) */
  stopPropagation?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function DownloadAllocationButton({
  record,
  stopPropagation = false,
  className,
  size = "md",
}: DownloadAllocationButtonProps) {
  const [busy, setBusy] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    if (stopPropagation) e.stopPropagation();
    setBusy(true);
    try {
      await downloadAllocationXlsx(record);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold rounded-lg transition-colors disabled:opacity-60",
        size === "sm"
          ? "px-2.5 py-1 text-[11px] text-emerald-800 border border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100"
          : "px-4 py-2 text-sm text-emerald-800 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100",
        className
      )}
    >
      {busy ? <Loader2 size={size === "sm" ? 11 : 15} className="animate-spin" /> : <Download size={size === "sm" ? 11 : 15} />}
      Download allocation
    </button>
  );
}
