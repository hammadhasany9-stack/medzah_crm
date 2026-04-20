import type {
  Contract,
  ContractLineItem,
  ContractStatus,
  Opportunity,
  QuoteData,
} from "@/lib/types";

export const CONTRACTS_STORAGE_KEY = "medzah_crm_contracts_v1";

function lineFromQuoteItem(
  id: string,
  productName: string,
  quantity: string,
  listPrice: string,
  amount: string,
  tierPricingNote?: string
): ContractLineItem {
  const skuMatch = /\(([^)]+)\)\s*$/.exec(productName);
  const sku = skuMatch ? skuMatch[1] : "";
  const nameOnly = skuMatch ? productName.replace(/\s*\([^)]+\)\s*$/, "").trim() : productName;
  return {
    id,
    sku,
    productName: nameOnly,
    quantity,
    listPrice,
    amount,
    tierPricingNote,
  };
}

export function lineItemsFromQuoteData(q: QuoteData | undefined): ContractLineItem[] {
  if (!q?.items?.length) return [];
  return q.items.map((it, i) =>
    lineFromQuoteItem(
      it.id || `row-${i}`,
      it.productName,
      it.quantity,
      it.listPrice,
      it.amount
    )
  );
}

export function customerSnapshotFromOpportunity(o: Opportunity): Contract["customer"] {
  const q = o.quoteData;
  const addr = q
    ? [q.billingStreet, q.billingCity, q.billingState, q.billingCode, q.billingCountry]
        .filter(Boolean)
        .join(", ")
    : "";
  return {
    accountName: o.accountName,
    contactName: o.contactName,
    companyDetails: [o.companyName, addr].filter(Boolean).join(" · "),
  };
}

export const INITIAL_CONTRACTS: Contract[] = (() => {
  const t0 = "2026-04-18T15:30:00.000Z";
  const t1 = "2026-04-12T11:00:00.000Z";

  const lumOppId = "opp-seed-lumina";
  const merOppId = "opp-seed-meridian";
  const capOppId = "opp-seed-capstone";

  const pending: Contract = {
    id: "contract-pending-001",
    contractRef: "CTR-9001",
    status: "pending_approval",
    name: "Lumina OR Suite supply agreement",
    type: "Supply & Service",
    term: "1 year",
    effectiveDate: "2026-05-01",
    effectiveAt: "2026-05-01T08:00:00.000Z",
    opportunityId: lumOppId,
    quoteId: "Q-2026-1001",
    accountName: "Lumina Architecture",
    contactName: "Alara Kalila",
    customer: {
      accountName: "Lumina Architecture",
      contactName: "Alara Kalila",
      companyDetails:
        "Lumina Architecture · 1200 Peachtree St NE, Atlanta, GA 30309, United States",
    },
    lineItems: [
      lineFromQuoteItem(
        "li-1",
        "Surgical display mount (SKU-MNT-441)",
        "4",
        "890.00",
        "3560.00",
        "Tier 5+: 3% off list"
      ),
      lineFromQuoteItem(
        "li-2",
        "Integrated video hub SKU-HUB-12",
        "2",
        "2450.50",
        "4901.00"
      ),
    ],
    paymentMethod: "ACH / wire",
    paymentDue: "Net 30",
    advancePayment: "10% on contract execution",
    latePaymentPenalty: "1.5% monthly on overdue balance",
    deliveryTimeline: "First drop within 45 days of PO",
    deliveryMethod: "Freight — dock delivery",
    shippingResponsibility: "Seller",
    partialDeliveryAllowed: true,
    quoteValidityDays: "30 days",
    priceLockDuration: "90 days from effective date",
    returnPolicy: "Defective goods RMA within 14 days; restocking fee 15% otherwise.",
    cancellationTerms: "Either party may terminate with 60 days notice; hardware non-cancelable after ship.",
    warranty: "12 months parts & labor from installation sign-off.",
    liabilityLimitations: "Seller liability capped at fees paid in prior 12 months; no consequential damages.",
    customPricingNotes: "Volume tier reviewed annually at renewal.",
    discounts: "Additional 2% for annual prepay (optional).",
    contractSpecificAgreements: "Training day included with first shipment (max 4 attendees).",
    createdAt: t0,
    updatedAt: t0,
  };

  const approved: Contract = {
    id: "contract-approved-001",
    contractRef: "CTR-9002",
    status: "approved",
    name: "Meridian patient monitoring MSA",
    type: "Master Service",
    term: "6 months",
    effectiveDate: "2026-06-01",
    effectiveAt: "2026-06-01T09:15:00.000Z",
    opportunityId: merOppId,
    quoteId: "Q-2026-1002",
    accountName: "Meridian Healthcare Group",
    contactName: "Dr. Priya Sharma",
    customer: {
      accountName: "Meridian Healthcare Group",
      contactName: "Dr. Priya Sharma",
      companyDetails:
        "Meridian Healthcare Group · 500 N Michigan Ave, Chicago, IL 60611, United States",
    },
    lineItems: [
      lineFromQuoteItem("li-m1", "Vital signs module SKU-VS-900", "12", "320.00", "3840.00"),
      lineFromQuoteItem("li-m2", "Nurse station license SKU-NS-LIC", "3", "1100.00", "3300.00"),
    ],
    paymentMethod: "Credit card / invoice",
    paymentDue: "Net 45",
    advancePayment: "None",
    latePaymentPenalty: "1% after 10 days past due",
    deliveryTimeline: "Staggered rollout per facility plan",
    deliveryMethod: "Standard Shipping",
    shippingResponsibility: "Buyer",
    partialDeliveryAllowed: false,
    quoteValidityDays: "45 days",
    priceLockDuration: "60 days",
    returnPolicy: "Software licenses non-returnable; hardware DOA 30 days.",
    cancellationTerms: "Annual auto-renew unless notice 90 days prior.",
    warranty: "24 months hardware; software updates included.",
    liabilityLimitations: "Cap at contract value; carve-out for gross negligence.",
    customPricingNotes: "CPI adjustment capped at 3% YoY.",
    discounts: "Bundle discount already in quote total.",
    contractSpecificAgreements: "Uptime SLA 99.5% measured monthly.",
    sellerName: "Kevin Calamari",
    buyerName: "Dr. Priya Sharma",
    sellerSignedAt: "2026-04-14T16:20:00.000Z",
    buyerSignedAt: "2026-04-15T10:05:00.000Z",
    createdAt: t1,
    updatedAt: "2026-04-15T10:05:00.000Z",
  };

  const draft: Contract = {
    id: "contract-draft-001",
    contractRef: "CTR-9003",
    status: "draft",
    name: "Capstone consumables pilot agreement",
    type: "Pilot",
    term: "3 months",
    effectiveDate: "2026-07-15",
    effectiveAt: undefined,
    opportunityId: capOppId,
    quoteId: "Q-2026-1003",
    accountName: "Capstone Medical",
    contactName: "Marcus Webb",
    customer: {
      accountName: "Capstone Medical",
      contactName: "Marcus Webb",
      companyDetails: "Capstone Medical · 88 Federal St, Boston, MA 02110, United States",
    },
    lineItems: [lineFromQuoteItem("li-c1", "Sterile kit SKU-SK-55", "50", "12.50", "625.00")],
    paymentMethod: "Invoice",
    paymentDue: "Net 15",
    advancePayment: "None",
    latePaymentPenalty: "",
    deliveryTimeline: "TBD — pickup",
    deliveryMethod: "Customer Pickup",
    shippingResponsibility: "Buyer",
    partialDeliveryAllowed: true,
    quoteValidityDays: "30 days",
    priceLockDuration: "30 days",
    returnPolicy: "",
    cancellationTerms: "",
    warranty: "",
    liabilityLimitations: "",
    customPricingNotes: "Pilot pricing under review.",
    discounts: "",
    contractSpecificAgreements: "",
    createdAt: "2026-04-19T08:00:00.000Z",
    updatedAt: "2026-04-19T08:00:00.000Z",
  };

  return [pending, approved, draft];
})();

/** Maps persisted or legacy values onto canonical ContractStatus (e.g. "pending" → pending_approval). */
export function normalizeContractStatus(raw: string | undefined | null): ContractStatus {
  if (raw == null || raw === "") return "draft";
  const t = raw.toLowerCase().trim().replace(/\s+/g, "_");
  if (t === "pending" || t === "pending_approval") return "pending_approval";
  if (t === "approved") return "approved";
  if (t === "draft") return "draft";
  return "draft";
}

export function normalizeContractRecord(c: Contract): Contract {
  return { ...c, status: normalizeContractStatus(String(c.status ?? "")) };
}

function mapStoredContracts(list: Contract[]): Contract[] {
  return list.map(normalizeContractRecord);
}

export function loadContracts(): Contract[] {
  if (typeof window === "undefined") return mapStoredContracts(INITIAL_CONTRACTS);
  try {
    const raw = localStorage.getItem(CONTRACTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Contract[];
      if (Array.isArray(parsed) && parsed.length > 0) return mapStoredContracts(parsed);
    }
  } catch {
    // ignore
  }
  return mapStoredContracts(INITIAL_CONTRACTS);
}

export function saveContracts(contracts: Contract[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(contracts));
  } catch {
    // ignore
  }
}

export function getContractById(id: string): Contract | null {
  return loadContracts().find((c) => c.id === id) ?? null;
}

/** Generate next display ref CTR-#### given existing contracts */
export function nextContractRef(contracts: Contract[]): string {
  let max = 9000;
  for (const c of contracts) {
    const m = /^CTR-(\d+)$/i.exec(c.contractRef);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `CTR-${max + 1}`;
}

export function buildNewContract(contracts: Contract[]): Contract {
  const id = `contract-${Math.random().toString(36).slice(2, 11)}`;
  const now = new Date().toISOString();
  const day = now.slice(0, 10);
  return {
    id,
    contractRef: nextContractRef(contracts),
    status: "draft",
    name: "",
    type: "Supply & Service",
    term: "1 year",
    effectiveDate: day,
    effectiveAt: `${day}T12:00:00.000Z`,
    opportunityId: "",
    quoteId: "",
    accountName: "",
    contactName: "",
    customer: { accountName: "", contactName: "", companyDetails: "" },
    lineItems: [],
    paymentMethod: "",
    paymentDue: "Net 30",
    advancePayment: "",
    latePaymentPenalty: "",
    deliveryTimeline: "",
    deliveryMethod: "",
    shippingResponsibility: "Seller",
    partialDeliveryAllowed: false,
    quoteValidityDays: "30 days",
    priceLockDuration: "",
    returnPolicy: "",
    cancellationTerms: "",
    warranty: "",
    liabilityLimitations: "",
    customPricingNotes: "",
    discounts: "",
    contractSpecificAgreements: "",
    createdAt: now,
    updatedAt: now,
  };
}
