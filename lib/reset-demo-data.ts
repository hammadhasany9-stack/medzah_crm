import type { Contract, Opportunity, Lead, AllocationRecord } from "@/lib/types";
import { mockOpportunities } from "@/lib/mock-data/opportunities";
import { mockLeads } from "@/lib/mock-data/leads";
import { mockAllocations } from "@/lib/mock-data/allocations";
import { INITIAL_ACCOUNTS, saveAccounts } from "@/lib/mock-data/accounts";
import { INITIAL_CONTACTS, saveContacts } from "@/lib/mock-data/contacts";
import { INITIAL_CUSTOMER_INTAKES, saveCustomerIntakes } from "@/lib/mock-data/customer-intake";
import { mockProducts, saveProducts } from "@/lib/mock-data/products";
import { INITIAL_CONTRACTS, saveContracts } from "@/lib/mock-data/contracts";

const OPPS_KEY = "medzah_crm_opportunities_v2";
const LEADS_KEY = "medzah_crm_leads_v2";
const ALLOCATIONS_KEY = "medzah_crm_allocations_v2";
/** Legacy key still read by opportunity and quote routes */
const LEGACY_OPPS_KEY = "crmOpportunities";

function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

/**
 * Writes fresh mock snapshots to all CRM demo localStorage keys used by the app.
 */
export function writeDemoDataToStorage(): void {
  if (typeof window === "undefined") return;

  const opportunities = clone(mockOpportunities) as Opportunity[];
  const leads = clone(mockLeads) as Lead[];
  const allocations = clone(mockAllocations) as AllocationRecord[];

  try {
    localStorage.setItem(OPPS_KEY, JSON.stringify(opportunities));
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
    localStorage.setItem(ALLOCATIONS_KEY, JSON.stringify(allocations));
    localStorage.setItem(LEGACY_OPPS_KEY, JSON.stringify(opportunities));
    saveAccounts(clone(INITIAL_ACCOUNTS));
    saveContacts(clone(INITIAL_CONTACTS));
    saveCustomerIntakes(clone(INITIAL_CUSTOMER_INTAKES));
    saveProducts(clone(mockProducts));
    saveContracts(clone(INITIAL_CONTRACTS) as Contract[]);
  } catch {
    // ignore quota / privacy mode
  }
}

/** Resets persisted demo data and reloads so every screen reads the baseline again. */
export function resetDemoAndReload(): void {
  writeDemoDataToStorage();
  window.location.reload();
}
