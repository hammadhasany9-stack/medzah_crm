"use client";

import { useMemo } from "react";
import { getAccountHistoryByAccountId } from "@/lib/mock-data/account-history";

export function AccountHistorySection({ accountId }: { accountId?: string }) {
  const rows = useMemo(
    () => (accountId ? getAccountHistoryByAccountId(accountId) : []),
    [accountId]
  );

  const formatUsd = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }),
    []
  );

  if (!accountId) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-100 overflow-x-auto bg-slate-50/40">
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500 px-4 py-10 text-center">
          No contract history for this account yet.
        </p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-500 px-4 py-3">
                Contract ID
              </th>
              <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-500 px-4 py-3">
                Product details
              </th>
              <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-500 px-4 py-3 whitespace-nowrap">
                Total pricing
              </th>
              <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-500 px-4 py-3 whitespace-nowrap">
                Payment terms
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 last:border-0">
                <td className="align-middle px-4 py-3.5 text-sm text-slate-800 font-semibold whitespace-nowrap">
                  {row.contractId}
                </td>
                <td className="align-middle px-4 py-3.5 text-sm text-slate-700 max-w-xl">
                  {row.productDetails}
                </td>
                <td className="align-middle px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">
                  {formatUsd.format(row.totalPricing)}
                </td>
                <td className="align-middle px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">
                  {row.paymentTerms}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
