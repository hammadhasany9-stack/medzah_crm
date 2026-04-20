export type UrgencyLevel = "High" | "Medium" | "Low";
export type Priority = "Hot" | "Warm" | "Cold";
export type ProcurementStatus = "checking" | "approved";

export interface ProductRow {
  id: string;
  name: string;
  quantity: string;
  sku?: string;
  uom?: string;
  unitPrice?: number;
}

export type LeadStatus =
  | "New"
  | "Attempted Contact"
  | "Contacted"
  | "Allocation"
  | "Qualified"
  | "Allocation on hold"
  | "Inactive";

export interface ActivityEvent {
  id: string;
  type: "email" | "call" | "note" | "created";
  title: string;
  description: string;
  timestamp: string;
}

export interface Lead {
  id: string;
  leadRef: string;
  title: string;
  status: LeadStatus;
  urgency: UrgencyLevel;
  priority: Priority;
  contactName: string;
  contactAvatar?: string;
  companyName: string;
  assignedTo: string;
  callDue?: string;
  reason?: string;
  reasonNote?: string;
  procurementStatus?: ProcurementStatus;
  procurementProducts?: ProductRow[];
  opportunityData?: OpportunityData;
  allocationId?: string;
  opportunityId?: string;
  location?: string;
  contactTitle?: string;
  customerFor?: string;
  email: string;
  phone: string;
  validTill: string;
  expectedRevenue: string;
  grandTotal: string;
  subject: string;
  opportunityOwner: string;
  accountName: string;
  pipeline: string;
  businessType: string;
  leadSource: string;
  skusQuantity: string;
  shippingMethod: string;
  createdDate: string;
  note: string;
  activities: ActivityEvent[];
}

export interface OpportunityData {
  opportunityName: string;
  accountName: string;
  businessType: string;
  closingDate: string;
  contactName: string;
  pipeline: string;
  expectedRevenue: string;
  amount: string;
  campaignSource: string;
  description: string;
  followUpDate: string;
  leadPriority: Priority;
}

export type OpportunityStage =
  | "Qualified"
  | "Proposal/Price Quote"
  | "Negotiation/Review"
  | "Closed Won"
  | "Closed Lost";

export type QuoteStatus = "none" | "pending" | "approved" | "rejected";

export type AllocationStatus = "approved" | "partially_approved";

export interface AllocationItem {
  productName: string;
  requestedQty: number;
  approvedQty: number;
}

export interface ProcurementAllocation {
  status: AllocationStatus;
  approvedDate: string;
  approvedBy: string;
  fileName: string;
  fileSize: string;
  refNumber: string;
  notes?: string;
  items: AllocationItem[];
}

export interface QuoteRecord {
  id: string;
  quoteData: QuoteData;
  status: QuoteStatus;
  rejectionReason?: string;
  archivedAt: string;
}

export interface QuoteItem {
  id: string;
  productName: string;
  quantity: string;
  listPrice: string;
  amount: string;
  description: string;
}

export interface QuoteData {
  subject: string;
  accountName: string;
  businessType: string;
  urgency: string;
  opportunityOwner: string;
  opportunityName: string;
  quoteStage: string;
  validDate: string;
  contactName: string;
  shippingMethod: string;
  customerPO: string;
  orderSubmittalMethod: string;
  orderNotes: string;
  billingStreet: string;
  billingCity: string;
  billingState: string;
  billingCode: string;
  billingCountry: string;
  shippingStreet: string;
  shippingCity: string;
  shippingState: string;
  shippingCode: string;
  shippingCountry: string;
  items: QuoteItem[];
  subtotal: string;
  discount: string;
  tax: string;
  adjustment: string;
  grandTotal: string;
  termsAndConditions: string;
  description: string;
  followUpDate: string;
  teamForApproval: string[];
  quoteId?: string;
  modifiedBy?: string;
  modifiedAt?: string;
  spreadSheet?: string;
}

export interface Opportunity {
  id: string;
  opportunityRef: string;
  opportunityName: string;
  accountName: string;
  businessType: string;
  closingDate: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  pipeline: string;
  expectedRevenue: string;
  amount: string;
  campaignSource: string;
  description: string;
  note: string;
  leadSource: string;
  createdDate: string;
  leadPriority: Priority;
  opportunityStage: OpportunityStage;
  assignedTo: string;
  companyName: string;
  activities: ActivityEvent[];
  quoteStatus?: QuoteStatus;
  quoteData?: QuoteData;
  quoteAdjusted?: boolean;
  /** True when quote was re-submitted from Negotiation via Revise Quote (awaiting approval). */
  quoteRevised?: boolean;
  quoteRejectionReason?: string;
  quoteHistory?: QuoteRecord[];
  procurementAllocation?: ProcurementAllocation;
  leadId?: string;
  allocationId?: string;
}

// ─── Contract types ───────────────────────────────────────────────────────────

export type ContractStatus = "draft" | "pending_approval" | "approved";

export interface ContractCustomerSnapshot {
  accountName: string;
  contactName: string;
  companyDetails: string;
}

export interface ContractLineItem {
  id: string;
  sku: string;
  productName: string;
  quantity: string;
  listPrice: string;
  amount: string;
  tierPricingNote?: string;
}

export interface Contract {
  id: string;
  contractRef: string;
  status: ContractStatus;
  name: string;
  type: string;
  term: string;
  effectiveDate: string;
  /** ISO datetime for list column “Effective From” */
  effectiveAt?: string;
  opportunityId: string;
  quoteId: string;
  accountName: string;
  contactName: string;
  customer: ContractCustomerSnapshot;
  lineItems: ContractLineItem[];
  paymentMethod: string;
  paymentDue: string;
  advancePayment: string;
  latePaymentPenalty: string;
  deliveryTimeline: string;
  deliveryMethod: string;
  shippingResponsibility: "Seller" | "Buyer";
  partialDeliveryAllowed: boolean;
  quoteValidityDays: string;
  priceLockDuration: string;
  returnPolicy: string;
  cancellationTerms: string;
  warranty: string;
  liabilityLimitations: string;
  customPricingNotes: string;
  discounts: string;
  contractSpecificAgreements: string;
  sellerName?: string;
  buyerName?: string;
  sellerSignedAt?: string;
  buyerSignedAt?: string;
  /** Typed e-signature captured when approving on the contract approval screen */
  approverEsignature?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KanbanColumn {
  id: LeadStatus;
  label: string;
  accentColor: string;
  emptyText: string;
}

export interface SourceColumn {
  id: string;
  label: string;
  badgeColor: string;
  iconName?: string;
}

// ─── Allocation types ─────────────────────────────────────────────────────────

export type AllocationRecordStatus =
  | "Pending"
  | "Approved"
  | "Partially Approved"
  | "On Hold";

export interface TierPrice {
  rangeLabel: string;
  suggestedPrice: number;
  userPrice: number;
}

export interface InventoryItem {
  sku: string;
  productName: string;
  manufacturerName: string;
  qtyAvailable: number;
  uom: string;
  uomConversions: string;
  cost: number;
  price: number;
}

export interface AllocationProduct {
  sku: string;
  productName: string;
  requiredQty: number;
  inventory: InventoryItem;
  tierPrices: TierPrice[];
}

export interface AllocationRecord {
  id: string;
  allocationRef: string;
  leadId?: string;
  contactName: string;
  companyName: string;
  email: string;
  phone: string;
  location: string;
  businessType: string;
  leadSource: string;
  leadPriority: Priority;
  totalProducts: number;
  ownerName: string;
  nextStepAction: string;
  dueDate?: string;
  status: AllocationRecordStatus;
  createdDate: string;
  onHoldFulfillmentTime?: string;
  onHoldNotes?: string;
  products: AllocationProduct[];
}
