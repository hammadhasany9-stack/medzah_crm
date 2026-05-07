"use client";

import { useState } from "react";
import {
  Eye,
  PackageSearch,
} from "lucide-react";
import { Opportunity } from "@/lib/types";
import { useCRMShell } from "@/components/shell/CRMShellContext";
import { canDownloadAllocationExport } from "@/lib/export-allocation-xlsx";
import { DownloadAllocationButton } from "@/components/allocations/DownloadAllocationButton";
import { ViewQuoteModal } from "./ViewQuoteModal";
import { ViewAllocationModal } from "@/components/leads/ViewAllocationModal";
import {
  getQuoteTableStatusLabel,
  formatQuoteValidDateCell,
  formatQuoteFollowUpCell,
} from "@/lib/quotes-display";
import { QuoteStatusBadge } from "./QuoteStatusBadge";

interface QuoteTableProps {
  opportunities: Opportunity[];
  selectedId: string | null;
  onRowClick: (opp: Opportunity) => void;
}

export function QuoteTable({ opportunities, selectedId, onRowClick }: QuoteTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <table className="w-full text-left text-xs text-slate-700 min-w-[1320px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80">
            <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">
              Status
            </th>
            <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">
              Urgency
            </th>
            <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">
              Alloc.
            </th>
            <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-slate-500 min-w-[140px]">
              Opportunity
            </th>
            <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">
              Quote ID
            </th>
            <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">
              Valid till
            </th>
            <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">
              Total
            </th>
            <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">
              Contact
            </th>
            <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">
              Company
            </th>
            <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">
              Business
            </th>
            <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">
              SKUs
            </th>
            <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">
              Shipping
            </th>
            <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-slate-500 min-w-[100px]">
              Reject reason
            </th>
            <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">
              Owner
            </th>
            <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">
              Ref
            </th>
            <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">
              Next action
            </th>
            <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">
              Action by
            </th>
            <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap sticky right-0 bg-slate-50/80 border-l border-slate-200 shadow-[-4px_0_8px_rgba(0,0,0,0.04)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {opportunities.length === 0 ? (
            <tr>
              <td colSpan={18} className="px-4 py-12 text-center text-sm text-slate-400">
                No quotes match the current filters.
              </td>
            </tr>
          ) : (
            opportunities.map((opp) => (
              <QuoteTableRow
                key={opp.id}
                opportunity={opp}
                isSelected={selectedId === opp.id}
                onRowClick={onRowClick}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function QuoteTableRow({
  opportunity: opp,
  isSelected,
  onRowClick,
}: {
  opportunity: Opportunity;
  isSelected: boolean;
  onRowClick: (opp: Opportunity) => void;
}) {
  const { allocations } = useCRMShell();
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showAllocModal, setShowAllocModal] = useState(false);

  const quoteData = opp.quoteData;
  if (!quoteData) return null;

  const allocationRecord = opp.allocationId
    ? allocations.find((a) => a.id === opp.allocationId) ?? null
    : null;
  const hasAllocation = !!(opp.procurementAllocation || allocationRecord);

  const statusLabel = getQuoteTableStatusLabel(opp);

  return (
    <>
      <tr
        onClick={() => onRowClick(opp)}
        className={`border-b border-slate-100 cursor-pointer transition-colors ${
          isSelected ? "bg-[#002f93]/8 hover:bg-[#002f93]/12" : "hover:bg-slate-50/80"
        }`}
      >
        <td className="px-3 py-2.5 align-middle">
          <QuoteStatusBadge label={statusLabel} />
        </td>
        <td className="px-3 py-2.5 align-middle whitespace-nowrap font-medium">
          {quoteData.urgency}
        </td>
        <td className="px-3 py-2.5 align-middle whitespace-nowrap">
          {hasAllocation ? (
            <span className="text-emerald-700 font-semibold">Yes</span>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </td>
        <td className="px-3 py-2.5 align-middle max-w-[200px]">
          <span className="font-semibold text-slate-900 line-clamp-2">{opp.opportunityName}</span>
        </td>
        <td className="px-3 py-2.5 align-middle font-mono text-[11px] text-[#002f93] whitespace-nowrap">
          {quoteData.quoteId ?? "—"}
        </td>
        <td className="px-3 py-2.5 align-middle whitespace-nowrap">
          {formatQuoteValidDateCell(quoteData.validDate)}
        </td>
        <td className="px-3 py-2.5 align-middle whitespace-nowrap font-semibold">
          {quoteData.grandTotal}
        </td>
        <td className="px-3 py-2.5 align-middle max-w-[120px] truncate" title={quoteData.contactName}>
          {quoteData.contactName}
        </td>
        <td className="px-3 py-2.5 align-middle max-w-[120px] truncate" title={opp.companyName}>
          {opp.companyName}
        </td>
        <td className="px-3 py-2.5 align-middle whitespace-nowrap">
          {quoteData.businessType}
        </td>
        <td className="px-3 py-2.5 align-middle tabular-nums">{quoteData.items.length}</td>
        <td className="px-3 py-2.5 align-middle max-w-[100px] truncate" title={quoteData.shippingMethod}>
          {quoteData.shippingMethod}
        </td>
        <td className="px-3 py-2.5 align-middle max-w-[140px]">
          {opp.quoteStatus === "rejected" && opp.quoteRejectionReason ? (
            <span className="line-clamp-2 text-red-700 text-[11px]" title={opp.quoteRejectionReason}>
              {opp.quoteRejectionReason}
            </span>
          ) : (
            <span className="text-slate-300">—</span>
          )}
        </td>
        <td className="px-3 py-2.5 align-middle whitespace-nowrap">{opp.assignedTo}</td>
        <td className="px-3 py-2.5 align-middle text-slate-500 whitespace-nowrap">
          {opp.opportunityRef}
        </td>
        <td className="px-3 py-2.5 align-middle whitespace-nowrap text-[11px]">
          {formatQuoteFollowUpCell(quoteData.followUpDate)}
        </td>
        <td className="px-3 py-2.5 align-middle whitespace-nowrap">
          {opp.quoteDecisionBy?.trim() ? (
            <span className="font-medium text-slate-800">{opp.quoteDecisionBy}</span>
          ) : (
            <span className="text-slate-300">—</span>
          )}
        </td>
        <td
          className="px-3 py-2 sticky right-0 bg-white border-l border-slate-100 shadow-[-4px_0_8px_rgba(0,0,0,0.04)] align-middle"
          style={
            isSelected
              ? { backgroundColor: "rgba(0, 47, 147, 0.06)" }
              : undefined
          }
        >
          <div className="flex flex-col gap-1.5 min-w-[150px]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowQuoteModal(true);
              }}
              className="flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-semibold rounded-md bg-[#002f93] text-white hover:bg-[#001f6b] transition-colors"
            >
              <Eye size={11} />
              View Quote
            </button>
            {allocationRecord && canDownloadAllocationExport(allocationRecord.status) && (
              <DownloadAllocationButton
                record={allocationRecord}
                stopPropagation
                size="sm"
                className="w-full justify-center py-1 text-[11px]"
              />
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (allocationRecord) setShowAllocModal(true);
              }}
              disabled={!allocationRecord}
              title={
                allocationRecord ? "Open allocation details" : "No linked allocation record"
              }
              className="flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-semibold rounded-md border border-[#002f93]/25 text-[#002f93] hover:bg-[#002f93]/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <PackageSearch size={11} />
              View Allocation
            </button>
          </div>
        </td>
      </tr>

      {showQuoteModal && (
        <ViewQuoteModal opportunity={opp} onClose={() => setShowQuoteModal(false)} />
      )}
      {showAllocModal && allocationRecord && (
        <ViewAllocationModal
          allocation={allocationRecord}
          onClose={() => setShowAllocModal(false)}
        />
      )}
    </>
  );
}
