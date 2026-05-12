"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useTenantRouter } from "@/components/providers/TenantProvider";
import { TenantLink } from "@/components/providers/TenantLink";
import { ArrowLeft, Mail, ClipboardList } from "lucide-react";
import {
  CustomerIntakeQuickForm,
  CustomerIntakeQuickFormValue,
  quickFormToPrimaryNames,
  recordToQuickForm,
} from "@/components/customer-intake/CustomerIntakeQuickForm";
import {
  CustomerIntakeRecord,
  getCustomerIntakeById,
  upsertCustomerIntake,
} from "@/lib/mock-data/customer-intake";

function validateQuickForm(v: CustomerIntakeQuickFormValue): Partial<Record<keyof CustomerIntakeQuickFormValue, string>> {
  const errs: Partial<Record<keyof CustomerIntakeQuickFormValue, string>> = {};
  if (!v.contactId.trim()) errs.contactName = "Select a contact";
  if (!v.accountName.trim()) errs.accountName = "Select an account";
  if (!v.email.trim()) {
    errs.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) {
    errs.email = "Enter a valid email address";
  }
  return errs;
}

function EditCustomerIntakeForm({ record }: { record: CustomerIntakeRecord }) {
  const router = useTenantRouter();
  const [formData, setFormData] = useState(() => recordToQuickForm(record));
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerIntakeQuickFormValue, string>>>({});
  const [saving, setSaving] = useState(false);

  function validate(): boolean {
    const errs = validateQuickForm(formData);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    setSaving(true);
    const { first, last } = quickFormToPrimaryNames(formData);
    upsertCustomerIntake({
      ...record,
      customerName: formData.accountName.trim(),
      email: formData.email.trim(),
      intakeOwner: formData.intakeOwner,
      primaryContactFirstName: first,
      primaryContactLastName: last,
      modifiedTime: new Date().toISOString(),
    });
    router.push(`/customer-intake/${record.id}`);
  }

  function handleSendEmail() {
    if (!validate()) return;
    const { first, last } = quickFormToPrimaryNames(formData);
    upsertCustomerIntake({
      ...record,
      customerName: formData.accountName.trim(),
      email: formData.email.trim(),
      intakeOwner: formData.intakeOwner,
      primaryContactFirstName: first,
      primaryContactLastName: last,
      modifiedTime: new Date().toISOString(),
    });
    if (formData.email) {
      window.location.href = `mailto:${formData.email}?subject=Customer Intake - ${formData.accountName.trim()}`;
    }
  }

  function handleCancel() {
    router.push(`/customer-intake/${record.id}`);
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="bg-white border-b border-slate-100 shadow-sm px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <button
          type="button"
          onClick={handleCancel}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} />
          {record.customerName}
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={handleSendEmail}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-[#002f93] text-white rounded-lg hover:bg-[#002070] transition-colors disabled:opacity-50"
          >
            <Mail size={14} />
            Send Email
          </button>
        </div>
      </div>

      <div className="flex-1 p-6">
        <CustomerIntakeQuickForm value={formData} onChange={setFormData} errors={errors} />
      </div>
    </div>
  );
}

export default function EditCustomerIntakePage() {
  const { id } = useParams<{ id: string }>();
  const record = useMemo(() => (typeof id === "string" ? getCustomerIntakeById(id) : null), [id]);

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
          <ClipboardList size={24} className="text-slate-400" />
        </div>
        <p className="text-base font-semibold text-slate-700">Record not found</p>
        <TenantLink href="/customer-intake" className="text-sm font-semibold text-[#002f93] hover:underline">
          ← Back to Customer Intake
        </TenantLink>
      </div>
    );
  }

  return <EditCustomerIntakeForm key={record.id} record={record} />;
}
