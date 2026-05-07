/**
 * Account-centric contract/order history rows for account detail UI.
 *
 * allocationId — When allocation mock data exists, reuse these ids as
 * AllocationRecord.id and set AllocationRecord.linkedAccountId to match accountId.
 * Example: allocation id alloc-demo-001 ↔ account Pinnacle Health Group A-45633.
 */

export type AccountHistoryPaymentTerms = "Net 30" | "Net 60" | "Prepaid";

export interface AccountHistoryRecord {
  id: string;
  accountId: string;
  contractId: string;
  productDetails: string;
  totalPricing: number;
  paymentTerms: AccountHistoryPaymentTerms;
  allocationId?: string;
}

export const INITIAL_ACCOUNT_HISTORY: AccountHistoryRecord[] = [
  {
    id: "ah-001",
    accountId: "A-45633",
    contractId: "CTR-9010",
    productDetails:
      "Wound dressings bundle · foam island (SKU-WD-200) qty 480; compression kits (SKU-CK-08) qty 120",
    totalPricing: 28450.0,
    paymentTerms: "Net 30",
    allocationId: "alloc-demo-001",
  },
  {
    id: "ah-002",
    accountId: "A-45210",
    contractId: "CTR-9011",
    productDetails: "Diagnostics reagent panel SKU-RX-440 · 24 cartons LabStart annual commitment",
    totalPricing: 18720.5,
    paymentTerms: "Net 60",
    allocationId: "alloc-demo-002",
  },
  {
    id: "ah-003",
    accountId: "A-44987",
    contractId: "CTR-9001",
    productDetails:
      "OR suite hardware — surgical display mounts (SKU-MNT-441) qty 4; integrated video hubs (SKU-HUB-12) qty 2",
    totalPricing: 8461.0,
    paymentTerms: "Net 30",
  },
  {
    id: "ah-004",
    accountId: "A-44762",
    contractId: "CTR-9002",
    productDetails:
      "Patient monitoring — vital signs modules (SKU-VS-900) qty 12; nurse station licenses (SKU-NS-LIC) qty 3",
    totalPricing: 7140.0,
    paymentTerms: "Net 60",
  },
  {
    id: "ah-005",
    accountId: "A-44530",
    contractId: "CTR-9012",
    productDetails: "Rehabilitation therapy tables (SKU-RT-500) qty 18; parallel bars install package",
    totalPricing: 42100.0,
    paymentTerms: "Prepaid",
  },
  {
    id: "ah-006",
    accountId: "A-44310",
    contractId: "CTR-9013",
    productDetails: "Ambulatory surgery consumables — sterile drapes (SKU-SD-22) qty 2000; minor instrument trays",
    totalPricing: 9630.75,
    paymentTerms: "Net 30",
  },
  {
    id: "ah-007",
    accountId: "A-44105",
    contractId: "CTR-9014",
    productDetails: "Lab imaging consumables pilot — contrast-safe tubing sets (SKU-CT-77) qty 500",
    totalPricing: 8920.0,
    paymentTerms: "Net 60",
  },
  {
    id: "ah-008",
    accountId: "A-44001",
    contractId: "CTR-9003",
    productDetails: "Sterile procedure kits (SKU-SK-55) qty 50 · consumables pilot agreement",
    totalPricing: 625.0,
    paymentTerms: "Prepaid",
  },
  {
    id: "ah-009",
    accountId: "A-43588",
    contractId: "CTR-9015",
    productDetails: "Hospital ward supply — infusion pump consumables (SKU-IP-C10) qty 96; spike sets",
    totalPricing: 15440.0,
    paymentTerms: "Net 30",
  },
];

export function getAccountHistoryByAccountId(accountId: string): AccountHistoryRecord[] {
  return INITIAL_ACCOUNT_HISTORY.filter((row) => row.accountId === accountId);
}
