import { Opportunity } from "@/lib/types";

export const QUOTE_STATUS_LABEL_APPROVED_ADJ = "Approved with adjustments";

/** Single label for table, filters, and badges — matches QuoteFilterBar STATUS_OPTIONS keys. */
export function getQuoteTableStatusLabel(o: Opportunity): string {
  const s = o.quoteStatus;
  if (s === "pending") return "Pending";
  if (s === "rejected") return "Rejected";
  if (s === "approved" && o.quoteAdjusted) return QUOTE_STATUS_LABEL_APPROVED_ADJ;
  if (s === "approved") return "Approved";
  return "—";
}

export function opportunityMatchesQuoteStatusFilters(
  o: Opportunity,
  selectedLabels: string[]
): boolean {
  if (selectedLabels.length === 0) return true;
  const label = getQuoteTableStatusLabel(o);
  return selectedLabels.includes(label);
}

/** Display format aligned with QuoteCard ValidDateDisplay. */
export function formatQuoteValidDateCell(validDate: string | undefined): string {
  if (!validDate) return "—";
  const [y, m, d] = validDate.split("T")[0].split("-");
  return `${m}/${d}/${y} ; 21:00`;
}

/** Short follow-up label aligned with QuoteCard formatDueLabel. */
export function formatQuoteFollowUpCell(isoDate: string | undefined): string {
  if (!isoDate) return "No action set";
  const due = new Date(isoDate);
  const now = new Date();
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Due Today";
  if (diffDays === 1) return "Due Tomorrow";
  if (diffDays <= 3) return `Due in ${diffDays}d`;
  const m = due.toLocaleString("default", { month: "short" });
  return `Due ${m} ${due.getDate()}`;
}
