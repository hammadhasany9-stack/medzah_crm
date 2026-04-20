"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Building2,
  UserCircle2,
  MapPin,
  Globe,
  Phone,
  Hash,
  X,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  AccountRecord,
  getAccountById,
  deleteAccount,
  loadAccounts,
} from "@/lib/mock-data/accounts";

// ─── Status styling ───────────────────────────────────────────────────────────

const STATUS_COLORS: Record<AccountRecord["status"], string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Inactive: "bg-slate-100 text-slate-500",
  Prospect: "bg-amber-100 text-amber-700",
};

// ─── Field display helpers ────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mt-6 mb-5">
      <span className="text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
        {title}
      </span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={cn("text-sm", value ? "text-slate-800 font-medium" : "text-slate-400")}>
        {value || "—"}
      </p>
    </div>
  );
}

function AddressBlock({
  street,
  city,
  state,
  code,
  country,
}: {
  street: string;
  city: string;
  state: string;
  code: string;
  country: string;
}) {
  const parts = [street, city && state ? `${city}, ${state} ${code}` : city || state, country].filter(Boolean);
  if (!parts.length) return <p className="text-sm text-slate-400">—</p>;
  return (
    <div className="text-sm text-slate-800 font-medium space-y-0.5">
      {parts.map((p, i) => <p key={i}>{p}</p>)}
    </div>
  );
}

// ─── Delete confirmation modal ────────────────────────────────────────────────

function DeleteModal({ name, onConfirm, onCancel }: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <Trash2 size={18} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Delete Account</h3>
            <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-5">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-800">{name}</span>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AccountViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [account, setAccount] = useState<AccountRecord | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const found = getAccountById(id);
    if (found) {
      setAccount(found);
    } else {
      setNotFound(true);
    }
  }, [id]);

  function handleDelete() {
    deleteAccount(id);
    router.push("/account");
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Building2 size={24} className="text-slate-400" />
        </div>
        <p className="text-base font-semibold text-slate-700">Account not found</p>
        <Link
          href="/account"
          className="text-sm font-semibold text-[#002f93] hover:underline"
        >
          ← Back to Accounts
        </Link>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="w-8 h-8 rounded-full border-2 border-[#002f93] border-t-transparent animate-spin" />
      </div>
    );
  }

  const createdDate = new Date(account.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex flex-col min-h-full">
      {/* Sub-header */}
      <div className="bg-white border-b border-slate-100 shadow-sm px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link
          href="/account"
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Accounts
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/account/${id}/edit`}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Pencil size={14} />
            Edit
          </Link>
          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          {/* Profile header */}
          <div className="flex items-start gap-4 mb-2">
            <div className="w-16 h-16 rounded-full bg-[#EFF3FF] border-2 border-[#002f93]/20 flex items-center justify-center flex-shrink-0">
              <UserCircle2 size={32} className="text-[#002f93]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900">{account.name}</h1>
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mt-0.5",
                    STATUS_COLORS[account.status]
                  )}
                >
                  {account.status}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                {account.industry && (
                  <span className="text-sm text-slate-500">{account.industry}</span>
                )}
                {account.accountType && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className="text-sm text-slate-500">{account.accountType}</span>
                  </>
                )}
                <span className="text-slate-300">·</span>
                <span className="text-sm text-slate-400">Created {createdDate}</span>
              </div>
            </div>
          </div>

          {/* ── ACCOUNT INFORMATION ── */}
          <SectionHeader title="Account Information" />

          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            <Field label="Account ID" value={account.id} />
            <Field label="Account Owner" value={account.accountOwner} />
            <Field label="Account Name" value={account.name} />
            <Field label="Phone" value={account.phone} />
            <Field label="Account Number" value={account.accountNumber} />
            <Field label="Fax" value={account.fax} />
            <Field label="Account Type" value={account.accountType} />
            <Field label="Website" value={account.website} />
            <Field label="Industry" value={account.industry} />
            <Field label="Contracts Counter Party ID" value={account.contractsCounterPartyId} />
            <Field label="Status" value={account.status} />
          </div>

          {/* ── ADDRESS INFORMATION ── */}
          <SectionHeader title="Address Information" />

          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <MapPin size={13} className="text-slate-400" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Billing Address
                </p>
              </div>
              <AddressBlock
                street={account.billingStreet}
                city={account.billingCity}
                state={account.billingState}
                code={account.billingCode}
                country={account.billingCountry}
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <MapPin size={13} className="text-slate-400" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Shipping Address
                </p>
              </div>
              <AddressBlock
                street={account.shippingStreet}
                city={account.shippingCity}
                state={account.shippingState}
                code={account.shippingCode}
                country={account.shippingCountry}
              />
            </div>
          </div>

          {/* ── DESCRIPTION ── */}
          <SectionHeader title="Description" />

          <p className={cn("text-sm", account.description ? "text-slate-700" : "text-slate-400")}>
            {account.description || "No description provided."}
          </p>
        </div>
      </div>

      {/* Delete confirmation */}
      {showDelete && (
        <DeleteModal
          name={account.name}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}
