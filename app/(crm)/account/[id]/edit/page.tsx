"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";
import {
  AccountFormFields,
  AccountFormData,
  EMPTY_FORM_DATA,
} from "@/components/accounts/AccountFormFields";
import {
  AccountRecord,
  getAccountById,
  upsertAccount,
} from "@/lib/mock-data/accounts";

export default function EditAccountPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [account, setAccount] = useState<AccountRecord | null>(null);
  const [formData, setFormData] = useState<AccountFormData>(EMPTY_FORM_DATA);
  const [errors, setErrors] = useState<Partial<Record<keyof AccountFormData, string>>>({});
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const found = getAccountById(id);
    if (found) {
      setAccount(found);
      // Populate form with existing values
      const { id: _id, createdAt: _createdAt, ...rest } = found;
      setFormData(rest as AccountFormData);
    } else {
      setNotFound(true);
    }
  }, [id]);

  function validate(): boolean {
    const errs: Partial<Record<keyof AccountFormData, string>> = {};
    if (!formData.name.trim()) errs.name = "Account name is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate() || !account) return;
    setSaving(true);
    upsertAccount({
      id: account.id,
      ...formData,
      createdAt: account.createdAt,
    });
    router.push(`/account/${account.id}`);
  }

  function handleCancel() {
    router.push(`/account/${id}`);
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Building2 size={24} className="text-slate-400" />
        </div>
        <p className="text-base font-semibold text-slate-700">Account not found</p>
        <Link href="/account" className="text-sm font-semibold text-[#002f93] hover:underline">
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

  return (
    <div className="flex flex-col min-h-full">
      {/* Sub-header */}
      <div className="bg-white border-b border-slate-100 shadow-sm px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} />
          {account.name}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50"
          >
            Save Changes
          </button>
          <button
            onClick={handleCancel}
            className="px-5 py-2 text-sm font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Form body */}
      <div className="flex-1 p-6">
        <AccountFormFields
          accountId={account.id}
          value={formData}
          onChange={setFormData}
          errors={errors}
        />
      </div>
    </div>
  );
}
