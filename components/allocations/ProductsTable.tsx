"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { AllocationProduct, TierPrice } from "@/lib/types";
import { ExpandedProductRow } from "./ExpandedProductRow";
import { cn } from "@/lib/utils";

interface ProductsTableProps {
  products: AllocationProduct[];
  onProductsChange: (updated: AllocationProduct[]) => void;
}

function AvailabilityBadge({ available }: { available: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border",
        available
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-red-50 text-red-600 border-red-200"
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", available ? "bg-emerald-500" : "bg-red-500")} />
      {available ? "Available" : "Not Available"}
    </span>
  );
}

export function ProductsTable({ products, onProductsChange }: ProductsTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleRow(sku: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(sku) ? next.delete(sku) : next.add(sku);
      return next;
    });
  }

  function handleTierChange(sku: string, updatedTiers: TierPrice[]) {
    onProductsChange(
      products.map((p) => (p.sku === sku ? { ...p, tierPrices: updatedTiers } : p))
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[40px_120px_1fr_160px_160px] border-b border-slate-100 bg-slate-50/60">
        <div />
        <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">SKU</div>
        <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Product Name</div>
        <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Required Qty</div>
        <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Status</div>
      </div>

      {products.map((product) => {
        const isAvailable = product.inventory.qtyAvailable >= product.requiredQty;
        const isOpen = expanded.has(product.sku);

        return (
          <div key={product.sku} className="border-b border-slate-100 last:border-0">
            {/* Row */}
            <div
              onClick={() => toggleRow(product.sku)}
              className={cn(
                "grid grid-cols-[40px_120px_1fr_160px_160px] items-center cursor-pointer transition-colors",
                isOpen ? "bg-blue-50/30" : "hover:bg-slate-50/60"
              )}
            >
              {/* Expand toggle */}
              <div className="flex items-center justify-center py-3.5">
                {isOpen
                  ? <ChevronDown size={15} className="text-[#002f93]" />
                  : <ChevronRight size={15} className="text-slate-400" />
                }
              </div>

              <div className="px-4 py-3.5 text-xs font-mono font-semibold text-slate-600">
                {product.sku}
              </div>
              <div className="px-4 py-3.5 text-sm font-medium text-slate-800">
                {product.productName}
              </div>
              <div className="px-4 py-3.5 text-sm text-slate-700 font-semibold">
                {product.requiredQty.toLocaleString()}
                <span className="text-xs text-slate-400 font-normal ml-1">{product.inventory.uom}</span>
              </div>
              <div className="px-4 py-3.5">
                <AvailabilityBadge available={isAvailable} />
              </div>
            </div>

            {/* Expanded content */}
            {isOpen && (
              <ExpandedProductRow
                product={product}
                onTierChange={(tiers) => handleTierChange(product.sku, tiers)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
