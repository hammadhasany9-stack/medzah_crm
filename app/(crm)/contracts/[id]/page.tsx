"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  Mail,
} from "lucide-react";
import { useCRMShell } from "@/components/shell/CRMShellContext";
import { contractStatusLabel } from "@/components/contracts/contract-format";
import { ContractPrintDocument } from "@/components/contracts/ContractPrintDocument";
import { cn } from "@/lib/utils";

export default function ContractViewPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { contracts } = useCRMShell();

  const c = useMemo(
    () => contracts.find((x) => x.id === id) ?? null,
    [contracts, id]
  );

  function sendCustomer() {
    window.alert("Contract sent to customer (demo).");
  }

  if (!c) {
    return (
      <div className="p-6 space-y-3">
        <p className="text-sm text-slate-600">Contract not found.</p>
        <Link href="/contracts" className="text-sm font-semibold text-[#002f93] hover:underline">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-area {
            background: white !important;
          }
        }
      `}</style>

      <div className="print-area max-w-4xl mx-auto w-full p-6 pb-24 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 no-print">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/contracts")}
              className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">{c.name}</h1>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border",
                    c.status === "approved" && "bg-emerald-50 border-emerald-200 text-emerald-800",
                    c.status === "pending_approval" && "bg-amber-50 border-amber-200 text-amber-800",
                    c.status === "draft" && "bg-slate-50 border-slate-200 text-slate-600"
                  )}
                >
                  {c.status === "approved" ? (
                    <CheckCircle2 size={12} />
                  ) : (
                    <Clock size={12} />
                  )}
                  {contractStatusLabel(c.status)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">{c.contractRef}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            {c.status === "approved" && (
              <>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Download size={14} /> Download contract
                </button>
                <button
                  type="button"
                  onClick={sendCustomer}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Mail size={14} /> Send to customer
                </button>
              </>
            )}
          </div>
        </div>

        <ContractPrintDocument c={c} signatureMode="filled" />
      </div>
    </>
  );
}
