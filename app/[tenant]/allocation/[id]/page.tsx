"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useTenantRouter, useTenant } from "@/components/providers/TenantProvider";
import { Package } from "lucide-react";
import {
  AllocationProduct,
  AllocationRecord,
  LeadAllocationRejection,
  LeadStatus,
} from "@/lib/types";
import { useCRMShell } from "@/components/shell/CRMShellContext";
import { AllocationDetailHeader } from "@/components/allocations/AllocationDetailHeader";
import { CustomerInfoCard } from "@/components/allocations/CustomerInfoCard";
import { ProductsTable } from "@/components/allocations/ProductsTable";
import { OnHoldModal, OnHoldModalResult } from "@/components/allocations/OnHoldModal";
import {
  RejectAllocationModal,
  type RejectAllocationModalResult,
} from "@/components/allocations/RejectAllocationModal";

export default function AllocationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { tenant } = useTenant();
  const router = useTenantRouter();
  const { allocations, setAllocations, setLeads } = useCRMShell();
  const isKevinReadOnly = tenant === "kevin";

  const [showHoldModal, setShowHoldModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const record = allocations.find((a) => a.id === id) ?? null;

  const [localProducts, setLocalProducts] = useState<AllocationProduct[] | null>(null);

  const products = useMemo(() => {
    if (!record) return [];
    if (isKevinReadOnly) return record.products;
    return localProducts ?? record.products;
  }, [record, isKevinReadOnly, localProducts]);

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

  function updateAllocationStatus(
    patch: Partial<AllocationRecord>,
    leadPatch?: {
      status?: LeadStatus;
      procurementStatus?: "checking" | "approved";
      allocationRejection?: LeadAllocationRejection;
    }
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

  function handleRejectSubmit(result: RejectAllocationModalResult) {
    updateAllocationStatus(
      {
        status: "Rejected",
        rejectionCategory: result.category,
        rejectionDetail: result.detail,
      },
      {
        status: "Inactive",
        allocationRejection: {
          category: result.category,
          detail: result.detail,
        },
      }
    );
    setShowRejectModal(false);
  }

  return (
    <>
      <div className="flex flex-col gap-5 p-6 min-h-full">
        <AllocationDetailHeader
          record={allocation}
          exportRecord={{ ...allocation, products }}
          unavailableCount={unavailableCount}
          onApprove={handleApprove}
          onPartiallyApprove={handlePartiallyApprove}
          onHold={() => setShowHoldModal(true)}
          onReject={() => setShowRejectModal(true)}
          showProcurementActions={!isKevinReadOnly}
          showExport={!isKevinReadOnly}
        />

        <CustomerInfoCard record={allocation} />

        {allocation.status === "On Hold" && allocation.onHoldNotes && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 text-sm text-amber-800">
            <span className="font-bold">Hold note: </span>{allocation.onHoldNotes}
          </div>
        )}

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
            onProductsChange={isKevinReadOnly ? undefined : (updated) => setLocalProducts(updated)}
            readOnly={isKevinReadOnly}
          />
        </div>
      </div>

      {!isKevinReadOnly && showHoldModal && (
        <OnHoldModal
          unavailableCount={unavailableCount}
          onSubmit={handleHoldSubmit}
          onCancel={() => setShowHoldModal(false)}
        />
      )}

      {!isKevinReadOnly && showRejectModal && (
        <RejectAllocationModal
          onSubmit={handleRejectSubmit}
          onCancel={() => setShowRejectModal(false)}
        />
      )}
    </>
  );
}
