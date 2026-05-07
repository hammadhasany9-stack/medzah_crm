import type {
  AllocationProduct,
  AllocationRecord,
  AllocationRecordStatus,
} from "@/lib/types";

/**
 * Units that count for a line when exporting or summing “committed” quantity.
 * Matches historical Excel export: Partially Approved caps at snapshot availability;
 * Rejected is zero; otherwise full required qty (including Pending in export sheets).
 */
export function committedQuantity(
  product: AllocationProduct,
  status: AllocationRecordStatus
): number {
  if (status === "Partially Approved") {
    return Math.min(
      product.requiredQty,
      Math.max(0, product.inventory.qtyAvailable)
    );
  }
  if (status === "Rejected") {
    return 0;
  }
  return product.requiredQty;
}

const COUNTS_TOWARD_INVENTORY: Set<AllocationRecordStatus> = new Set([
  "Approved",
  "Partially Approved",
]);

export function totalCommittedForSku(
  allocations: AllocationRecord[],
  sku: string
): number {
  let sum = 0;
  for (const a of allocations) {
    if (!COUNTS_TOWARD_INVENTORY.has(a.status)) continue;
    const line = a.products.find((p) => p.sku === sku);
    if (!line) continue;
    sum += committedQuantity(line, a.status);
  }
  return sum;
}

export interface AllocatedQuantityRow {
  allocationId: string;
  contactName: string;
  companyName: string;
  quantity: number;
}

export function otherApprovedRowsForSku(
  allocations: AllocationRecord[],
  currentAllocationId: string,
  sku: string
): AllocatedQuantityRow[] {
  const rows: AllocatedQuantityRow[] = [];
  for (const a of allocations) {
    if (a.id === currentAllocationId) continue;
    if (!COUNTS_TOWARD_INVENTORY.has(a.status)) continue;
    const line = a.products.find((p) => p.sku === sku);
    if (!line) continue;
    const quantity = committedQuantity(line, a.status);
    if (quantity <= 0) continue;
    rows.push({
      allocationId: a.id,
      contactName: a.contactName,
      companyName: a.companyName,
      quantity,
    });
  }
  return rows;
}
