"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { mockOpportunities } from "@/lib/mock-data/opportunities";
import { mockLeads } from "@/lib/mock-data/leads";
import { mockAllocations } from "@/lib/mock-data/allocations";
import { INITIAL_CONTRACTS, loadContracts, saveContracts } from "@/lib/mock-data/contracts";
import { Opportunity, Lead, AllocationRecord, Contract } from "@/lib/types";

export type OwnerTab = "my-leads" | "team";

const LEADS_KEY        = "medzah_crm_leads_v2";
const ALLOCATIONS_KEY  = "medzah_crm_allocations_v2";
const OPPS_KEY         = "medzah_crm_opportunities_v2";

function loadFromStorage<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as T[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return fallback;
}

interface CRMShellContextValue {
  ownerTab: OwnerTab;
  setOwnerTab: (tab: OwnerTab) => void;
  opportunities: Opportunity[];
  setOpportunities: React.Dispatch<React.SetStateAction<Opportunity[]>>;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  allocations: AllocationRecord[];
  setAllocations: React.Dispatch<React.SetStateAction<AllocationRecord[]>>;
  contracts: Contract[];
  setContracts: React.Dispatch<React.SetStateAction<Contract[]>>;
}

const CRMShellContext = createContext<CRMShellContextValue>({
  ownerTab: "my-leads",
  setOwnerTab: () => {},
  opportunities: mockOpportunities,
  setOpportunities: () => {},
  leads: mockLeads,
  setLeads: () => {},
  allocations: mockAllocations,
  setAllocations: () => {},
  contracts: INITIAL_CONTRACTS,
  setContracts: () => {},
});

export function CRMShellProvider({ children }: { children: React.ReactNode }) {
  const [ownerTab, setOwnerTab] = useState<OwnerTab>("my-leads");
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() =>
    loadFromStorage<Opportunity>(OPPS_KEY, mockOpportunities)
  );
  const [leads, setLeads] = useState<Lead[]>(() =>
    loadFromStorage<Lead>(LEADS_KEY, mockLeads)
  );
  const [allocations, setAllocations] = useState<AllocationRecord[]>(() =>
    loadFromStorage<AllocationRecord>(ALLOCATIONS_KEY, mockAllocations)
  );
  const [contracts, setContracts] = useState<Contract[]>(() => INITIAL_CONTRACTS);
  /** When false, skip persisting — avoids writing seed data over localStorage before rehydrate. */
  const [contractsRehydrated, setContractsRehydrated] = useState(false);

  // Rehydrate from localStorage after mount (SSR/hydration cannot read storage in initial state).
  useEffect(() => {
    setContracts(loadContracts());
    setContractsRehydrated(true);
  }, []);

  // Persist opportunities
  useEffect(() => {
    try {
      localStorage.setItem(OPPS_KEY, JSON.stringify(opportunities));
    } catch {
      // ignore storage errors
    }
  }, [opportunities]);

  // Persist leads
  useEffect(() => {
    try {
      localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
    } catch {
      // ignore storage errors
    }
  }, [leads]);

  // Persist allocations
  useEffect(() => {
    try {
      localStorage.setItem(ALLOCATIONS_KEY, JSON.stringify(allocations));
    } catch {
      // ignore storage errors
    }
  }, [allocations]);

  useEffect(() => {
    if (!contractsRehydrated) return;
    saveContracts(contracts);
  }, [contracts, contractsRehydrated]);

  return (
    <CRMShellContext.Provider
      value={{
        ownerTab,
        setOwnerTab,
        opportunities,
        setOpportunities,
        leads,
        setLeads,
        allocations,
        setAllocations,
        contracts,
        setContracts,
      }}
    >
      {children}
    </CRMShellContext.Provider>
  );
}

export function useCRMShell() {
  return useContext(CRMShellContext);
}
