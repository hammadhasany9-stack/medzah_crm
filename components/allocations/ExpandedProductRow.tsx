"use client";

import { AllocationProduct, TierPrice } from "@/lib/types";
import { TierPricingEditor } from "./TierPricingEditor";
import { Package, Factory, Ruler, ArrowLeftRight, DollarSign } from "lucide-react";

interface ExpandedProductRowProps {
  product: AllocationProduct;
  onTierChange: (updatedTiers: TierPrice[]) => void;
}

function InfoItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{value}</span>
    </div>
  );
}

export function ExpandedProductRow({ product, onTierChange }: ExpandedProductRowProps) {
  const inv = product.inventory;
  const isAvailable = inv.qtyAvailable >= product.requiredQty;

  return (
    <div className="bg-slate-50/70 border-t border-slate-100 px-6 py-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Inventory Information ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-md bg-[#002f93]/10 flex items-center justify-center flex-shrink-0">
              <Package size={13} className="text-[#002f93]" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Inventory Information</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 grid grid-cols-2 gap-x-6 gap-y-4">
            <InfoItem label="SKU"               value={inv.sku} />
            <InfoItem label="Product Name"      value={inv.productName} />

            <div className="col-span-2 flex items-center gap-2">
              <Factory size={13} className="text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Manufacturer</p>
                <p className="text-sm font-semibold text-slate-800">{inv.manufacturerName}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Qty Available</p>
              <p className={`text-sm font-bold ${isAvailable ? "text-emerald-600" : "text-red-500"}`}>
                {inv.qtyAvailable.toLocaleString()} {inv.uom}
              </p>
            </div>

            <div className="flex items-start gap-2">
              <Ruler size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">UOM</p>
                <p className="text-sm font-semibold text-slate-800">{inv.uom}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 col-span-2">
              <ArrowLeftRight size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">UOM Conversions</p>
                <p className="text-sm font-semibold text-slate-800">{inv.uomConversions}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <DollarSign size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Cost</p>
                <p className="text-sm font-semibold text-slate-800">${inv.cost.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <DollarSign size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">List Price</p>
                <p className="text-sm font-semibold text-slate-800">${inv.price.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tier Pricing ── */}
        <div>
          <TierPricingEditor tiers={product.tierPrices} onChange={onTierChange} />
        </div>
      </div>
    </div>
  );
}
