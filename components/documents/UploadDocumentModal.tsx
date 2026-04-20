"use client";

import { useRef, useState } from "react";
import { X, UploadCloud, FileText, ChevronDown } from "lucide-react";
import type { FolderItem } from "./types";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Build a flat ordered list of folders with depth-based indentation labels
// suitable for a native <select> element.
function buildFolderOptions(folders: FolderItem[]): { id: string; label: string }[] {
  const result: { id: string; label: string }[] = [];

  function walk(parentId: string | null, depth: number) {
    folders
      .filter(f => f.parentId === parentId)
      .forEach(folder => {
        // \u00a0 (non-breaking space) preserves indentation inside <option>
        result.push({ id: folder.id, label: "\u00a0\u00a0".repeat(depth * 2) + folder.name });
        walk(folder.id, depth + 1);
      });
  }

  walk(null, 0);
  return result;
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface UploadDocumentModalProps {
  folders: FolderItem[];
  defaultFolderId: string | null;
  onClose: () => void;
  onUpload: (file: File, docName: string, folderId: string | null) => void;
}

// ─── Modal ─────────────────────────────────────────────────────────────────────

export function UploadDocumentModal({
  folders, defaultFolderId, onClose, onUpload,
}: UploadDocumentModalProps) {
  const [file,      setFile]      = useState<File | null>(null);
  const [docName,   setDocName]   = useState("");
  const [folderId,  setFolderId]  = useState<string | null>(defaultFolderId);
  const [dragging,  setDragging]  = useState(false);
  const [attempted, setAttempted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const nameError  = attempted && docName.trim() === "";
  const fileError  = attempted && !file;
  const folderOpts = buildFolderOptions(folders);

  function handleFile(f: File) {
    setFile(f);
    setDocName(f.name.replace(/\.[^/.]+$/, ""));
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  }

  function handleSubmit() {
    setAttempted(true);
    if (!file || docName.trim() === "") return;
    onUpload(file, docName.trim(), folderId);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-[480px] mx-4 shadow-[0_24px_64px_rgba(0,0,0,0.22)] overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#002f93]/10 flex items-center justify-center">
              <UploadCloud size={16} className="text-[#002f93]" />
            </div>
            <h2 className="text-[15px] font-bold text-slate-900">Upload Document</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-5">

          {/* Drop zone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-slate-700">
              File <span className="text-red-500">*</span>
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`
                relative flex flex-col items-center justify-center gap-3 py-8 px-6
                border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-150
                ${dragging
                  ? "border-[#002f93] bg-[#002f93]/5"
                  : fileError
                  ? "border-red-300 bg-red-50/40"
                  : "border-slate-200 bg-slate-50 hover:border-[#002f93]/40 hover:bg-[#002f93]/[0.03]"
                }
              `}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${dragging ? "bg-[#002f93]/10" : "bg-white border border-slate-200"}`}>
                <UploadCloud size={22} className={dragging ? "text-[#002f93]" : "text-slate-400"} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-700">
                  {dragging ? "Drop file here" : "Drag & drop or click to browse"}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  PDF, Word, Excel, PNG, JPG — max 25 MB
                </p>
              </div>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
              className="sr-only"
              onChange={handleInputChange}
            />
            {fileError && <p className="text-xs text-red-500">Please select a file.</p>}
          </div>

          {/* Selected file chip */}
          {file && (
            <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-[#002f93]/10 flex items-center justify-center flex-shrink-0">
                <FileText size={15} className="text-[#002f93]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); setDocName(""); }}
                className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors flex-shrink-0"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* Document name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-slate-700">
              Document Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="Enter a name for this document"
              className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93] placeholder:text-slate-400 transition-colors ${
                nameError ? "border-red-300 bg-red-50/40" : "border-slate-200"
              }`}
            />
            {nameError && <p className="text-xs text-red-500">Document name is required.</p>}
          </div>

          {/* Save to folder */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-slate-700">Save to Folder</label>
            <div className="relative">
              <select
                value={folderId ?? ""}
                onChange={(e) => setFolderId(e.target.value === "" ? null : e.target.value)}
                className="w-full appearance-none px-3 py-2.5 pr-8 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93] text-slate-700 bg-white cursor-pointer"
              >
                <option value="">No folder (root)</option>
                {folderOpts.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
            {folders.length === 0 && (
              <p className="text-[11px] text-slate-400">
                No folders yet — document will be saved to the root.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white transition-colors bg-[#002f93] hover:bg-[#001f6b]"
            >
              Upload
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
