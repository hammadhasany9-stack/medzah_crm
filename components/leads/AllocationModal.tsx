"use client";

import { useRef, useState, useEffect } from "react";
import { ShoppingCart, CalendarDays, X, Plus, Trash2, AlertCircle, Search, ChevronDown } from "lucide-react";
import { ProductRow } from "@/lib/types";
import { mockProducts, ProductCatalogItem } from "@/lib/mock-data/products";

export interface AllocationModalResult {
  dueDate: string;
  products: ProductRow[];
}

interface AllocationModalProps {
  leadName: string;
  onSave: (result: AllocationModalResult) => void;
  onCancel: () => void;
}

function addDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y.slice(2)}`;
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

interface ExtendedProductRow extends ProductRow {
  catalogItem?: ProductCatalogItem;
}

function ProductSearchRow({
  row,
  attempted,
  isOnly,
  onUpdate,
  onRemove,
}: {
  row: ExtendedProductRow;
  attempted: boolean;
  isOnly: boolean;
  onUpdate: (id: string, updates: Partial<ExtendedProductRow>) => void;
  onRemove: (id: string) => void;
}) {
  const [query, setQuery] = useState(row.name);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? mockProducts.filter(
        (p) =>
          p.productName.toLowerCase().includes(query.toLowerCase()) ||
          p.sku.toLowerCase().includes(query.toLowerCase())
      )
    : mockProducts;

  function selectProduct(p: ProductCatalogItem) {
    setQuery(p.productName);
    setOpen(false);
    onUpdate(row.id, {
      name: p.productName,
      sku: p.sku,
      uom: p.uom,
      unitPrice: p.price,
      catalogItem: p,
    });
  }

  function handleInputChange(val: string) {
    setQuery(val);
    setOpen(true);
    if (!val.trim()) {
      onUpdate(row.id, { name: "", sku: undefined, uom: undefined, unitPrice: undefined, catalogItem: undefined });
    } else {
      onUpdate(row.id, { name: val });
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isEmpty = attempted && row.name.trim() === "" && isOnly;

  return (
    <div className="grid grid-cols-[1fr_120px_90px_28px] gap-2 items-start">
      {/* Product search */}
      <div ref={ref} className="relative">
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="Search product or SKU…"
            className={`w-full pl-7 pr-7 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93] placeholder:text-slate-400 transition-colors ${
              isEmpty ? "border-red-300 bg-red-50/40" : "border-slate-200"
            }`}
          />
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* SKU tag below */}
        {row.sku && (
          <p className="text-[10px] text-slate-400 mt-0.5 pl-1">
            SKU: <span className="font-medium text-slate-600">{row.sku}</span>
            {row.uom && <> · UOM: <span className="font-medium text-slate-600">{row.uom}</span></>}
            {row.unitPrice !== undefined && <> · ${row.unitPrice.toFixed(2)}/unit</>}
          </p>
        )}

        {/* Dropdown */}
        {open && (
          <div className="absolute z-[80] top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
            <div className="max-h-[200px] overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="px-3 py-2.5 text-[12px] text-slate-400">No products found</p>
              ) : (
                filtered.map((p) => (
                  <button
                    key={p.sku}
                    type="button"
                    onMouseDown={() => selectProduct(p)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                  >
                    <p className="text-[13px] font-medium text-slate-800 leading-snug">{p.productName}</p>
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

      {/* Quantity */}
      <input
        type="number"
        value={row.quantity}
        onChange={(e) => onUpdate(row.id, { quantity: e.target.value })}
        placeholder="Qty"
        min={1}
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93] placeholder:text-slate-400"
      />

      {/* UOM display */}
      <div className="px-2 py-2 text-[12px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg truncate text-center">
        {row.uom ?? "—"}
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={() => onRemove(row.id)}
        disabled={isOnly}
        className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-red-400 disabled:opacity-0 transition-colors mt-1"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

export function AllocationModal({ leadName, onSave, onCancel }: AllocationModalProps) {
  const dateRef = useRef<HTMLInputElement>(null);
  const [dueDate, setDueDate]     = useState(addDays(2));
  const [products, setProducts]   = useState<ExtendedProductRow[]>([{ id: uid(), name: "", quantity: "" }]);
  const [attempted, setAttempted] = useState(false);

  const filledProducts = products.filter((r) => r.name.trim() !== "");
  const hasProducts    = filledProducts.length > 0;

  function addRow() {
    setProducts((p) => [...p, { id: uid(), name: "", quantity: "" }]);
  }

  function removeRow(id: string) {
    setProducts((p) => p.filter((r) => r.id !== id));
  }

  function updateRow(id: string, updates: Partial<ExtendedProductRow>) {
    setProducts((p) => p.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }

  function handleSave() {
    setAttempted(true);
    if (!hasProducts) return;
    onSave({
      dueDate,
      products: filledProducts.map(({ catalogItem: _c, ...rest }) => rest),
    });
  }

  const showError = attempted && !hasProducts;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-2xl w-[600px] mx-4 shadow-[0_24px_64px_rgba(0,0,0,0.22)] overflow-hidden max-h-[90vh] flex flex-col">

        {/* Close */}
        <div className="flex justify-end pt-4 pr-4 flex-shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-8 pb-8 flex flex-col items-center gap-4 -mt-2 overflow-y-auto">

          {/* Icon */}
          <div className="w-11 h-11 rounded-full bg-[#002f93] flex items-center justify-center shadow-md flex-shrink-0">
            <ShoppingCart size={20} strokeWidth={2.5} className="text-white" />
          </div>

          {/* Title */}
          <div className="text-center -mt-1">
            <h2 className="text-xl font-bold text-slate-900">Start Allocation</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Moving <span className="font-semibold text-slate-700">{leadName}</span> to Allocation
            </p>
          </div>

          {/* Product rows */}
          <div className="w-full border-t border-slate-100 pt-4 flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800">Add your products</p>
                  <span className="text-[11px] font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Required</span>
                </div>
                <button
                  type="button"
                  onClick={addRow}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 px-2.5 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Plus size={11} /> Add row
                </button>
              </div>

              {/* Error message */}
              {showError && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                  <AlertCircle size={13} className="flex-shrink-0" />
                  At least one product is required before saving.
                </div>
              )}

              {/* Column headers */}
              <div className="grid grid-cols-[1fr_120px_90px_28px] gap-2 mb-1.5 px-1">
                <p className="text-xs text-slate-500 font-medium">Product Name / SKU <span className="text-red-400">*</span></p>
                <p className="text-xs text-slate-500 font-medium">Required Qty</p>
                <p className="text-xs text-slate-500 font-medium text-center">UOM</p>
                <span />
              </div>

              <div className="space-y-3">
                {products.map((row) => (
                  <ProductSearchRow
                    key={row.id}
                    row={row}
                    attempted={attempted}
                    isOnly={products.length === 1}
                    onUpdate={updateRow}
                    onRemove={removeRow}
                  />
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100" />

            {/* Next action date */}
            <div className="flex flex-col items-center gap-1.5">
              <p className="text-sm font-bold text-slate-900 text-center">
                Your Next Action: Follow-up on Allocation
              </p>
              <p className="text-sm text-slate-500">Due date: +2 days ;</p>
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-slate-900">{formatDate(dueDate)}</span>
                <button
                  type="button"
                  onClick={() => dateRef.current?.showPicker()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <CalendarDays size={12} />
                  Change date
                </button>
              </div>
              <input
                ref={dateRef}
                type="date"
                value={dueDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDueDate(e.target.value)}
                className="absolute opacity-0 w-0 h-0 pointer-events-none"
              />
            </div>
          </div>

          {/* Save */}
          <button
            type="button"
            onClick={handleSave}
            className="w-full bg-[#002f93] hover:bg-[#001f6b] text-white text-sm font-semibold py-3 rounded-xl transition-colors duration-150 mt-1"
          >
            Save &amp; Move to Allocation
          </button>
        </div>
      </div>
    </div>
  );
}
