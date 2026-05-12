import type { Lead } from "@/lib/types";

/** Maps legacy allocation pipeline statuses so leads remain visible after allocation columns were removed. */
export function normalizeLeadForRemovedAllocationStages(lead: Lead): Lead {
  if (lead.status !== "Allocation" && lead.status !== "Allocation on hold") {
    return lead;
  }
  return {
    ...lead,
    status: "Contacted",
    procurementStatus: undefined,
    procurementProducts: undefined,
  };
}

export function normalizeLeadsList(leads: Lead[]): Lead[] {
  return leads.map(normalizeLeadForRemovedAllocationStages);
}
