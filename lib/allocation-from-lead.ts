import type { Lead, AllocationRecord, AllocationProduct, InventoryItem, ProductRow } from "@/lib/types";
import { mockProducts } from "@/lib/mock-data/products";
import { getAccountById } from "@/lib/mock-data/accounts";

/** Display format for follow-up text (matches leads kanban). */
export function formatAllocationFollowUpDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y.slice(2)}`;
}

export interface AllocationModalInput {
  dueDate: string;
  products: ProductRow[];
}

export function buildAllocationRecord(lead: Lead, modalResult: AllocationModalInput): AllocationRecord {
  const { products, dueDate } = modalResult;
  const customerType = lead.customerType ?? "new";
  const linkedAccount =
    customerType === "existing" && lead.linkedAccountId ? getAccountById(lead.linkedAccountId) : null;

  const today = new Date();
  const createdDate = today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const allocId = `alloc-${Date.now()}`;
  const refNum = `ALO-${10100 + Math.floor(Math.random() * 9000)}`;

  const allocProducts: AllocationProduct[] = products.map((p, idx) => {
    const basePrice = p.unitPrice ?? 10 + idx * 3;
    const catalogEntry = p.sku
      ? mockProducts.find((c) => c.sku === p.sku)
      : mockProducts.find((c) => c.productName.toLowerCase() === p.name.toLowerCase());
    const inv: InventoryItem = {
      sku: p.sku ?? `SKU-${String(idx + 1).padStart(3, "0")}`,
      productName: p.name,
      manufacturerName: "TBD",
      qtyAvailable: catalogEntry?.qtyAvailable ?? 0,
      uom: p.uom ?? catalogEntry?.uom ?? "Each",
      uomConversions: "N/A",
      cost: +(basePrice * 0.6).toFixed(2),
      price: +basePrice.toFixed(2),
    };
    return {
      sku: inv.sku,
      productName: p.name,
      requiredQty: Number(p.quantity) || 0,
      inventory: inv,
      tierPrices: [
        { rangeLabel: "1–50", suggestedPrice: basePrice, userPrice: basePrice },
        { rangeLabel: "50–100", suggestedPrice: +(basePrice * 0.95).toFixed(2), userPrice: +(basePrice * 0.95).toFixed(2) },
        { rangeLabel: "100–500", suggestedPrice: +(basePrice * 0.9).toFixed(2), userPrice: +(basePrice * 0.9).toFixed(2) },
        { rangeLabel: "500+", suggestedPrice: +(basePrice * 0.85).toFixed(2), userPrice: +(basePrice * 0.85).toFixed(2) },
      ],
    };
  });

  return {
    id: allocId,
    allocationRef: refNum,
    leadId: lead.id,
    customerType,
    ...(linkedAccount ? { linkedAccountId: linkedAccount.id } : {}),
    contactName: lead.contactName,
    companyName: linkedAccount?.name ?? lead.companyName,
    email: lead.email,
    phone: lead.phone,
    location: lead.location ?? "",
    businessType: lead.businessType,
    leadSource: lead.leadSource,
    leadPriority: lead.priority,
    totalProducts: products.length,
    ownerName: lead.assignedTo,
    nextStepAction: `Follow-up on ${formatAllocationFollowUpDate(dueDate)}`,
    dueDate: `${dueDate}T09:00:00`,
    status: "Pending",
    createdDate,
    products: allocProducts,
  };
}
