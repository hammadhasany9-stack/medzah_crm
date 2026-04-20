"use client";

import { useMemo, useState, useEffect } from "react";
import { AllocationFilterBar } from "@/components/allocations/AllocationFilterBar";
import { AllocationTable } from "@/components/allocations/AllocationTable";
import { DateRange } from "@/components/accounts/DateRangePicker";
import { useCRMShell } from "@/components/shell/CRMShellContext";

export default function AllocationPage() {
  const { allocations, setAllocations } = useCRMShell();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Sync from localStorage on every mount to pick up allocations
    // added from the leads page (in case context propagation was delayed)
    try {
      const raw = localStorage.getItem("medzah_crm_allocations_v2");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > allocations.length) {
          setAllocations(parsed);
        }
      }
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [source,    setSource]    = useState("");
  const [owner,     setOwner]     = useState("");
  const [priority,  setPriority]  = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [dateLabel, setDateLabel] = useState("Date Range");
  const [search,    setSearch]    = useState("");

  function handleClear() {
    setSource(""); setOwner(""); setPriority("");
    setDateRange({ start: null, end: null }); setDateLabel("Date Range");
    setSearch("");
  }

  const filtered = useMemo(() => {
    return allocations.filter((r) => {
      if (source   && r.leadSource   !== source)   return false;
      if (owner    && r.ownerName    !== owner)    return false;
      if (priority && r.leadPriority !== priority) return false;
      if (dateRange.start) {
        const created = new Date(r.createdDate);
        if (created < dateRange.start) return false;
      }
      if (dateRange.end) {
        const created = new Date(r.createdDate);
        if (created > dateRange.end) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const skuMatch = r.products.some(
          (p) => p.sku.toLowerCase().includes(q) || p.productName.toLowerCase().includes(q)
        );
        if (
          !r.contactName.toLowerCase().includes(q) &&
          !r.companyName.toLowerCase().includes(q) &&
          !skuMatch
        ) return false;
      }
      return true;
    });
  }, [allocations, source, owner, priority, dateRange, search]);

  return (
    <div className="flex flex-col gap-5 p-6 min-h-full">
      <AllocationFilterBar
        source={source}
        owner={owner}
        priority={priority}
        dateRange={dateRange}
        dateLabel={dateLabel}
        search={search}
        recordCount={mounted ? filtered.length : 0}
        totalCount={mounted ? allocations.length : 0}
        onSourceChange={setSource}
        onOwnerChange={setOwner}
        onPriorityChange={setPriority}
        onDateChange={(range, label) => { setDateRange(range); setDateLabel(label); }}
        onSearchChange={setSearch}
        onClear={handleClear}
      />

      <AllocationTable records={mounted ? filtered : []} />
    </div>
  );
}
