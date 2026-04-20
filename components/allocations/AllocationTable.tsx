"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown, ChevronsUpDown, Inbox, Calendar } from "lucide-react";
import { AllocationRecord, AllocationRecordStatus, Priority } from "@/lib/types";
import { cn } from "@/lib/utils";

type SortField = "allocationRef" | "contactName" | "companyName" | "leadSource" | "leadPriority" | "totalProducts" | "ownerName" | "dueDate" | "status";
type SortDir   = "asc" | "desc";

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (field !== sortField) return <ChevronsUpDown size={13} className="text-slate-300" />;
  return sortDir === "asc"
    ? <ChevronUp size={13} className="text-[#002f93]" />
    : <ChevronDown size={13} className="text-[#002f93]" />;
}

const priorityStyles: Record<Priority, { bg: string; text: string; emoji: string }> = {
  Hot:  { bg: "bg-orange-100", text: "text-orange-600", emoji: "🔥" },
  Warm: { bg: "bg-amber-100",  text: "text-amber-600",  emoji: "☀️" },
  Cold: { bg: "bg-sky-100",    text: "text-sky-600",    emoji: "❄️" },
};

function PriorityBadge({ priority }: { priority: Priority }) {
  const s = priorityStyles[priority];
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-semibold whitespace-nowrap", s.bg, s.text)}>
      <span className="text-[13px] leading-none">{s.emoji}</span>
      {priority.toUpperCase()}
    </span>
  );
}

function StatusBadge({ status }: { status: AllocationRecordStatus }) {
  const styles: Record<AllocationRecordStatus, string> = {
    Pending:              "bg-slate-100 text-slate-600 border border-slate-200",
    Approved:             "bg-emerald-50 text-emerald-700 border border-emerald-200",
    "Partially Approved": "bg-amber-50 text-amber-700 border border-amber-200",
    "On Hold":            "bg-red-50 text-red-600 border border-red-200",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide", styles[status])}>
      {status}
    </span>
  );
}

function DueDateCell({ dueDate }: { dueDate?: string }) {
  if (!dueDate) {
    return <span className="text-xs text-slate-300">—</span>;
  }
  const d = new Date(dueDate);
  const now = new Date();
  const isOverdue = d < now;
  const isToday = d.toDateString() === now.toDateString();

  const datePart = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const timePart = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  return (
    <div className={cn("flex items-start gap-1.5", isOverdue ? "text-red-500" : isToday ? "text-amber-600" : "text-slate-600")}>
      <Calendar size={12} className="mt-0.5 flex-shrink-0 opacity-70" />
      <div className="leading-tight">
        <p className="text-[12px] font-semibold whitespace-nowrap">{datePart}</p>
        <p className="text-[11px] opacity-70 whitespace-nowrap">{timePart}</p>
      </div>
    </div>
  );
}

interface AllocationTableProps {
  records: AllocationRecord[];
}

const COLUMNS: { key: SortField; label: string }[] = [
  { key: "allocationRef",  label: "Allocation ID" },
  { key: "contactName",    label: "Contact Name" },
  { key: "companyName",    label: "Company Name" },
  { key: "leadSource",     label: "Lead Source" },
  { key: "leadPriority",   label: "Lead Priority" },
  { key: "totalProducts",  label: "Total Products" },
  { key: "ownerName",      label: "Owner" },
  { key: "dueDate",        label: "Due Date" },
  { key: "status",         label: "Status" },
];

export function AllocationTable({ records }: AllocationTableProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>("dueDate");
  const [sortDir,   setSortDir]   = useState<SortDir>("asc");

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  const sorted = [...records].sort((a, b) => {
    const av = (a[sortField] ?? "") as string | number;
    const bv = (b[sortField] ?? "") as string | number;
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir === "asc" ? cmp : -cmp;
  });

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-20 gap-3">
        <Inbox size={32} className="text-slate-200" />
        <p className="text-sm text-slate-400 font-medium">No allocation requests found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    <SortIcon field={col.key} sortField={sortField} sortDir={sortDir} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((rec, i) => (
              <tr
                key={rec.id}
                onClick={() => router.push(`/allocation/${rec.id}`)}
                className={cn(
                  "border-b border-slate-50 cursor-pointer transition-colors hover:bg-blue-50/40",
                  i % 2 === 1 && "bg-slate-50/30"
                )}
              >
                <td className="px-4 py-3 font-semibold text-[#002f93] whitespace-nowrap">
                  {rec.allocationRef}
                </td>
                <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                  {rec.contactName}
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {rec.companyName}
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {rec.leadSource}
                </td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={rec.leadPriority} />
                </td>
                <td className="px-4 py-3 text-slate-700 font-medium text-center">
                  {rec.totalProducts}
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {rec.ownerName}
                </td>
                <td className="px-4 py-3">
                  <DueDateCell dueDate={rec.dueDate} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={rec.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
