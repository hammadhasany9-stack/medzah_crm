"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, CheckCircle2, Plus, Trash2, Calendar, Upload, ChevronDown, FileSpreadsheet, DownloadCloud, RefreshCw, CheckCircle, AlertTriangle, FileText, BadgeCheck, ShieldAlert, User, CalendarDays, Hash, PackageSearch } from "lucide-react";
import { Opportunity, QuoteData, QuoteItem, ProcurementAllocation } from "@/lib/types";
import type { ProductCatalogItem } from "@/lib/mock-data/products";
import { QuoteProductNamePicker } from "@/components/quotes/QuoteProductNamePicker";
import { useCRMShell } from "@/components/shell/CRMShellContext";
import { AllocationRecordDetailContent } from "@/components/leads/ViewAllocationModal";
import * as XLSX from "xlsx";
import {
  getAccountNamesForContactsPicker,
  getAccountByName,
  type AccountRecord,
} from "@/lib/mock-data/accounts";
import { getContactDisplayNamesForQuotePicker } from "@/lib/mock-data/contacts";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

function emptyItem(): QuoteItem {
  return { id: generateId(), productName: "", quantity: "", listPrice: "", amount: "", description: "" };
}

function computeGrandTotal(items: QuoteItem[], discount: string, tax: string, adjustment: string): string {
  const subtotal = items.reduce((sum, it) => {
    const qty = parseFloat(it.quantity) || 0;
    const price = parseFloat(it.listPrice.replace(/[^0-9.]/g, "")) || 0;
    return sum + qty * price;
  }, 0);
  const disc = parseFloat(discount.replace(/[^0-9.]/g, "")) || 0;
  const taxVal = parseFloat(tax.replace(/[^0-9.]/g, "")) || 0;
  const adj = parseFloat(adjustment.replace(/[^0-9.]/g, "")) || 0;
  return (subtotal - disc + taxVal + adj).toFixed(2);
}

// ─── Field components ─────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function Input({
  value, onChange, placeholder, required, error, type = "text",
}: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  required?: boolean; error?: boolean; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2 text-[13px] text-slate-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93]/30 focus:border-[#002f93] transition-colors bg-white placeholder:text-slate-400
        ${error ? "border-red-400 bg-red-50" : "border-slate-200"}`}
    />
  );
}

function Select({
  value, onChange, options, placeholder, error,
}: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string; error?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none px-3 py-2 text-[13px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93]/30 focus:border-[#002f93] transition-colors bg-white cursor-pointer pr-8
          ${value ? "text-slate-800" : "text-slate-400"}
          ${error ? "border-red-400 bg-red-50" : "border-slate-200"}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}

function TextArea({ value, onChange, placeholder, rows = 2 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 text-[13px] text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93]/30 focus:border-[#002f93] transition-colors bg-white placeholder:text-slate-400 resize-none"
    />
  );
}

function SectionHeader({
  children,
  collapsible,
  open,
  onToggle,
}: {
  children: React.ReactNode;
  collapsible?: boolean;
  open?: boolean;
  onToggle?: () => void;
}) {
  if (collapsible) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-2 mb-3 group"
      >
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-700 transition-colors whitespace-nowrap">
          {children}
        </span>
        <div className="flex-1 h-px bg-slate-200" />
        <ChevronDown
          size={14}
          className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
        />
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{children}</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

// ─── Allocation Section ────────────────────────────────────────────────────────

function AllocationBadge({ status }: { status: ProcurementAllocation["status"] }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
        <BadgeCheck size={12} className="flex-shrink-0" />
        Approved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
      <ShieldAlert size={12} className="flex-shrink-0" />
      Partially Approved
    </span>
  );
}

function AllocationSection({ allocation }: { allocation: ProcurementAllocation }) {
  const [expanded, setExpanded] = useState(true);

  const totalRequested = allocation.items.reduce((s, i) => s + i.requestedQty, 0);
  const totalApproved  = allocation.items.reduce((s, i) => s + i.approvedQty,  0);
  const fulfilPct = totalRequested > 0 ? Math.round((totalApproved / totalRequested) * 100) : 0;

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      {/* ── Coloured top strip ── */}
      <div className={`h-1 w-full ${allocation.status === "approved" ? "bg-emerald-400" : "bg-amber-400"}`} />

      {/* ── Header row ── */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
            ${allocation.status === "approved" ? "bg-emerald-100" : "bg-amber-100"}`}>
            <FileText size={15} className={allocation.status === "approved" ? "text-emerald-600" : "text-amber-600"} />
          </div>
          <div className="text-left">
            <p className="text-[13px] font-bold text-slate-800 leading-snug">Allocation</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{allocation.fileName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <AllocationBadge status={allocation.status} />
          <ChevronDown
            size={14}
            className={`text-slate-400 transition-transform duration-200 ${expanded ? "rotate-180" : "rotate-0"}`}
          />
        </div>
      </button>

      {/* ── Expanded body ── */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-4 space-y-4">

          {/* Meta row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <Hash size={12} className="text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Ref Number</p>
                <p className="text-[12px] font-semibold text-slate-700">{allocation.refNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays size={12} className="text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Approved Date</p>
                <p className="text-[12px] font-semibold text-slate-700">{allocation.approvedDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User size={12} className="text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Approved By</p>
                <p className="text-[12px] font-semibold text-slate-700">{allocation.approvedBy}</p>
              </div>
            </div>
          </div>

          {/* Progress bar (only meaningful for partially approved) */}
          {allocation.status === "partially_approved" && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Allocation coverage</span>
                <span className="font-bold text-slate-700">{totalApproved} / {totalRequested} units ({fulfilPct}%)</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${fulfilPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Items table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="grid grid-cols-[1fr_90px_90px_80px] bg-slate-700 text-white">
              <div className="px-3 py-2 text-[11px] font-bold">Product</div>
              <div className="px-3 py-2 text-[11px] font-bold text-center">Requested</div>
              <div className="px-3 py-2 text-[11px] font-bold text-center">Approved</div>
              <div className="px-3 py-2 text-[11px] font-bold text-center">Status</div>
            </div>
            {allocation.items.map((item, i) => {
              const isFull    = item.approvedQty >= item.requestedQty;
              const isPartial = item.approvedQty > 0 && item.approvedQty < item.requestedQty;
              const isNone    = item.approvedQty === 0;
              return (
                <div
                  key={i}
                  className={`grid grid-cols-[1fr_90px_90px_80px] items-center border-t border-slate-100
                    ${i % 2 === 0 ? "bg-white" : "bg-slate-50/60"}`}
                >
                  <div className="px-3 py-2 text-[12px] text-slate-800 font-medium">{item.productName}</div>
                  <div className="px-3 py-2 text-[12px] text-slate-600 text-center">{item.requestedQty}</div>
                  <div className="px-3 py-2 text-[12px] font-semibold text-center">
                    <span className={isFull ? "text-emerald-600" : isPartial ? "text-amber-600" : "text-red-500"}>
                      {item.approvedQty}
                    </span>
                  </div>
                  <div className="px-3 py-2 flex justify-center">
                    {isFull && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        <CheckCircle size={9} /> Full
                      </span>
                    )}
                    {isPartial && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700">
                        <ShieldAlert size={9} /> Partial
                      </span>
                    )}
                    {isNone && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-600">
                        <X size={9} /> Pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Notes */}
          {allocation.notes && (
            <div className="bg-white border border-slate-200 rounded-lg px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Allocation Notes</p>
              <p className="text-[12px] text-slate-700 leading-relaxed">{allocation.notes}</p>
            </div>
          )}

          {/* File download button */}
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <FileText size={14} className="text-red-500" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-slate-800">{allocation.fileName}</p>
                <p className="text-[11px] text-slate-400">{allocation.fileSize}</p>
              </div>
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#002f93] border border-[#002f93]/20 hover:bg-[#002f93]/5 transition-colors"
            >
              <DownloadCloud size={13} />
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Quote Items Table ─────────────────────────────────────────────────────────

function QuoteItemsTable({
  items, onChange, errors,
}: {
  items: QuoteItem[];
  onChange: (items: QuoteItem[]) => void;
  errors: Record<string, boolean>;
}) {
  function updateItem(id: string, field: keyof QuoteItem, value: string) {
    onChange(
      items.map((it) => {
        if (it.id !== id) return it;
        const updated = { ...it, [field]: value };
        if (field === "quantity" || field === "listPrice") {
          const qty = parseFloat(updated.quantity) || 0;
          const price = parseFloat(updated.listPrice.replace(/[^0-9.]/g, "")) || 0;
          updated.amount = (qty * price).toFixed(2);
        }
        return updated;
      })
    );
  }

  function removeItem(id: string) {
    if (items.length === 1) return;
    onChange(items.filter((it) => it.id !== id));
  }

  function applyCatalogProduct(id: string, p: ProductCatalogItem) {
    onChange(
      items.map((it) => {
        if (it.id !== id) return it;
        const qtyStr = it.quantity.trim() ? it.quantity : "1";
        const q = parseFloat(qtyStr) || 1;
        const listPrice = p.price.toFixed(2);
        return {
          ...it,
          productName: `${p.productName} (${p.sku})`,
          quantity: qtyStr,
          listPrice,
          amount: (q * p.price).toFixed(2),
        };
      })
    );
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[32px_1fr_100px_110px_110px_36px] bg-slate-800 text-white">
        <div className="px-2 py-2.5 text-[11px] font-bold text-center">#</div>
        <div className="px-3 py-2.5 text-[11px] font-bold">Product Name (SKU)</div>
        <div className="px-3 py-2.5 text-[11px] font-bold">Quantity</div>
        <div className="px-3 py-2.5 text-[11px] font-bold">List Price</div>
        <div className="px-3 py-2.5 text-[11px] font-bold">Amount</div>
        <div className="w-9" />
      </div>

      {/* Rows */}
      {items.map((item, idx) => (
        <div key={item.id} className="border-t border-slate-100">
          <div className="grid grid-cols-[32px_1fr_100px_110px_110px_36px] items-start py-2 bg-white">
            <div className="flex items-center justify-center pt-2.5 text-[12px] text-slate-500 font-semibold">{idx + 1}</div>
            <div className="px-2 space-y-1">
              <QuoteProductNamePicker
                value={item.productName}
                onValueChange={(v) => updateItem(item.id, "productName", v)}
                onSelectCatalog={(p) => applyCatalogProduct(item.id, p)}
                placeholder="Search or pick a product"
                inputClassName={`w-full pl-7 pr-7 py-1.5 text-[12px] border rounded-md focus:outline-none focus:ring-1 focus:ring-[#002f93]/30 bg-slate-50 placeholder:text-slate-400
                  ${errors[`item-${item.id}-name`] ? "border-red-400 bg-red-50" : "border-slate-200"}`}
              />
              <textarea
                value={item.description}
                onChange={(e) => updateItem(item.id, "description", e.target.value)}
                placeholder="Add Description"
                rows={2}
                className="w-full px-2 py-1.5 text-[12px] border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#002f93]/30 bg-slate-50 placeholder:text-slate-400 resize-none"
              />
            </div>
            <div className="px-2 pt-1">
              <input
                value={item.quantity}
                onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                placeholder="Enter Quantity"
                className={`w-full px-2 py-1.5 text-[12px] border rounded-md focus:outline-none focus:ring-1 focus:ring-[#002f93]/30 bg-slate-50 placeholder:text-slate-400
                  ${errors[`item-${item.id}-qty`] ? "border-red-400 bg-red-50" : "border-slate-200"}`}
              />
            </div>
            <div className="px-2 pt-1">
              <input
                value={item.listPrice}
                onChange={(e) => updateItem(item.id, "listPrice", e.target.value)}
                placeholder="Enter Price"
                className="w-full px-2 py-1.5 text-[12px] border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#002f93]/30 bg-slate-50 placeholder:text-slate-400"
              />
            </div>
            <div className="px-2 pt-1">
              <input
                value={item.amount}
                readOnly
                placeholder="Enter Price"
                className="w-full px-2 py-1.5 text-[12px] border border-slate-200 rounded-md bg-slate-100 text-slate-600 cursor-not-allowed"
              />
            </div>
            <div className="flex items-start justify-center pt-2">
              <button
                onClick={() => removeItem(item.id)}
                disabled={items.length === 1}
                className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Add row */}
      <div className="border-t border-slate-100 px-3 py-2.5 bg-slate-50">
        <button
          onClick={() => onChange([...items, emptyItem()])}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-[#002f93] hover:text-[#001f6b] transition-colors"
        >
          <Plus size={13} />
          Add Row
        </button>
      </div>
    </div>
  );
}

// ─── XLS Upload Zone ───────────────────────────────────────────────────────────

type ParseStatus = "idle" | "parsing" | "success" | "error";

function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    ["Product Name (SKU)", "Description", "Quantity", "List Price"],
    ["Example Product A", "Sample description", "2", "150.00"],
    ["Example Product B", "", "5", "75.50"],
  ]);
  ws["!cols"] = [{ wch: 28 }, { wch: 32 }, { wch: 12 }, { wch: 14 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Quote Items");
  XLSX.writeFile(wb, "quote_items_template.xlsx");
}

function XlsUploadZone({
  onParsed,
}: {
  onParsed: (items: QuoteItem[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<ParseStatus>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [rowCount, setRowCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [previewRows, setPreviewRows] = useState<QuoteItem[]>([]);

  function parseFile(file: File) {
    setStatus("parsing");
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        // Skip header row, filter empty rows
        const dataRows = rows.slice(1).filter(
          (r) => Array.isArray(r) && r.some((c) => c !== undefined && c !== "")
        );

        if (dataRows.length === 0) {
          setStatus("error");
          setErrorMsg("The file has no data rows. Please use the template.");
          return;
        }

        const parsed: QuoteItem[] = dataRows.map((row) => {
          const productName = String(row[0] ?? "").trim();
          const description = String(row[1] ?? "").trim();
          const quantity = String(row[2] ?? "").trim();
          const listPrice = String(row[3] ?? "").trim();
          const qty = parseFloat(quantity) || 0;
          const price = parseFloat(listPrice.replace(/[^0-9.]/g, "")) || 0;
          return {
            id: Math.random().toString(36).slice(2, 9),
            productName,
            description,
            quantity,
            listPrice,
            amount: (qty * price).toFixed(2),
          };
        });

        setPreviewRows(parsed);
        setRowCount(parsed.length);
        setStatus("success");
        onParsed(parsed);
      } catch {
        setStatus("error");
        setErrorMsg("Could not parse the file. Make sure it is a valid .xlsx or .xls file.");
      }
    };
    reader.onerror = () => {
      setStatus("error");
      setErrorMsg("Failed to read the file.");
    };
    reader.readAsArrayBuffer(file);
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext ?? "")) {
      setStatus("error");
      setFileName(file.name);
      setErrorMsg("Unsupported file type. Please upload a .xlsx, .xls, or .csv file.");
      return;
    }
    parseFile(file);
  }

  function reset() {
    setStatus("idle");
    setFileName(null);
    setRowCount(0);
    setErrorMsg("");
    setPreviewRows([]);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      {/* Template download */}
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-slate-500">
          Upload a spreadsheet with your quote items. Columns must match the template.
        </p>
        <button
          type="button"
          onClick={downloadTemplate}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-[#002f93] hover:text-[#001f6b] transition-colors whitespace-nowrap"
        >
          <DownloadCloud size={13} />
          Download Template
        </button>
      </div>

      {/* Drop zone */}
      {status !== "success" && (
        <label
          className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl py-10 cursor-pointer transition-all duration-150
            ${isDragging ? "border-[#002f93] bg-blue-50/60" : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100/60"}
            ${status === "error" ? "border-red-300 bg-red-50" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {status === "idle" && (
            <>
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                <FileSpreadsheet size={22} className="text-emerald-500" />
              </div>
              <div className="text-center">
                <p className="text-[13px] font-semibold text-slate-700">
                  {isDragging ? "Drop your file here" : "Drag & drop or click to upload"}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">.xlsx, .xls, .csv — up to 10MB</p>
              </div>
            </>
          )}

          {status === "parsing" && (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-[#002f93] border-t-transparent rounded-full animate-spin" />
              <p className="text-[12px] text-slate-500">Parsing <span className="font-medium text-slate-700">{fileName}</span>…</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-2 px-6 text-center">
              <AlertTriangle size={26} className="text-red-400" />
              <p className="text-[13px] font-semibold text-red-600">{errorMsg}</p>
              <p className="text-[11px] text-slate-400">Click here or drag a new file to try again</p>
            </div>
          )}
        </label>
      )}

      {/* Success state */}
      {status === "success" && (
        <div className="space-y-3">
          {/* Success banner */}
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-[13px] font-semibold text-emerald-800">{fileName}</p>
                <p className="text-[11px] text-emerald-600 mt-0.5">
                  {rowCount} product row{rowCount !== 1 ? "s" : ""} imported successfully
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-slate-700 transition-colors"
            >
              <RefreshCw size={12} />
              Re-upload
            </button>
          </div>

          {/* Parsed preview table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1fr_100px_110px_100px] bg-slate-700 text-white">
              <div className="px-3 py-2 text-[11px] font-bold">Product Name (SKU)</div>
              <div className="px-3 py-2 text-[11px] font-bold">Quantity</div>
              <div className="px-3 py-2 text-[11px] font-bold">List Price</div>
              <div className="px-3 py-2 text-[11px] font-bold">Amount</div>
            </div>
            <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto">
              {previewRows.map((row, i) => (
                <div key={row.id} className={`grid grid-cols-[1fr_100px_110px_100px] items-center ${i % 2 === 0 ? "bg-white" : "bg-slate-50/60"}`}>
                  <div className="px-3 py-2">
                    <p className="text-[12px] font-medium text-slate-800 truncate">{row.productName || <span className="text-slate-400 italic">—</span>}</p>
                    {row.description && <p className="text-[11px] text-slate-400 truncate">{row.description}</p>}
                  </div>
                  <div className="px-3 py-2 text-[12px] text-slate-700">{row.quantity}</div>
                  <div className="px-3 py-2 text-[12px] text-slate-700">{row.listPrice}</div>
                  <div className="px-3 py-2 text-[12px] font-semibold text-slate-700">${row.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Totals row ────────────────────────────────────────────────────────────────

function TotalsSection({
  items, discount, tax, adjustment, grandTotal,
  onDiscount, onTax, onAdjustment,
}: {
  items: QuoteItem[];
  discount: string; tax: string; adjustment: string; grandTotal: string;
  onDiscount: (v: string) => void; onTax: (v: string) => void; onAdjustment: (v: string) => void;
}) {
  const subtotal = items.reduce((sum, it) => {
    const qty = parseFloat(it.quantity) || 0;
    const price = parseFloat(it.listPrice.replace(/[^0-9.]/g, "")) || 0;
    return sum + qty * price;
  }, 0);

  return (
    <div className="flex justify-end mt-3">
      <div className="w-64 space-y-1.5">
        <TotalRow label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
        <TotalRow label="Discount" value={discount} editable onEdit={onDiscount} />
        <TotalRow label="Tax" value={tax} editable onEdit={onTax} />
        <TotalRow label="Adjustment" value={adjustment} editable onEdit={onAdjustment} />
        <div className="border-t border-slate-200 pt-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[12px] font-bold text-slate-700">Grand Total</span>
            <span className="text-[14px] font-bold text-slate-900">${grandTotal}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TotalRow({ label, value, editable, onEdit }: {
  label: string; value: string; editable?: boolean; onEdit?: (v: string) => void;
}) {
  return (
    <div className="flex justify-between items-center gap-3">
      <span className="text-[12px] text-slate-600">{label}</span>
      {editable ? (
        <input
          value={value}
          onChange={(e) => onEdit?.(e.target.value)}
          placeholder="$0"
          className="w-28 px-2 py-1 text-[12px] text-right border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#002f93]/30 bg-slate-50"
        />
      ) : (
        <span className="text-[12px] font-semibold text-slate-700">{value}</span>
      )}
    </div>
  );
}

// ─── Team avatars ──────────────────────────────────────────────────────────────

const TEAM_MEMBERS = ["Amanda", "David Walsh", "Denise", "Mike"];
const AVATAR_COLORS = ["bg-purple-200 text-purple-700", "bg-blue-200 text-blue-700", "bg-pink-200 text-pink-700", "bg-amber-200 text-amber-700"];

function TeamSection() {
  return (
    <div className="flex items-center gap-8 flex-wrap">
      {TEAM_MEMBERS.map((name, i) => (
        <label key={name} className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" defaultChecked className="rounded accent-[#002f93]" />
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${AVATAR_COLORS[i]}`}>
            {name[0]}
          </div>
          <span className="text-[12px] text-slate-700">{name}</span>
        </label>
      ))}
    </div>
  );
}

// ─── Main Modal ────────────────────────────────────────────────────────────────

export interface OpportunityStageChangeModalProps {
  opportunity: Opportunity;
  onSave: (quoteData: QuoteData) => void;
  onCancel: () => void;
}

type ProposalModalDetailTab = "quote" | "allocation";

export function OpportunityStageChangeModal({ opportunity, onSave, onCancel }: OpportunityStageChangeModalProps) {
  const { allocations } = useCRMShell();
  const allocationRecord = opportunity.allocationId
    ? allocations.find((a) => a.id === opportunity.allocationId) ?? null
    : null;

  const [detailTab, setDetailTab] = useState<ProposalModalDetailTab>("quote");

  // Pre-fill from existing quoteData when available (e.g. recreating / revising a quote)
  const q = opportunity.quoteData;

  // Basic info
  const [subject, setSubject] = useState(q?.subject ?? "");
  const [accountName, setAccountName] = useState(q?.accountName ?? opportunity.accountName ?? "");
  const [businessType, setBusinessType] = useState(q?.businessType ?? opportunity.businessType ?? "");
  const [urgency, setUrgency] = useState(q?.urgency ?? "");

  // Additional info
  const [opportunityOwner, setOpportunityOwner] = useState(q?.opportunityOwner ?? opportunity.assignedTo ?? "");
  const [opportunityName, setOpportunityName] = useState(q?.opportunityName ?? opportunity.opportunityName ?? "");
  const [quoteStage, setQuoteStage] = useState(q?.quoteStage ?? "");
  const [validDate, setValidDate] = useState(q?.validDate ?? "");
  const [contactName, setContactName] = useState(q?.contactName ?? opportunity.contactName ?? "");
  const [shippingMethod, setShippingMethod] = useState(q?.shippingMethod ?? "");

  const [accountOptions, setAccountOptions] = useState<string[]>(() => {
    const acc = new Set(getAccountNamesForContactsPicker());
    const a = (q?.accountName ?? opportunity.accountName ?? "").trim();
    if (a) acc.add(a);
    return Array.from(acc).sort((x, y) => x.localeCompare(y));
  });
  const [contactOptions, setContactOptions] = useState<string[]>(() => {
    const cn = new Set(getContactDisplayNamesForQuotePicker());
    const c = (q?.contactName ?? opportunity.contactName ?? "").trim();
    if (c) cn.add(c);
    return Array.from(cn).sort((x, y) => x.localeCompare(y));
  });

  const refreshAccountContactPickers = useCallback(() => {
    const acc = new Set(getAccountNamesForContactsPicker());
    if (accountName.trim()) acc.add(accountName.trim());
    setAccountOptions(Array.from(acc).sort((a, b) => a.localeCompare(b)));
    const cn = new Set(getContactDisplayNamesForQuotePicker());
    if (contactName.trim()) cn.add(contactName.trim());
    setContactOptions(Array.from(cn).sort((a, b) => a.localeCompare(b)));
  }, [accountName, contactName]);

  useEffect(() => {
    refreshAccountContactPickers();
  }, [refreshAccountContactPickers]);

  useEffect(() => {
    function onFocus() {
      refreshAccountContactPickers();
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshAccountContactPickers]);

  const [customerPO, setCustomerPO] = useState(q?.customerPO ?? "");
  const [orderSubmittalMethod, setOrderSubmittalMethod] = useState(q?.orderSubmittalMethod ?? "");
  const [orderNotes, setOrderNotes] = useState(q?.orderNotes ?? "");
  const [billingStreet, setBillingStreet] = useState(q?.billingStreet ?? "");
  const [billingCity, setBillingCity] = useState(q?.billingCity ?? "");
  const [billingState, setBillingState] = useState(q?.billingState ?? "");
  const [billingCode, setBillingCode] = useState(q?.billingCode ?? "");
  const [billingCountry, setBillingCountry] = useState(q?.billingCountry ?? "");
  const [shippingStreet, setShippingStreet] = useState(q?.shippingStreet ?? "");
  const [shippingCity, setShippingCity] = useState(q?.shippingCity ?? "");
  const [shippingState, setShippingState] = useState(q?.shippingState ?? "");
  const [shippingCode, setShippingCode] = useState(q?.shippingCode ?? "");
  const [shippingCountry, setShippingCountry] = useState(q?.shippingCountry ?? "");

  // Quote items
  const [quoteItemsMode, setQuoteItemsMode] = useState<"manual" | "upload">("manual");
  const [items, setItems] = useState<QuoteItem[]>(q?.items?.length ? q.items : [emptyItem()]);
  const [discount, setDiscount] = useState(q?.discount ?? "");
  const [tax, setTax] = useState(q?.tax ?? "");
  const [adjustment, setAdjustment] = useState(q?.adjustment ?? "");

  // Footer
  const [description, setDescription] = useState(q?.description ?? "");
  const [followUpDate, setFollowUpDate] = useState(q?.followUpDate ?? "");

  const [additionalInfoOpen, setAdditionalInfoOpen] = useState(false);

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  function applyAddressesFromAccountRecord(acc: AccountRecord) {
    setBillingStreet(acc.billingStreet);
    setBillingCity(acc.billingCity);
    setBillingState(acc.billingState);
    setBillingCode(acc.billingCode);
    setBillingCountry(acc.billingCountry);
    setShippingStreet(acc.shippingStreet);
    setShippingCity(acc.shippingCity);
    setShippingState(acc.shippingState);
    setShippingCode(acc.shippingCode);
    setShippingCountry(acc.shippingCountry);
  }

  function handleAccountNameChange(next: string) {
    setAccountName(next);
    const acc = getAccountByName(next);
    if (acc) applyAddressesFromAccountRecord(acc);
  }

  // When opening the modal, if the quote has no saved address lines yet, pre-fill from the selected account
  useEffect(() => {
    const hadSaved =
      (q?.billingStreet ?? "").trim() ||
      (q?.billingCity ?? "").trim() ||
      (q?.shippingStreet ?? "").trim() ||
      (q?.shippingCity ?? "").trim();
    if (hadSaved) return;
    const name = (q?.accountName ?? opportunity.accountName ?? "").trim();
    if (!name) return;
    const acc = getAccountByName(name);
    if (acc) applyAddressesFromAccountRecord(acc);
  }, [opportunity.id]);

  const grandTotal = computeGrandTotal(items, discount, tax, adjustment);

  function validate(): boolean {
    const errs: Record<string, boolean> = {};
    if (!subject.trim()) errs["subject"] = true;
    if (!accountName.trim()) errs["accountName"] = true;
    if (!businessType.trim()) errs["businessType"] = true;
    if (!urgency.trim()) errs["urgency"] = true;

    // At least one item row must have productName and quantity
    let hasValidItem = false;
    items.forEach((it) => {
      if (!it.productName.trim()) errs[`item-${it.id}-name`] = true;
      if (!it.quantity.trim()) errs[`item-${it.id}-qty`] = true;
      if (it.productName.trim() && it.quantity.trim()) hasValidItem = true;
    });
    if (!hasValidItem) errs["items"] = true;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit() {
    setSubmitted(true);
    if (!validate()) return;

    const quoteData: QuoteData = {
      subject, accountName, businessType, urgency,
      opportunityOwner, opportunityName, quoteStage, validDate,
      contactName, shippingMethod, customerPO, orderSubmittalMethod, orderNotes,
      billingStreet, billingCity, billingState, billingCode, billingCountry,
      shippingStreet, shippingCity, shippingState, shippingCode, shippingCountry,
      items,
      subtotal: items.reduce((s, it) => {
        const qty = parseFloat(it.quantity) || 0;
        const price = parseFloat(it.listPrice.replace(/[^0-9.]/g, "")) || 0;
        return s + qty * price;
      }, 0).toFixed(2),
      discount, tax, adjustment, grandTotal,
      termsAndConditions: "", description, followUpDate,
      teamForApproval: TEAM_MEMBERS,
    };
    onSave(quoteData);
  }

  const hasErrors = submitted && Object.keys(errors).length > 0;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[70]" onClick={onCancel} />

      {/* Modal */}
      <div className="fixed inset-0 z-[71] flex items-start justify-center overflow-y-auto py-6 px-4">
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[1000px] max-h-[92vh] flex flex-col min-h-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Modal Header ── */}
          <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={18} className="text-emerald-500" />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-slate-900">Opportunity Stage Change</h2>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug max-w-[320px]">
                  You need to add your quote before this Opportunity Stage can be proceed
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Quote / Allocation tabs */}
          <div className="flex-shrink-0 px-5 pt-3 pb-0 border-b border-slate-100">
            <div className="flex p-0.5 bg-slate-100 rounded-lg mb-3">
              <button
                type="button"
                onClick={() => setDetailTab("quote")}
                className={`flex-1 py-2 text-[12px] font-semibold rounded-md transition-colors ${
                  detailTab === "quote"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Quote
              </button>
              <button
                type="button"
                onClick={() => setDetailTab("allocation")}
                className={`flex-1 py-2 text-[12px] font-semibold rounded-md transition-colors ${
                  detailTab === "allocation"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Allocation
              </button>
            </div>
          </div>

          {/* ── Scrollable Body ── */}
          <div className="overflow-y-auto flex-1 min-h-0 px-5 py-4 space-y-5">

            {detailTab === "quote" && (
              <>
            {hasErrors && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-[12px] text-red-600 font-medium">
                Please fill in all required fields and add at least one product row.
              </div>
            )}

            {/* BASIC INFORMATION */}
            <div>
              <SectionHeader>Basic Information</SectionHeader>
              <div className="grid grid-cols-4 gap-x-3 gap-y-3">
                <div>
                  <Label required>Subject</Label>
                  <Input value={subject} onChange={setSubject} placeholder="Enter subject" required error={submitted && errors["subject"]} />
                </div>
                <div>
                  <Label required>Account Name</Label>
                  <Select
                    value={accountName}
                    onChange={handleAccountNameChange}
                    options={accountOptions}
                    placeholder="Select Account"
                    error={submitted && errors["accountName"]}
                  />
                </div>
                <div>
                  <Label required>Business Type</Label>
                  <Select
                    value={businessType}
                    onChange={setBusinessType}
                    options={["New Business", "Existing Business", "Renewal", "Expansion"]}
                    placeholder="Select Business"
                    error={submitted && errors["businessType"]}
                  />
                </div>
                <div>
                  <Label required>Urgency</Label>
                  <Select
                    value={urgency}
                    onChange={setUrgency}
                    options={["High", "Medium", "Low"]}
                    placeholder="Select Urgency"
                    error={submitted && errors["urgency"]}
                  />
                </div>
              </div>
            </div>

            {/* ALLOCATION — shown only when procurement data is available */}
            {opportunity.procurementAllocation && (
              <AllocationSection allocation={opportunity.procurementAllocation} />
            )}

            {/* ADDITIONAL INFORMATION — collapsible */}
            <div>
              <SectionHeader
                collapsible
                open={additionalInfoOpen}
                onToggle={() => setAdditionalInfoOpen((v) => !v)}
              >
                Additional Information
              </SectionHeader>

              {additionalInfoOpen && (
                <div className="space-y-5">

                  {/* ── Main fields: left / right 2-column layout ── */}
                  <div className="grid grid-cols-2 gap-x-8 items-start">

                    {/* Left column */}
                    <div className="space-y-3">
                      <div>
                        <Label>Opportunity Owner</Label>
                        <Select
                          value={opportunityOwner}
                          onChange={setOpportunityOwner}
                          options={["Katie Allen", "Kevin Calamari", "Sarah Chen", "James Mitchell"]}
                          placeholder="Select Owner"
                        />
                      </div>
                      <div>
                        <Label>Quote Stage</Label>
                        <Select
                          value={quoteStage}
                          onChange={setQuoteStage}
                          options={["Draft", "Needs Analysis", "Value Proposition", "Delivered", "On Hold", "Denied"]}
                          placeholder="Select Quote stage"
                        />
                      </div>
                      <div>
                        <Label>Contact Name</Label>
                        <Select
                          value={contactName}
                          onChange={setContactName}
                          options={contactOptions}
                          placeholder="Select contact"
                        />
                      </div>
                      <div>
                        <Label>Customer PO</Label>
                        <Input value={customerPO} onChange={setCustomerPO} placeholder="Enter amount" />
                      </div>
                      <div>
                        <Label>Order Notes</Label>
                        <Input value={orderNotes} onChange={setOrderNotes} placeholder="Add a note" />
                      </div>
                      <div>
                        <Label>Spread Sheet Upload</Label>
                        <label className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors bg-white">
                          <Upload size={13} className="text-slate-400 flex-shrink-0" />
                          <span className="text-[13px] text-slate-400">Choose file to upload</span>
                        </label>
                      </div>
                    </div>

                    {/* Right column */}
                    <div className="space-y-3">
                      <div>
                        <Label>Opportunity Name</Label>
                        <Input value={opportunityName} onChange={setOpportunityName} placeholder="Enter opportunity name" />
                      </div>
                      <div>
                        <Label>Valid Date</Label>
                        <div className="relative">
                          <Input value={validDate} onChange={setValidDate} type="date" />
                          <Calendar size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <Label>Shipping Method</Label>
                        <Select
                          value={shippingMethod}
                          onChange={setShippingMethod}
                          options={["Standard Shipping", "Express Shipping", "Overnight Delivery", "Freight", "Customer Pickup"]}
                          placeholder="Select shipping method"
                        />
                      </div>
                      <div>
                        <Label>Order Submittal Method</Label>
                        <Select
                          value={orderSubmittalMethod}
                          onChange={setOrderSubmittalMethod}
                          options={["Email", "Portal", "Phone", "Fax", "EDI"]}
                          placeholder="Select submittal method"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── Address Information ── */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">Address Information</span>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 items-start">
                      {/* Billing */}
                      <div className="space-y-3">
                        <div>
                          <Label>Billing Street</Label>
                          <Input value={billingStreet} onChange={setBillingStreet} placeholder="Enter Street" />
                        </div>
                        <div>
                          <Label>Billing City</Label>
                          <Select
                            value={billingCity}
                            onChange={setBillingCity}
                            options={["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"]}
                            placeholder="Enter City"
                          />
                        </div>
                        <div>
                          <Label>Billing State</Label>
                          <Select
                            value={billingState}
                            onChange={setBillingState}
                            options={["New York", "California", "Texas", "Florida", "Illinois"]}
                            placeholder="Enter State"
                          />
                        </div>
                        <div>
                          <Label>Billing Code</Label>
                          <Input value={billingCode} onChange={setBillingCode} placeholder="Enter amount" />
                        </div>
                        <div>
                          <Label>Billing Country</Label>
                          <Select
                            value={billingCountry}
                            onChange={setBillingCountry}
                            options={["United States", "Canada", "United Kingdom", "Australia"]}
                            placeholder="Enter Country"
                          />
                        </div>
                      </div>

                      {/* Shipping */}
                      <div className="space-y-3">
                        <div>
                          <Label required>Shipping Street</Label>
                          <Input value={shippingStreet} onChange={setShippingStreet} placeholder="Enter Shipping Street" />
                        </div>
                        <div>
                          <Label>Shipping City</Label>
                          <Select
                            value={shippingCity}
                            onChange={setShippingCity}
                            options={["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"]}
                            placeholder="Enter City"
                          />
                        </div>
                        <div>
                          <Label>Shipping State</Label>
                          <Select
                            value={shippingState}
                            onChange={setShippingState}
                            options={["New York", "California", "Texas", "Florida", "Illinois"]}
                            placeholder="Enter State"
                          />
                        </div>
                        <div>
                          <Label>Shipping Code</Label>
                          <Input value={shippingCode} onChange={setShippingCode} placeholder="Enter amount" />
                        </div>
                        <div>
                          <Label>Shipping Country</Label>
                          <Select
                            value={shippingCountry}
                            onChange={setShippingCountry}
                            options={["United States", "Canada", "United Kingdom", "Australia"]}
                            placeholder="Enter Country"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* QUOTE ITEMS */}
            <div>
              {/* Header + mode tabs */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">Quote Items</span>
                <div className="flex-1 h-px bg-slate-200" />
                {/* Mode toggle pill */}
                <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuoteItemsMode("manual")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-150
                      ${quoteItemsMode === "manual"
                        ? "bg-white text-[#002f93] shadow-sm"
                        : "text-slate-500 hover:text-slate-700"}`}
                  >
                    <Plus size={12} />
                    Manual Entry
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuoteItemsMode("upload")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-150
                      ${quoteItemsMode === "upload"
                        ? "bg-white text-emerald-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"}`}
                  >
                    <FileSpreadsheet size={12} />
                    Upload XLS
                  </button>
                </div>
              </div>

              {quoteItemsMode === "manual" ? (
                <>
                  <QuoteItemsTable items={items} onChange={setItems} errors={errors} />
                  <TotalsSection
                    items={items}
                    discount={discount} tax={tax} adjustment={adjustment} grandTotal={grandTotal}
                    onDiscount={setDiscount} onTax={setTax} onAdjustment={setAdjustment}
                  />
                </>
              ) : (
                <>
                  <XlsUploadZone
                    onParsed={(parsed) => setItems(parsed)}
                  />
                  {items.length > 0 && items[0].productName !== "" && (
                    <TotalsSection
                      items={items}
                      discount={discount} tax={tax} adjustment={adjustment} grandTotal={grandTotal}
                      onDiscount={setDiscount} onTax={setTax} onAdjustment={setAdjustment}
                    />
                  )}
                </>
              )}
            </div>

            {/* TEAM FOR APPROVAL */}
            <div>
              <SectionHeader>Team for Approval</SectionHeader>
              <TeamSection />
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
              <TextArea value={description} onChange={setDescription} placeholder="Add description" rows={3} />
            </div>

            {/* Your Next Action */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-[12px] font-bold text-slate-700 mb-2">Your Next Action: Follow-up on Quote</p>
              <div className="flex items-end gap-6">
                <div className="w-48">
                  <Label>Due Date</Label>
                  <Input value={followUpDate} onChange={setFollowUpDate} type="date" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer pb-0.5">
                  <input type="checkbox" className="rounded accent-[#002f93]" />
                  <span className="text-[12px] text-slate-600">Done</span>
                </label>
              </div>
            </div>
              </>
            )}

            {detailTab === "allocation" && (
              allocationRecord ? (
                <AllocationRecordDetailContent allocation={allocationRecord} compact={false} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <PackageSearch className="text-slate-300 mb-3" size={40} strokeWidth={1.25} />
                  <p className="text-[13px] font-semibold text-slate-700">No allocation linked</p>
                  <p className="text-[12px] text-slate-500 mt-2 max-w-md leading-relaxed">
                    There is no allocation record on this opportunity. The same details shown in View Allocation appear here when an allocation is linked (for example from the lead allocation flow).
                  </p>
                </div>
              )
            )}
          </div>

          {/* ── Footer ── */}
          <div className="flex-shrink-0 px-5 py-4 border-t border-slate-100 bg-white rounded-b-2xl flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-[13px] font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2 text-[13px] font-semibold text-white bg-[#002f93] rounded-lg hover:bg-[#001f6b] transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
