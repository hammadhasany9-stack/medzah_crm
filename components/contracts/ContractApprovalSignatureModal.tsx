"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Contract } from "@/lib/types";

type Props = {
  contract: Contract | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (signature: string) => void;
};

export function ContractApprovalSignatureModal({
  contract,
  open,
  onClose,
  onConfirm,
}: Props) {
  const [signature, setSignature] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (!open) {
      setSignature("");
      setConfirmed(false);
      setAttempted(false);
    }
  }, [open]);

  if (!open || !contract) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAttempted(true);
    if (signature.trim().length < 2 || !confirmed) return;
    onConfirm(signature.trim());
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Approve contract</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <p className="text-sm text-slate-600">
            You are about to approve{" "}
            <span className="font-semibold text-slate-900">{contract.name || "this contract"}</span>{" "}
            <span className="font-mono text-xs text-slate-500">({contract.contractRef})</span>.
          </p>
          <p className="text-xs text-slate-500">
            Your electronic signature has the same legal effect as a handwritten signature.
          </p>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
              Full name (e-signature) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              autoComplete="name"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Type your full legal name"
              className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93]/30 focus:border-[#002f93] ${
                attempted && signature.trim().length < 2 ? "border-red-300 bg-red-50" : "border-slate-200"
              }`}
            />
            {attempted && signature.trim().length < 2 && (
              <p className="text-xs text-red-600 mt-1">Enter your full name to sign.</p>
            )}
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 accent-[#002f93]"
            />
            <span className="text-sm text-slate-700">
              I confirm that I am authorized to approve this contract on behalf of the organization.
            </span>
          </label>
          {attempted && !confirmed && (
            <p className="text-xs text-red-600">Confirmation is required.</p>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
            >
              Approve &amp; sign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
