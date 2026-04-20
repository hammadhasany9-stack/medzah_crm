"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Eye, Search, X } from "lucide-react";
import { useCRMShell } from "@/components/shell/CRMShellContext";
import type { Contract, ContractStatus } from "@/lib/types";
import {
  contractStatusLabel,
  formatEffectiveFrom,
  isContractPendingApproval,
} from "@/components/contracts/contract-format";
import { ContractApprovalSignatureModal } from "@/components/contracts/ContractApprovalSignatureModal";
import { cn } from "@/lib/utils";

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

export default function ContractApprovalPage() {
  const { contracts, setContracts } = useCRMShell();
  const [search, setSearch] = useState("");
  const [modalContract, setModalContract] = useState<Contract | null>(null);

  const pending = useMemo(() => {
    const q = search.toLowerCase().trim();
    return contracts
      .filter(isContractPendingApproval)
      .filter(
        (c) =>
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.accountName.toLowerCase().includes(q) ||
          c.contactName.toLowerCase().includes(q) ||
          c.contractRef.toLowerCase().includes(q) ||
          c.type.toLowerCase().includes(q)
      );
  }, [contracts, search]);

  function approveWithSignature(signature: string) {
    if (!modalContract) return;
    const now = new Date().toISOString();
    setContracts((prev) =>
      prev.map((x) =>
        x.id === modalContract.id
          ? {
              ...x,
              status: "approved" as const,
              updatedAt: now,
              approverEsignature: signature,
              sellerName: x.sellerName ?? "Kevin Calamari",
              buyerName: x.buyerName ?? x.contactName,
              sellerSignedAt: now,
              buyerSignedAt: now,
            }
          : x
      )
    );
    setModalContract(null);
  }

  return (
    <div className="p-6 flex flex-col gap-5 min-h-full">
      <ContractApprovalSignatureModal
        contract={modalContract}
        open={!!modalContract}
        onClose={() => setModalContract(null)}
        onConfirm={approveWithSignature}
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/contracts"
            className="w-9 h-9 rounded-lg flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Contract approval</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Pending contracts only. Approve here with e-signature (not available on the main contract view).
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
        <div className="relative max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="search"
            placeholder="Search name, account, contact, contract ID, type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93]/30"
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
            {pending.length} pending contract{pending.length !== 1 ? "s" : ""}
            {search.trim() && (
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
              {pending.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{c.contractRef}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 max-w-[200px] truncate">
                    {c.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-700 max-w-[140px] truncate">{c.accountName}</td>
                  <td className="px-4 py-3 text-slate-700 max-w-[120px] truncate">{c.contactName}</td>
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
                      <button
                        type="button"
                        onClick={() => setModalContract(c)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        <CheckCircle size={12} /> Approve
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pending.length === 0 && (
            <p className="px-5 py-12 text-center text-sm text-slate-500">
              No contracts pending approval.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
