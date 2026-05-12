/** Filenames under `public/` — labels strip `.doc` / `.docx` only. */
export const PUBLIC_CONTRACT_TEMPLATE_FILES = [
  "Medzah Pricing Agreement Template.doc",
  "Medzah Simple Pricing agreement commit .doc",
  "Medzah supplier agreement.docx",
  "Master supply Template.docx",
  "Medzah  Stockpile Addendum 4324.docx",
] as const;

export type PublicContractTemplateFile = (typeof PUBLIC_CONTRACT_TEMPLATE_FILES)[number];

export interface ContractTemplateOption {
  fileName: PublicContractTemplateFile;
  label: string;
}

export function templateLabelFromFileName(fileName: string): string {
  return fileName.replace(/\.docx$/i, "").replace(/\.doc$/i, "");
}

export const CONTRACT_TEMPLATE_OPTIONS: ContractTemplateOption[] =
  PUBLIC_CONTRACT_TEMPLATE_FILES.map((fileName) => ({
    fileName,
    label: templateLabelFromFileName(fileName),
  }));

export function findTemplateByLabel(label: string): ContractTemplateOption | undefined {
  return CONTRACT_TEMPLATE_OPTIONS.find((o) => o.label === label);
}

export function findTemplateByFileName(fileName: string): ContractTemplateOption | undefined {
  return CONTRACT_TEMPLATE_OPTIONS.find((o) => o.fileName === fileName);
}

/** Resolves the public `public/` filename for the selected catalog template, if any. */
export function resolveContractTemplateFileName(fields: {
  contractTemplateFile?: string | null;
  type?: string | null;
}): PublicContractTemplateFile | undefined {
  const templateFile =
    fields.contractTemplateFile?.trim() ||
    (fields.type?.trim() ? findTemplateByLabel(fields.type.trim())?.fileName : undefined);
  if (!templateFile) return undefined;
  return findTemplateByFileName(templateFile)?.fileName;
}

/** Opens the Word template from `public/` in a new tab. */
export function openContractTemplateDownload(fields: {
  contractTemplateFile?: string | null;
  type?: string | null;
}): boolean {
  const fileName = resolveContractTemplateFileName(fields);
  if (!fileName) return false;
  window.open(`/${encodeURIComponent(fileName)}`, "_blank", "noopener,noreferrer");
  return true;
}

export interface ContractBinaryDownloadFields {
  /** Fallback for template URL when `contractTemplateFile` is unset (e.g. legacy rows). */
  type?: string;
  contractTemplateFile?: string | null;
  contractUploadedFileName?: string | null;
  contractUploadedDataUrl?: string | null;
}

/**
 * Opens/downloads Word artifact when present.
 * Precedence: uploaded data URL → public template file.
 * @returns true if handled (caller should skip HTML print).
 */
export function downloadContractBinary(c: ContractBinaryDownloadFields): boolean {
  const uploadUrl = c.contractUploadedDataUrl?.trim();
  if (uploadUrl) {
    const name = (c.contractUploadedFileName?.trim() || "contract").replace(/[/\\?%*:|"<>]/g, "_");
    const a = document.createElement("a");
    a.href = uploadUrl;
    a.download = /\.(docx?)$/i.test(name) ? name : `${name}.doc`;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    return true;
  }

  const templateFile = resolveContractTemplateFileName(c);
  if (templateFile) {
    window.open(`/${encodeURIComponent(templateFile)}`, "_blank", "noopener,noreferrer");
    return true;
  }

  return false;
}
