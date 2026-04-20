"use client";

import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const iconBg  = variant === "danger" ? "bg-red-100"    : "bg-amber-100";
  const iconClr = variant === "danger" ? "text-red-600"  : "text-amber-600";
  const btnClr  = variant === "danger"
    ? "bg-red-600 hover:bg-red-700"
    : "bg-amber-500 hover:bg-amber-600";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-2xl w-[400px] mx-4 shadow-[0_24px_64px_rgba(0,0,0,0.22)] overflow-hidden">

        {/* Close */}
        <div className="flex justify-end pt-4 pr-4">
          <button
            type="button"
            onClick={onCancel}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-7 pb-7 flex flex-col items-center gap-4 -mt-2 text-center">
          <div className={`w-14 h-14 rounded-full ${iconBg} flex items-center justify-center`}>
            <AlertTriangle size={26} className={iconClr} />
          </div>

          <div>
            <h2 className="text-[17px] font-bold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{message}</p>
          </div>

          <div className="flex gap-3 w-full pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl text-white transition-colors ${btnClr}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
