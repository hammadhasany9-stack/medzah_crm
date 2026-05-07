/** Parse a currency or numeric string to a finite number (0 if invalid). */
export function parseMoneyAmount(s: string): number {
  const n = parseFloat(String(s).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export const OVERHEAD_INFRASTRUCTURE_PERCENT = 25;

export interface QuoteFeeComputation {
  overheadInfrastructurePercent: string;
  overheadAmount: string;
  salesCommissionAmount: string;
  /** Product grand total + overhead + commission (same as finalQuoteTotal; kept for callers that expect this key). */
  subtotalBeforeFreight: string;
  finalQuoteTotal: string;
}

/** Overhead fixed at 25% of product grand total; commission % of same base. */
export function computeQuoteFeeAmounts(
  productGrandTotalStr: string,
  commissionPercentStr: string
): QuoteFeeComputation {
  const gt = parseMoneyAmount(productGrandTotalStr);
  const overheadAmt = gt * (OVERHEAD_INFRASTRUCTURE_PERCENT / 100);
  const commPct = parseFloat(String(commissionPercentStr).replace(/[^0-9.-]/g, ""));
  const commPctSafe = Number.isFinite(commPct) ? commPct : 0;
  const commAmt = gt * (commPctSafe / 100);
  const total = gt + overheadAmt + commAmt;
  const totalStr = total.toFixed(2);
  return {
    overheadInfrastructurePercent: String(OVERHEAD_INFRASTRUCTURE_PERCENT),
    overheadAmount: overheadAmt.toFixed(2),
    salesCommissionAmount: commAmt.toFixed(2),
    subtotalBeforeFreight: totalStr,
    finalQuoteTotal: totalStr,
  };
}
