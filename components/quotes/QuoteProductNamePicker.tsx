"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { loadProducts, type ProductCatalogItem } from "@/lib/mock-data/products";

export interface QuoteProductNamePickerProps {
  value: string;
  onValueChange: (name: string) => void;
  onSelectCatalog: (product: ProductCatalogItem) => void;
  placeholder?: string;
  inputClassName?: string;
}

export function QuoteProductNamePicker({
  value,
  onValueChange,
  onSelectCatalog,
  placeholder = "Search or pick a product…",
  inputClassName,
}: QuoteProductNamePickerProps) {
  const products = useMemo(() => loadProducts(), []);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.productName.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, value]);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const defaultInputCls =
    "w-full pl-7 pr-7 py-1.5 text-[12px] border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#002f93]/30 bg-white placeholder:text-slate-400";

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onValueChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={inputClassName ?? defaultInputCls}
        />
        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
      {open && (
        <div className="absolute z-[80] top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          <div className="max-h-[220px] overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-[12px] text-slate-400">No products found</p>
            ) : (
              filtered.map((p) => (
                <button
                  key={p.sku}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onSelectCatalog(p);
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                >
                  <p className="text-[12px] font-medium text-slate-800 leading-snug">{p.productName}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {p.sku} · {p.uom} · ${p.price.toFixed(2)}/unit · {p.category}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
