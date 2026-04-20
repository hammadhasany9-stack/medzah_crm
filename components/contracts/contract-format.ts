import type { Contract, ContractStatus } from "@/lib/types";

/** True when the contract belongs on the Contract approval queue (pending internal approval only). */
export function isContractPendingApproval(c: Contract): boolean {
  return c.status === "pending_approval";
}

export function contractStatusLabel(s: ContractStatus): string {
  switch (s) {
    case "draft":
      return "Draft";
    case "pending_approval":
      return "Pending";
    case "approved":
      return "Approved";
    default:
      return s;
  }
}

/** Fixed locale so SSR (Node) and the browser produce identical strings — avoids hydration mismatches. */
const EFFECTIVE_FROM_FORMAT = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatEffectiveFrom(iso?: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return EFFECTIVE_FROM_FORMAT.format(d);
  } catch {
    return "—";
  }
}
