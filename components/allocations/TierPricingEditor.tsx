"use client";

import { TierPrice } from "@/lib/types";
import { RotateCcw } from "lucide-react";

interface TierPricingEditorProps {
  tiers: TierPrice[];
  onChange: (updated: TierPrice[]) => void;
}

export function TierPricingEditor({ tiers, onChange }: TierPricingEditorProps) {
  function handlePriceChange(idx: number, value: string) {
    const num = parseFloat(value);
    if (isNaN(num) && value !== "") return;
    const next = tiers.map((t, i) =>
      i === idx ? { ...t, userPrice: isNaN(num) ? 0 : num } : t
    );
    onChange(next);
  }

  function resetAll() {
    onChange(tiers.map((t) => ({ ...t, userPrice: t.suggestedPrice })));
  }

  function isModified(t: TierPrice) {
    return t.userPrice !== t.suggestedPrice;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Tier Pricing</p>
        <button
          type="button"
          onClick={resetAll}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-[#002f93] transition-colors"
        >
          <RotateCcw size={11} />
          Reset to Suggested
        </button>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[80px_1fr_1fr_32px] bg-slate-50 border-b border-slate-200 px-3 py-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Range</span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Suggested</span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Your Price</span>
          <span />
        </div>

        {tiers.map((tier, idx) => (
          <div
            key={tier.rangeLabel}
            className="grid grid-cols-[80px_1fr_1fr_32px] items-center px-3 py-2.5 border-b border-slate-100 last:border-0"
          >
            {/* Range */}
            <span className="text-[13px] font-semibold text-slate-700">{tier.rangeLabel}</span>

            {/* Suggested */}
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] text-slate-600">${tier.suggestedPrice.toFixed(2)}</span>
              <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                Suggested
              </span>
            </div>

            {/* Editable price */}
            <div className="relative max-w-[120px]">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={tier.userPrice}
                onChange={(e) => handlePriceChange(idx, e.target.value)}
                className="w-full pl-5 pr-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93] text-slate-800 font-medium"
              />
            </div>

            {/* Reset single row */}
            {isModified(tier) ? (
              <button
                type="button"
                onClick={() => handlePriceChange(idx, String(tier.suggestedPrice))}
                className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-[#002f93] transition-colors"
                title="Reset this tier"
              >
                <RotateCcw size={11} />
              </button>
            ) : (
              <span className="w-6" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
