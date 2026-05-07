import type { Opportunity } from "@/lib/types";
import {
  getQuoteTableStatusLabel,
  QUOTE_STATUS_LABEL_APPROVED_ADJ,
} from "@/lib/quotes-display";

/** Default owner when a card is in the shared Pending lane (not a team assignee). */
export const KANBAN_DEFAULT_ASSIGNEE = "Kevin Calamari";

export function quoteKanbanDroppableId(kind: "status" | "owner", key: string): string {
  return `quote-col-${kind}-${key}`;
}

/** True when assigned to Denise / Walsh / Mark (same rules as kanban owner columns). */
export function isKanbanTeamAssignee(o: Opportunity): boolean {
  const a = (o.assignedTo ?? "").toLowerCase();
  return a.includes("denise") || a.includes("walsh") || a.includes("mark");
}

function columnStatusKeyForOpp(o: Opportunity): "pending" | "approvedAdj" | "rejected" {
  const label = getQuoteTableStatusLabel(o);
  if (label === "Rejected") return "rejected";
  if (label === "Approved" || label === QUOTE_STATUS_LABEL_APPROVED_ADJ) return "approvedAdj";
  return "pending";
}

const OWNER_NAMES: Record<string, string> = {
  denise: "Denise",
  walsh: "David Walsh",
  mark: "Mark",
};

/** Quote document owner (creator) — only normalized when missing or wrongly equal to handoff target. */
function normalizedQuoteOwnerForTeamHandoff(o: Opportunity, handoffTargetName: string): string {
  const cur = o.quoteData?.opportunityOwner?.trim() ?? "";
  const snapshot =
    (o.assignedTo?.trim() && !isKanbanTeamAssignee(o)
      ? o.assignedTo.trim()
      : KANBAN_DEFAULT_ASSIGNEE);
  if (!cur || cur === handoffTargetName) {
    return snapshot;
  }
  return cur;
}

/**
 * Applies a kanban drop target to an opportunity. Returns the same reference if nothing changes.
 */
export function applyQuoteKanbanDrop(o: Opportunity, dropId: string): Opportunity {
  if (!dropId.startsWith("quote-col-")) return o;

  if (dropId.startsWith("quote-col-status-")) {
    const key = dropId.replace("quote-col-status-", "");
    if (key !== "pending" && key !== "approvedAdj" && key !== "rejected") return o;

    if (key === "pending") {
      const inSharedPendingLane =
        o.quoteStatus === "pending" &&
        !isKanbanTeamAssignee(o) &&
        o.assignedTo === KANBAN_DEFAULT_ASSIGNEE;
      if (inSharedPendingLane) return o;

      return {
        ...o,
        quoteStatus: "pending",
        quoteRevised: false,
        quoteRejectionReason: undefined,
        quoteDecisionBy: undefined,
        assignedTo: KANBAN_DEFAULT_ASSIGNEE,
      };
    }

    if (key === "approvedAdj") {
      /* Pending quotes use Approve / Adjust modals from the board drop handler. */
      if (o.quoteStatus === "pending") return o;
      if (columnStatusKeyForOpp(o) === key) return o;
      return {
        ...o,
        quoteStatus: "approved",
        quoteAdjusted: false,
        quoteRevised: false,
        quoteRejectionReason: undefined,
      };
    }
    if (key === "rejected") {
      if (o.quoteStatus === "pending") return o;
      if (columnStatusKeyForOpp(o) === key) return o;
      return {
        ...o,
        quoteStatus: "rejected",
        quoteRejectionReason: o.quoteRejectionReason ?? "Updated on board",
      };
    }
    return o;
  }

  if (dropId.startsWith("quote-col-owner-")) {
    const key = dropId.replace("quote-col-owner-", "");
    const name = OWNER_NAMES[key];
    if (!name) return o;

    const frozenOwner = o.quoteData
      ? normalizedQuoteOwnerForTeamHandoff(o, name)
      : undefined;
    const nextQuoteData =
      o.quoteData && frozenOwner !== undefined && o.quoteData.opportunityOwner?.trim() !== frozenOwner
        ? { ...o.quoteData, opportunityOwner: frozenOwner }
        : o.quoteData;

    if (o.assignedTo === name && nextQuoteData === o.quoteData) {
      return o;
    }

    return {
      ...o,
      assignedTo: name,
      quoteData: nextQuoteData,
    };
  }

  return o;
}
