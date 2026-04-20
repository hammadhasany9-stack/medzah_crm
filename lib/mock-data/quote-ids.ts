import type { Opportunity } from "@/lib/types";

const PATTERN = /^Q-(\d{4})-(\d+)$/;

/**
 * Next system Quote ID (Q-YYYY-NNNN) based on existing opportunities' quoteData.quoteId values.
 */
export function generateNextQuoteId(opportunities: Opportunity[], year = new Date().getFullYear()): string {
  let max = 1000;
  for (const o of opportunities) {
    const qid = o.quoteData?.quoteId?.trim();
    if (!qid) continue;
    const m = PATTERN.exec(qid);
    if (!m) continue;
    const y = parseInt(m[1], 10);
    const n = parseInt(m[2], 10);
    if (y === year && !Number.isNaN(n)) max = Math.max(max, n);
  }
  return `Q-${year}-${max + 1}`;
}
