"use client";

import { ShieldAlert, X } from "lucide-react";

interface BlockedModalProps {
  title: string;
  message: string;
  onClose: () => void;
}

export function BlockedModal({ title, message, onClose }: BlockedModalProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-[420px] mx-4 shadow-[0_24px_64px_rgba(0,0,0,0.22)] overflow-hidden">

        {/* Close */}
        <div className="flex justify-end pt-4 pr-4">
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-8 pb-8 flex flex-col items-center gap-4 -mt-2 text-center">
          {/* Icon */}
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
            <ShieldAlert size={28} className="text-amber-600" />
          </div>

          {/* Text */}
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{message}</p>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-black text-white text-sm font-semibold py-3 rounded-xl transition-colors duration-150 mt-1"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
