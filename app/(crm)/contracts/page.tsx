"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Eye, Pencil, Send, Mail, Download, Save, X } from "lucide-react";
import { useCRMShell } from "@/components/shell/CRMShellContext";
import { DateRangePicker, type DateRange } from "@/components/accounts/DateRangePicker";
import type { Contract, ContractStatus } from "@/lib/types";
import { contractStatusLabel, formatEffectiveFrom } from "@/components/contracts/contract-format";
import { ContractPrintModal } from "@/components/contracts/ContractPrintModal";
import { cn } from "@/lib/utils";

const CONTRACT_TYPES = ["All types", "Supply & Service", "Master Service", "Pilot"];

function statusBadgeClass(s: ContractStatus): string {
  switch (s) {
    case "approved":
      return "bg-emerald-50 border-emerald-200 text-emerald-800";
    case "pending_approval":
      return "bg-amber-50 border-amber-200 text-amber-800";
    default:
      return "bg-slate-50 border-slate-200 text-slate-600";
  }
}

function inDateRange(d: string, range: DateRange): boolean {
  if (!range.start && !range.end) return true;
  const t = new Date(d + "T12:00:00").getTime();
  if (range.start && range.end) {
    const s = new Date(range.start).setHours(0, 0, 0, 0);
    const e = new Date(range.end).setHours(23, 59, 59, 999);
    return t >= s && t <= e;
  }
  if (range.start)
    return t >= new Date(range.start).setHours(0, 0, 0, 0);
  return true;
}

export default function ContractsPage() {
  const { contracts, setContracts } = useCRMShell();
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [dateLabel, setDateLabel] = useState("All Time");
  const [status, setStatus] = useState<"all" | ContractStatus>("all");
  const [typeFilter, setTypeFilter] = useState("All types");
  const [printContract, setPrintContract] = useState<Contract | null>(null);
  /** After user clicks Send email for an approved contract, that row shows Save document instead. */
  const [showSaveDocumentAfterEmail, setShowSaveDocumentAfterEmail] = useState<Set<string>>(
    () => new Set()
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return contracts.filter((c) => {
      const matchQ =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.accountName.toLowerCase().includes(q) ||
        c.contactName.toLowerCase().includes(q) ||
        c.contractRef.toLowerCase().includes(q);
      const matchS = status === "all" || c.status === status;
      const matchT =
        typeFilter === "All types" || c.type === typeFilter;
      const matchD = inDateRange(c.effectiveDate, dateRange);
      return matchQ && matchS && matchT && matchD;
    });
  }, [contracts, search, status, typeFilter, dateRange]);

  function sendForApproval(c: Contract) {
    if (
      !window.confirm(`Send contract ${c.contractRef} for approval?`)
    ) {
      return;
    }
    const now = new Date().toISOString();
    setContracts((prev) =>
      prev.map((x) =>
        x.id === c.id
          ? { ...x, status: "pending_approval" as const, updatedAt: now }
          : x
      )
    );
  }

  function sendContractEmail(c: Contract) {
    window.alert(
      `Send approved contract ${c.contractRef} (“${c.name || "Untitled"}”) to the customer by email (demo).`
    );
    setShowSaveDocumentAfterEmail((prev) => new Set(prev).add(c.id));
  }

  return (
    <div className="flex flex-col gap-5 p-6 min-h-full">
      <ContractPrintModal
        contract={printContract}
        open={!!printContract}
        onClose={() => setPrintContract(null)}
      />

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">Contracts</h1>
        <Link
          href="/contracts/approval"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors w-fit"
        >
          Contract approval screen
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex flex-wrap items-center gap-3">
        <DateRangePicker
          value={dateRange}
          label={dateLabel}
          onChange={(range, label) => {
            setDateRange(range);
            setDateLabel(label);
          }}
        />
        <div className="w-px h-5 bg-slate-200 hidden sm:block" />
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[11px] font-semibold uppercase text-slate-400">Status</span>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "all" | ContractStatus)
            }
            className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002f93]/30"
          >
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="pending_approval">Pending</option>
            <option value="approved">Approved</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[11px] font-semibold uppercase text-slate-400">Type</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002f93]/30"
          >
            {CONTRACT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search name, account, or contact…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-8 py-1.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002f93]/30 focus:border-[#002f93] transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-800">
            {filtered.length} contract{filtered.length !== 1 ? "s" : ""}
            {(search || status !== "all" || typeFilter !== "All types" || dateRange.start || dateRange.end) && (
              <span className="ml-1.5 text-slate-400 font-normal text-xs">(filtered)</span>
            )}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3 whitespace-nowrap">Contract ID</th>
                <th className="px-4 py-3 whitespace-nowrap">Contract name</th>
                <th className="px-4 py-3 whitespace-nowrap">Account</th>
                <th className="px-4 py-3 whitespace-nowrap">Contact</th>
                <th className="px-4 py-3 whitespace-nowrap">Type</th>
                <th className="px-4 py-3 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 whitespace-nowrap">Term</th>
                <th className="px-4 py-3 whitespace-nowrap min-w-[160px]">Effective from</th>
                <th className="px-4 py-3 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{c.contractRef}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 max-w-[200px] truncate">
                    {c.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-700 max-w-[140px] truncate">
                    {c.accountName}
                  </td>
                  <td className="px-4 py-3 text-slate-700 max-w-[120px] truncate">
                    {c.contactName}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{c.type}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border",
                        statusBadgeClass(c.status)
                      )}
                    >
                      {contractStatusLabel(c.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{c.term}</td>
                  <td className="px-4 py-3 text-slate-700 tabular-nums text-xs">
                    {formatEffectiveFrom(c.effectiveAt ?? `${c.effectiveDate}T12:00:00.000Z`)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                      <Link
                        href={`/contracts/${c.id}`}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-[#002f93] hover:bg-[#002f93]/10"
                      >
                        <Eye size={12} /> View
                      </Link>
                      {c.status !== "approved" && (
                        <Link
                          href={`/contracts/${c.id}/edit`}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          <Pencil size={12} /> Edit
                        </Link>
                      )}
                      {c.status === "draft" && (
                        <button
                          type="button"
                          onClick={() => sendForApproval(c)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-white bg-[#002f93] hover:bg-[#002a7d]"
                        >
                          <Send size={12} />
                          Send for approval
                        </button>
                      )}
                      {c.status === "approved" && (
                        <>
                          <button
                            type="button"
                            onClick={() => setPrintContract(c)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          >
                            <Download size={12} />
                            Download contract
                          </button>
                          {showSaveDocumentAfterEmail.has(c.id) ? (
                            <button
                              type="button"
                              onClick={() => setPrintContract(c)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            >
                              <Save size={12} />
                              Save document
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => sendContractEmail(c)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                            >
                              <Mail size={12} />
                              Send email
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-slate-500">No contracts match your filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}
