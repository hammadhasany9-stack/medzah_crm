import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "urgency-high" | "urgency-medium" | "urgency-low" | "status" | "default";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants: Record<string, string> = {
    "urgency-high":
      "bg-amber-100 text-amber-800 border border-amber-200",
    "urgency-medium":
      "bg-blue-50 text-blue-700 border border-blue-200",
    "urgency-low":
      "bg-slate-100 text-slate-600 border border-slate-200",
    status: "bg-[#EFF3FF] text-[#002f93] border border-blue-100",
    default: "bg-slate-100 text-slate-700 border border-slate-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] font-bold uppercase tracking-wide rounded px-2 py-0.5",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
