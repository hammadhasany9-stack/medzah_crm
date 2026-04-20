"use client";

import { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Package } from "lucide-react";
import { AllocationProduct, AllocationRecord, LeadStatus } from "@/lib/types";
import { useCRMShell } from "@/components/shell/CRMShellContext";
import { AllocationDetailHeader } from "@/components/allocations/AllocationDetailHeader";
import { CustomerInfoCard } from "@/components/allocations/CustomerInfoCard";
import { ProductsTable } from "@/components/allocations/ProductsTable";
import { OnHoldModal, OnHoldModalResult } from "@/components/allocations/OnHoldModal";

export default function AllocationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { allocations, setAllocations, setLeads } = useCRMShell();

  const [showHoldModal, setShowHoldModal] = useState(false);

  // Find the allocation record — use state-derived version so edits reflect live
  const record = allocations.find((a) => a.id === id) ?? null;

  // Local product state for tier price edits (not persisted to context until action taken)
  const [localProducts, setLocalProducts] = useState<AllocationProduct[] | null>(null);
  const products = localProducts ?? record?.products ?? [];

  const unavailableCount = useMemo(
    () => products.filter((p) => p.inventory.qtyAvailable < p.requiredQty).length,
    [products]
  );

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full gap-4 p-6">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
          <Package size={22} className="text-slate-400" />
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-slate-800">Allocation not found</p>
          <p className="text-sm text-slate-500 mt-1">This allocation may have been removed.</p>
        </div>
        <button
          onClick={() => router.push("/allocation")}
          className="px-4 py-2 text-sm font-semibold text-white bg-[#002f93] rounded-lg hover:bg-[#001f6b] transition-colors"
        >
          Back to Allocations
        </button>
      </div>
    );
  }

  const allocation = record;

  // ── Helper: update both allocation status and linked lead ───────────────────

  function updateAllocationStatus(
    patch: Partial<AllocationRecord>,
    leadPatch?: { status?: LeadStatus; procurementStatus?: "checking" | "approved" }
  ) {
    setAllocations((prev) =>
      prev.map((a) => (a.id === allocation.id ? { ...a, ...patch, products } : a))
    );
    if (allocation.leadId && leadPatch) {
      setLeads((prev) =>
        prev.map((l) => (l.id === allocation.leadId ? { ...l, ...leadPatch } : l))
      );
    }
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  function handleApprove() {
    updateAllocationStatus(
      { status: "Approved" },
      { procurementStatus: "approved" }
    );
  }

  function handlePartiallyApprove() {
    updateAllocationStatus(
      { status: "Partially Approved" },
      { procurementStatus: "approved" }
    );
  }

  function handleHoldSubmit(result: OnHoldModalResult) {
    const fulfillmentTime = `${result.fulfillmentValue} ${result.fulfillmentUnit}`;
    updateAllocationStatus(
      {
        status: "On Hold",
        onHoldFulfillmentTime: fulfillmentTime,
        onHoldNotes: result.notes || undefined,
      },
      { status: "Allocation on hold" as LeadStatus }
    );
    setShowHoldModal(false);
  }

  return (
    <>
      <div className="flex flex-col gap-5 p-6 min-h-full">
        {/* Header */}
        <AllocationDetailHeader
          record={allocation}
          exportRecord={{ ...allocation, products }}
          unavailableCount={unavailableCount}
          onApprove={handleApprove}
          onPartiallyApprove={handlePartiallyApprove}
          onHold={() => setShowHoldModal(true)}
        />

        {/* Customer Info */}
        <CustomerInfoCard record={allocation} />

        {/* On-hold notes banner */}
        {allocation.status === "On Hold" && allocation.onHoldNotes && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 text-sm text-amber-800">
            <span className="font-bold">Hold note: </span>{allocation.onHoldNotes}
          </div>
        )}

        {/* Products section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-base font-bold text-slate-900">Products</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {products.length} item{products.length !== 1 ? "s" : ""}
                {unavailableCount > 0 && (
                  <span className="ml-2 text-red-500 font-semibold">
                    · {unavailableCount} unavailable
                  </span>
                )}
              </p>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Click any row to expand inventory &amp; pricing details
            </span>
          </div>

          <ProductsTable
            products={products}
            onProductsChange={(updated) => setLocalProducts(updated)}
          />
        </div>
      </div>

      {showHoldModal && (
        <OnHoldModal
          unavailableCount={unavailableCount}
          onSubmit={handleHoldSubmit}
          onCancel={() => setShowHoldModal(false)}
        />
      )}
    </>
  );
}
