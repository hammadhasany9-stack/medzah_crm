import { Opportunity, OpportunityStage } from "@/lib/types";

/** Entering these stages requires an approved quote (any prior column). */
export const STAGES_REQUIRING_APPROVED_QUOTE: OpportunityStage[] = [
  "Negotiation/Review",
  "Closed Won",
  "Closed Lost",
];

/**
 * True when the card must not move to `targetStage` because the quote is not approved.
 * Applies to all source stages (e.g. Qualified → Negotiation is blocked until approved).
 */
export function isAdvanceBlockedWithoutApprovedQuote(
  opportunity: Opportunity,
  targetStage: OpportunityStage
): boolean {
  if (!STAGES_REQUIRING_APPROVED_QUOTE.includes(targetStage)) return false;
  return opportunity.quoteStatus !== "approved";
}

/** Closed Won deals with an approved quote and assigned Quote ID — used for contract/contact linking pickers. */
export function isClosedWonApprovedQuotedOpportunity(o: Opportunity): boolean {
  return (
    o.opportunityStage === "Closed Won" &&
    o.quoteStatus === "approved" &&
    !!o.quoteData &&
    !!(o.quoteData.quoteId?.trim() ?? "")
  );
}
