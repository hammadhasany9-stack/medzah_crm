"use client";

import { useState } from "react";
import { FolderOpen, FolderPlus, Upload, Plus, ChevronRight, Trash2, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { UploadDocumentModal } from "@/components/documents/UploadDocumentModal";
import { NewFolderModal } from "@/components/documents/NewFolderModal";
import type { FolderItem, DocItem } from "@/components/documents/types";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDateTime(date: Date): string {
  return (
    date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " · " +
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  );
}

function getFileIconInfo(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf")                        return { bg: "bg-red-50",    color: "text-red-500",    label: "PDF"  };
  if (["doc", "docx"].includes(ext))        return { bg: "bg-blue-50",   color: "text-blue-500",   label: "DOC"  };
  if (["xls", "xlsx"].includes(ext))        return { bg: "bg-green-50",  color: "text-green-600",  label: "XLS"  };
  if (["png", "jpg", "jpeg"].includes(ext)) return { bg: "bg-purple-50", color: "text-purple-500", label: "IMG"  };
  return                                           { bg: "bg-slate-100", color: "text-slate-400",  label: "FILE" };
}

// ─── Folder tree item (recursive) ─────────────────────────────────────────────

interface FolderTreeItemProps {
  folder: FolderItem;
  depth: number;
  allFolders: FolderItem[];
  activeFolderId: string | null;
  expandedIds: Set<string>;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onAddSubfolder: (parentId: string) => void;
}

function FolderTreeItem({
  folder, depth, allFolders, activeFolderId, expandedIds,
  onSelect, onToggle, onAddSubfolder,
}: FolderTreeItemProps) {
  const children = allFolders.filter(f => f.parentId === folder.id);
  const isExpanded = expandedIds.has(folder.id);
  const isActive = activeFolderId === folder.id;

  return (
    <div>
      <div
        style={{ paddingLeft: `${8 + depth * 14}px` }}
        className={`group flex items-center gap-1 pr-1.5 py-1.5 rounded-lg cursor-pointer select-none transition-colors ${
          isActive
            ? "bg-[#002f93]/10 text-[#002f93]"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
        }`}
        onClick={() => onSelect(folder.id)}
      >
        <button
          type="button"
          className={`w-4 h-4 flex items-center justify-center flex-shrink-0 rounded ${
            children.length === 0 ? "invisible" : ""
          }`}
          onClick={(e) => { e.stopPropagation(); onToggle(folder.id); }}
        >
          <ChevronRight
            size={11}
            className={`transition-transform duration-150 ${isExpanded ? "rotate-90" : ""}`}
          />
        </button>

        <FolderOpen size={13} className="flex-shrink-0" />
        <span className="flex-1 text-[13px] font-medium truncate">{folder.name}</span>

        <button
          type="button"
          title="Add subfolder"
          className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-[#002f93]/10 transition-all flex-shrink-0"
          onClick={(e) => { e.stopPropagation(); onAddSubfolder(folder.id); }}
        >
          <Plus size={11} />
        </button>
      </div>

      {isExpanded && children.map(child => (
        <FolderTreeItem
          key={child.id}
          folder={child}
          depth={depth + 1}
          allFolders={allFolders}
          activeFolderId={activeFolderId}
          expandedIds={expandedIds}
          onSelect={onSelect}
          onToggle={onToggle}
          onAddSubfolder={onAddSubfolder}
        />
      ))}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const [folders,         setFolders]         = useState<FolderItem[]>([]);
  const [documents,       setDocuments]       = useState<DocItem[]>([]);
  const [activeFolderId,  setActiveFolderId]  = useState<string | null>(null);
  const [expandedIds,     setExpandedIds]     = useState<Set<string>>(new Set());
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newFolderModal,  setNewFolderModal]  = useState<{ parentId: string | null } | null>(null);

  const rootFolders    = folders.filter(f => f.parentId === null);
  const visibleDocs    = activeFolderId === null
    ? documents
    : documents.filter(d => d.folderId === activeFolderId);
  const activeFolderName = activeFolderId === null
    ? "All Documents"
    : (folders.find(f => f.id === activeFolderId)?.name ?? "Folder");

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleCreateFolder(name: string) {
    if (!newFolderModal) return;
    const { parentId } = newFolderModal;
    const newFolder: FolderItem = {
      id: `f${Date.now()}`,
      name,
      parentId,
      createdAt: new Date(),
    };
    setFolders(prev => [...prev, newFolder]);
    if (parentId) {
      setExpandedIds((prev) => new Set([...Array.from(prev), parentId]));
    }
    setNewFolderModal(null);
  }

  function handleUpload(file: File, docName: string, folderId: string | null) {
    const blobUrl = URL.createObjectURL(file);
    const newDoc: DocItem = {
      id: `d${Date.now()}`,
      name: docName,
      fileName: file.name,
      blobUrl,
      folderId,
      uploadedBy: "Admin User",
      uploadedAt: new Date(),
      size: file.size,
    };
    setDocuments(prev => [...prev, newDoc]);
    setShowUploadModal(false);
  }

  function handleViewDocument(doc: DocItem) {
    window.open(doc.blobUrl, "_blank", "noopener,noreferrer");
  }

  function handleDownloadDocument(doc: DocItem) {
    const a = document.createElement("a");
    a.href = doc.blobUrl;
    a.download = doc.fileName;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function handleDeleteDocument(docId: string) {
    setDocuments((prev) => {
      const doc = prev.find((d) => d.id === docId);
      if (doc?.blobUrl) {
        try {
          URL.revokeObjectURL(doc.blobUrl);
        } catch {
          // ignore
        }
      }
      return prev.filter((d) => d.id !== docId);
    });
  }

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Toolbar (title lives in TopNavBar) */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-end gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setNewFolderModal({ parentId: activeFolderId })}
        >
          <FolderPlus size={14} />
          New Folder
        </Button>
        <Button variant="primary" size="sm" onClick={() => setShowUploadModal(true)}>
          <Upload size={14} />
          Upload Document
        </Button>
      </div>

      {/* Sidebar + Content */}
      <div className="flex flex-1 min-h-0">

        {/* Sidebar */}
        <aside className="w-52 flex-shrink-0 border-r border-slate-200 flex flex-col overflow-hidden bg-white">

          <div className="px-3 pt-4 pb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">
              My Folders
            </p>

            {/* All Documents */}
            <button
              type="button"
              onClick={() => setActiveFolderId(null)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${
                activeFolderId === null
                  ? "bg-[#002f93]/10 text-[#002f93]"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              <FolderOpen size={13} className="flex-shrink-0" />
              <span className="text-[13px] font-medium">All Documents</span>
            </button>
          </div>

          {/* Folder tree */}
          <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-2">
            {rootFolders.length === 0 ? (
              <p className="text-[11px] text-slate-400 text-center py-6 leading-relaxed px-2">
                No folders yet.<br />Create one below.
              </p>
            ) : (
              rootFolders.map(folder => (
                <FolderTreeItem
                  key={folder.id}
                  folder={folder}
                  depth={0}
                  allFolders={folders}
                  activeFolderId={activeFolderId}
                  expandedIds={expandedIds}
                  onSelect={setActiveFolderId}
                  onToggle={toggleExpand}
                  onAddSubfolder={(parentId) => setNewFolderModal({ parentId })}
                />
              ))
            )}
          </div>

          {/* New Folder */}
          <div className="flex-shrink-0 px-3 py-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setNewFolderModal({ parentId: null })}
              className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#002f93] transition-colors"
            >
              <Plus size={13} />
              <span className="text-[13px] font-medium">New Folder</span>
            </button>
          </div>
        </aside>

        {/* Content area */}
        <main className="flex-1 min-h-0 overflow-y-auto flex flex-col">

          {/* Content header */}
          <div className="flex-shrink-0 px-6 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-slate-700">{activeFolderName}</h2>
            {activeFolderId !== null && (
              <button
                type="button"
                onClick={() => setNewFolderModal({ parentId: activeFolderId })}
                className="flex items-center gap-1 text-[12px] text-slate-500 hover:text-[#002f93] transition-colors"
              >
                <Plus size={12} />
                New Subfolder
              </button>
            )}
          </div>

          {/* Documents or empty state */}
          {visibleDocs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <FolderOpen size={24} className="text-slate-300" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700 mb-1">
                {activeFolderId ? "Folder is empty" : "No documents yet"}
              </h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-4">
                {activeFolderId
                  ? "Upload a document to this folder to get started."
                  : "Upload files to keep your documents organised and accessible."}
              </p>
              <Button variant="outline" size="sm" onClick={() => setShowUploadModal(true)}>
                <Upload size={13} />
                Upload Document
              </Button>
            </div>
          ) : (
            <div className="px-6 pt-3 pb-6">
              {/* Column headers */}
              <div className="grid grid-cols-[1fr_200px_90px_104px] gap-3 px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100">
                <span>Name</span>
                <span>Uploaded</span>
                <span>Size</span>
                <span className="text-right">Actions</span>
              </div>

              {visibleDocs.map(doc => {
                const icon = getFileIconInfo(doc.fileName);
                return (
                  <div
                    key={doc.id}
                    className="grid grid-cols-[1fr_200px_90px_104px] gap-3 items-center px-3 py-2.5 rounded-xl hover:bg-slate-50 group transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg ${icon.bg} flex items-center justify-center flex-shrink-0`}>
                        <span className={`text-[9px] font-bold ${icon.color}`}>{icon.label}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-slate-800 truncate">{doc.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">
                          Uploaded by {doc.uploadedBy}
                        </p>
                      </div>
                    </div>
                    <span className="text-[12px] text-slate-500">{formatDateTime(doc.uploadedAt)}</span>
                    <span className="text-[12px] text-slate-500">{formatBytes(doc.size)}</span>
                    <div className="flex items-center justify-end gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        title="View"
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-[#002f93]/10 hover:text-[#002f93] transition-all"
                        onClick={() => handleViewDocument(doc)}
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        type="button"
                        title="Download"
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-[#002f93]/10 hover:text-[#002f93] transition-all"
                        onClick={() => handleDownloadDocument(doc)}
                      >
                        <Download size={13} />
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Upload modal */}
      {showUploadModal && (
        <UploadDocumentModal
          folders={folders}
          defaultFolderId={activeFolderId}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUpload}
        />
      )}

      {/* New folder / subfolder modal */}
      {newFolderModal !== null && (
        <NewFolderModal
          parentFolderName={
            newFolderModal.parentId === null
              ? null
              : (folders.find(f => f.id === newFolderModal.parentId)?.name ?? null)
          }
          onClose={() => setNewFolderModal(null)}
          onCreate={handleCreateFolder}
        />
      )}
    </div>
  );
}
