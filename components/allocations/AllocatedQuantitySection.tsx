"use client";

import { AllocationRecord } from "@/lib/types";
import { otherApprovedRowsForSku } from "@/lib/allocation-committed-qty";
import { cn } from "@/lib/utils";

interface AllocatedQuantitySectionProps {
  currentAllocation: AllocationRecord;
  allAllocations: AllocationRecord[];
}

export function AllocatedQuantitySection({
  currentAllocation,
  allAllocations,
}: AllocatedQuantitySectionProps) {
  const blocks = currentAllocation.products
    .map((product) => ({
      product,
      rows: otherApprovedRowsForSku(
        allAllocations,
        currentAllocation.id,
        product.sku
      ),
    }))
    .filter((b) => b.rows.length > 0);

  if (blocks.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-base font-bold text-slate-900">Allocated Quantity</p>
        <p className="text-xs text-slate-500 mt-0.5">
          Other approved allocations for the same products (inventory commitments)
        </p>
      </div>

      {blocks.map(({ product, rows }) => (
        <div key={product.sku} className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {product.sku}
            <span className="font-semibold normal-case text-slate-700 ml-2">
              {product.productName}
            </span>
          </p>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_140px] border-b border-slate-100 bg-slate-50/60">
              <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                Customer name
              </div>
              <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                Company name
              </div>
              <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                Quantity
              </div>
            </div>
            {rows.map((row) => (
              <div
                key={`${row.allocationId}-${product.sku}`}
                className={cn(
                  "grid grid-cols-[1fr_1fr_140px] border-b border-slate-100 last:border-0",
                  "items-center"
                )}
              >
                <div className="px-4 py-3.5 text-sm font-medium text-slate-800">
                  {row.contactName || "—"}
                </div>
                <div className="px-4 py-3.5 text-sm text-slate-700">
                  {row.companyName || "—"}
                </div>
                <div className="px-4 py-3.5 text-sm font-semibold text-slate-800 text-right">
                  {row.quantity.toLocaleString()}
                  <span className="text-xs text-slate-400 font-normal ml-1">
                    {product.inventory.uom}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
