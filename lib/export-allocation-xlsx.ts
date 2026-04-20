import ExcelJS from "exceljs";
import type { AllocationProduct, AllocationRecord, AllocationRecordStatus } from "@/lib/types";
import { mockProducts } from "@/lib/mock-data/products";

const HEADERS = [
  "Contract Category",
  "Manufacturer Name",
  "Catalog Num",
  "Product Description",
  "Pkg UOM",
  "Conv",
  "Sum of Quantity",
  "MedzahCross",
] as const;

const HEADER_BLUE = "FF9DC3E6";
const MEDZAH_GREEN = "FFC6EFCE";

function contractCategoryForSku(sku: string): string {
  const cat = mockProducts.find((p) => p.sku === sku)?.category;
  return cat ? cat.toUpperCase() : "GENERAL";
}

/** Match spreadsheet-style packaging codes (EA / CA). */
function pkgUom(uom: string): string {
  const u = uom.trim().toUpperCase();
  if (u.includes("CASE")) return "CA";
  if (u === "EA" || u === "EACH" || u === "PAIR" || u === "BOX") return "EA";
  if (u.length <= 4 && !u.includes(" ")) return u.length === 2 ? u : "EA";
  return "EA";
}

function parseConvFromInventory(p: AllocationProduct): number {
  const raw = p.inventory.uomConversions;
  if (raw && raw !== "N/A") {
    const n = parseFloat(String(raw).replace(/[^0-9.]/g, ""));
    if (Number.isFinite(n) && n > 0) return n;
  }
  const catalog = mockProducts.find((c) => c.sku === p.sku);
  if (catalog?.uomConversions?.length) {
    const invUom = p.inventory.uom.toLowerCase();
    const match = catalog.uomConversions.find((c) =>
      invUom.includes(c.unit.toLowerCase().slice(0, 4))
    );
    if (match) return match.factor;
    const caseConv = catalog.uomConversions.find((c) => c.unit.toLowerCase().includes("case"));
    if (caseConv && invUom.includes("case")) return caseConv.factor;
    return catalog.uomConversions[0].factor;
  }
  return 1;
}

function sumQuantity(p: AllocationProduct, status: AllocationRecordStatus): number {
  if (status === "Partially Approved") {
    return Math.min(p.requiredQty, Math.max(0, p.inventory.qtyAvailable));
  }
  return p.requiredQty;
}

/** Deterministic cross-ref similar to SAM-2000 style in sample sheets */
function medzahCross(sku: string, rowIndex: number): string {
  if (!sku.trim()) return "n/a";
  const n = 2000 + ((sku + rowIndex).split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 7000);
  return `SAM-${n}`;
}

function thinBorder(): Partial<ExcelJS.Borders> {
  return {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };
}

/**
 * Exports an allocation as an Excel workbook (.xlsx) aligned with the procurement grid:
 * category, manufacturer, catalog #, description, pack UOM, conversion, quantity, Medzah cross-ref.
 */
export async function downloadAllocationXlsx(record: AllocationRecord): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Allocation", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  const lastCol = HEADERS.length;

  const headerRow = sheet.addRow([...HEADERS]);
  headerRow.height = 22;
  headerRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true, size: 11 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colNumber === lastCol ? MEDZAH_GREEN : HEADER_BLUE },
    };
    cell.border = thinBorder();
    cell.alignment = { vertical: "middle", wrapText: colNumber === 4 };
  });

  record.products.forEach((p, idx) => {
    const row = sheet.addRow([
      contractCategoryForSku(p.sku),
      p.inventory.manufacturerName || "—",
      p.sku,
      p.productName,
      pkgUom(p.inventory.uom),
      parseConvFromInventory(p),
      sumQuantity(p, record.status),
      medzahCross(p.sku, idx),
    ]);
    row.eachCell((cell, colNumber) => {
      cell.border = thinBorder();
      cell.alignment = { vertical: "middle", wrapText: colNumber === 4 };
      if (colNumber === lastCol) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: MEDZAH_GREEN },
        };
      }
    });
  });

  sheet.columns = [
    { width: 26 },
    { width: 30 },
    { width: 14 },
    { width: 56 },
    { width: 10 },
    { width: 8 },
    { width: 16 },
    { width: 14 },
  ];

  const buf = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const safeRef = record.allocationRef.replace(/[/\\?%*:|"<>]/g, "-");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeRef}-allocation.xlsx`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function canDownloadAllocationExport(status: AllocationRecordStatus): boolean {
  return status === "Approved" || status === "Partially Approved";
}
