"use client";

import { useState } from "react";
import { X, FolderPlus } from "lucide-react";

interface NewFolderModalProps {
  parentFolderName: string | null;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export function NewFolderModal({ parentFolderName, onClose, onCreate }: NewFolderModalProps) {
  const [name,      setName]      = useState("");
  const [attempted, setAttempted] = useState(false);

  const nameError = attempted && name.trim() === "";
  const isSubfolder = parentFolderName !== null;

  function handleCreate() {
    setAttempted(true);
    if (name.trim() === "") return;
    onCreate(name.trim());
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter")  handleCreate();
    if (e.key === "Escape") onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-[380px] mx-4 shadow-[0_24px_64px_rgba(0,0,0,0.22)] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#002f93]/10 flex items-center justify-center">
              <FolderPlus size={16} className="text-[#002f93]" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">
                {isSubfolder ? "New Subfolder" : "New Folder"}
              </h2>
              {isSubfolder && (
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Inside &ldquo;{parentFolderName}&rdquo;
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">

          {/* Folder name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-slate-700">
              Folder Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isSubfolder ? "e.g. 2024, Q1, Archive…" : "e.g. Contracts, Sales, Reports…"}
              autoFocus
              className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93] placeholder:text-slate-400 transition-colors ${
                nameError ? "border-red-300 bg-red-50/40" : "border-slate-200"
              }`}
            />
            {nameError && <p className="text-xs text-red-500">Folder name is required.</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white bg-[#002f93] hover:bg-[#001f6b] transition-colors"
            >
              Create
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
