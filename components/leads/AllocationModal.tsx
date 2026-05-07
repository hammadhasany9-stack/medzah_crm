"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { ShoppingCart, CalendarDays, X, Plus, Trash2, AlertCircle, Search, ChevronDown } from "lucide-react";
import type { Lead, ProductRow } from "@/lib/types";
import { mockProducts, ProductCatalogItem } from "@/lib/mock-data/products";
import { getAccountById } from "@/lib/mock-data/accounts";

export interface AllocationModalResult {
  dueDate: string;
  products: ProductRow[];
}

export interface AllocationModalProps {
  /** Pre-selected lead (e.g. kanban drag). Omit when `selectableLeads` is provided. */
  lead?: Lead;
  /** When set, user searches and picks a lead before entering products (allocation list). */
  selectableLeads?: Lead[];
  onSave: (result: AllocationModalResult, lead: Lead) => void;
  onCancel: () => void;
}

function resolveAccountName(lead: Lead): string {
  if (lead.customerType === "existing" && lead.linkedAccountId) {
    return getAccountById(lead.linkedAccountId)?.name ?? lead.accountName ?? lead.companyName;
  }
  return lead.accountName ?? lead.companyName;
}

function leadMatchesQuery(lead: Lead, q: string): boolean {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  return (
    lead.id.toLowerCase().includes(s) ||
    lead.leadRef.toLowerCase().includes(s) ||
    lead.contactName.toLowerCase().includes(s) ||
    lead.companyName.toLowerCase().includes(s) ||
    lead.accountName.toLowerCase().includes(s) ||
    resolveAccountName(lead).toLowerCase().includes(s)
  );
}

function LeadPickRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <span className="text-[13px] font-semibold text-slate-800">{value || "—"}</span>
    </div>
  );
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

export function AllocationModal({ lead, selectableLeads, onSave, onCancel }: AllocationModalProps) {
  const pickMode = !!(selectableLeads && selectableLeads.length > 0);
  const [leadQuery, setLeadQuery] = useState("");
  const [leadOpen, setLeadOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(pickMode ? null : lead ?? null);
  const leadComboRef = useRef<HTMLDivElement>(null);

  const dateRef = useRef<HTMLInputElement>(null);
  const [dueDate, setDueDate] = useState(addDays(2));
  const [products, setProducts] = useState<ExtendedProductRow[]>([{ id: uid(), name: "", quantity: "" }]);
  const [attempted, setAttempted] = useState(false);

  const effectiveLead = pickMode ? selectedLead : lead;
  const filledProducts = products.filter((r) => r.name.trim() !== "");
  const hasProducts = filledProducts.length > 0;

  const filteredLeads = useMemo(() => {
    if (!selectableLeads?.length) return [];
    return selectableLeads.filter((l) => leadMatchesQuery(l, leadQuery));
  }, [selectableLeads, leadQuery]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (leadComboRef.current && !leadComboRef.current.contains(e.target as Node)) {
        setLeadOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!pickMode || !selectedLead?.id) return;
    setProducts([{ id: uid(), name: "", quantity: "" }]);
    setDueDate(addDays(2));
    setAttempted(false);
  }, [pickMode, selectedLead?.id]);

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
    if (pickMode && !effectiveLead) return;
    if (!hasProducts) return;
    if (!effectiveLead) return;
    onSave(
      {
        dueDate,
        products: filledProducts.map(({ id, name, quantity, sku, uom, unitPrice }) => ({
          id,
          name,
          quantity,
          sku,
          uom,
          unitPrice,
        })),
      },
      effectiveLead
    );
  }

  const showProductError = attempted && !hasProducts;
  const showLeadPickError = attempted && pickMode && !effectiveLead;

  const customerTypeResolved = effectiveLead?.customerType ?? "new";
  const customerLabel =
    effectiveLead &&
    (customerTypeResolved === "existing" ? "Existing customer" : "New customer");

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
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
          <div className="text-center -mt-1 w-full">
            <h2 className="text-xl font-bold text-slate-900">Start Allocation</h2>
            {pickMode && !effectiveLead ? (
              <p className="text-sm text-slate-500 mt-0.5">Select a lead, then add products.</p>
            ) : effectiveLead ? (
              <>
                <p className="text-sm text-slate-500 mt-0.5">
                  Moving <span className="font-semibold text-slate-700">{effectiveLead.contactName}</span> to Allocation
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {customerLabel}
                  {customerTypeResolved === "existing" && resolveAccountName(effectiveLead)
                    ? ` · ${resolveAccountName(effectiveLead)}`
                    : customerTypeResolved === "new" && effectiveLead.companyName
                      ? ` · ${effectiveLead.companyName}`
                      : ""}
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-500 mt-0.5">Add products and save the allocation.</p>
            )}
          </div>

          {pickMode && (
            <div className="w-full border-t border-slate-100 pt-4 flex flex-col gap-3">
              <div ref={leadComboRef} className="relative w-full">
                <p className="text-[12px] text-slate-600 font-medium mb-1.5">
                  Lead ID <span className="text-red-500">*</span>
                </p>
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={selectedLead ? `${selectedLead.leadRef} · ${selectedLead.contactName}` : leadQuery}
                    onChange={(e) => {
                      setSelectedLead(null);
                      setLeadQuery(e.target.value);
                      setLeadOpen(true);
                    }}
                    onFocus={() => setLeadOpen(true)}
                    placeholder="Search by lead ref, ID, name, company…"
                    className={`w-full pl-7 pr-7 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93] placeholder:text-slate-400 transition-colors ${
                      showLeadPickError ? "border-red-300 bg-red-50/40" : "border-slate-200"
                    }`}
                  />
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                {leadOpen && (
                  <div className="absolute z-[80] top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                    <div className="max-h-[200px] overflow-y-auto">
                      {filteredLeads.length === 0 ? (
                        <p className="px-3 py-2.5 text-[12px] text-slate-400">No leads match your search</p>
                      ) : (
                        filteredLeads.map((l) => (
                          <button
                            key={l.id}
                            type="button"
                            onMouseDown={() => {
                              setSelectedLead(l);
                              setLeadQuery("");
                              setLeadOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                          >
                            <p className="text-[13px] font-semibold text-slate-800">{l.leadRef}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {l.contactName} · {l.companyName || "—"}
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {showLeadPickError && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <AlertCircle size={13} className="flex-shrink-0" />
                  Select a lead before saving.
                </div>
              )}

              {effectiveLead && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  <LeadPickRow label="Lead reference" value={effectiveLead.leadRef} />
                  <LeadPickRow label="Internal ID" value={effectiveLead.id} />
                  <LeadPickRow label="Lead owner" value={effectiveLead.assignedTo} />
                  <LeadPickRow
                    label="Customer type"
                    value={effectiveLead.customerType === "existing" ? "Existing" : "New"}
                  />
                  {effectiveLead.customerType === "existing" ? (
                    <>
                      <LeadPickRow label="Account name" value={resolveAccountName(effectiveLead)} />
                      <LeadPickRow label="Contact name" value={effectiveLead.contactName} />
                    </>
                  ) : (
                    <>
                      <LeadPickRow label="Contact name" value={effectiveLead.contactName} />
                      <LeadPickRow label="Company" value={effectiveLead.companyName} />
                      {effectiveLead.contactTitle?.trim() ? (
                        <LeadPickRow label="Title" value={effectiveLead.contactTitle} />
                      ) : null}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Product rows */}
          <div
            className={`w-full border-t border-slate-100 pt-4 flex flex-col gap-4 ${
              pickMode && !effectiveLead ? "opacity-40 pointer-events-none" : ""
            }`}
          >
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
              {showProductError && (
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
