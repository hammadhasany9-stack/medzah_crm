"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, ClipboardList } from "lucide-react";
import {
  CustomerIntakeFormFields,
  CustomerIntakeFormData,
  EMPTY_INTAKE_FORM,
} from "@/components/customer-intake/CustomerIntakeFormFields";
import {
  CustomerIntakeRecord,
  getCustomerIntakeById,
  upsertCustomerIntake,
} from "@/lib/mock-data/customer-intake";

export default function EditCustomerIntakePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [record, setRecord] = useState<CustomerIntakeRecord | null>(null);
  const [formData, setFormData] = useState<CustomerIntakeFormData>(EMPTY_INTAKE_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerIntakeFormData, string>>>({});
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const found = getCustomerIntakeById(id);
    if (found) {
      setRecord(found);
      // Pre-fill form with all existing field values
      setFormData({
        customerFor: found.customerFor,
        customerName: found.customerName,
        primaryContactFirstName: found.primaryContactFirstName,
        primaryContactLastName: found.primaryContactLastName,
        email: found.email,
        primaryContactPhone: found.primaryContactPhone,
        primaryContactMobile: found.primaryContactMobile,
        website: found.website,
        accountsPayableFirstName: found.accountsPayableFirstName,
        accountsPayableLastName: found.accountsPayableLastName,
        accountsPayableEmail: found.accountsPayableEmail,
        accountsPayablePhone: found.accountsPayablePhone,
        primaryAddressStreet: found.primaryAddressStreet,
        primaryAddressCity: found.primaryAddressCity,
        primaryAddressState: found.primaryAddressState,
        primaryAddressZipCode: found.primaryAddressZipCode,
        orderMethodPreference: found.orderMethodPreference,
        w9OrTaxExempt: found.w9OrTaxExempt,
        jobTitle: found.jobTitle,
        intakeOwner: found.intakeOwner,
        secondaryEmail: found.secondaryEmail,
        salesRep: found.salesRep,
      });
    } else {
      setNotFound(true);
    }
  }, [id]);

  function validate(): boolean {
    const errs: Partial<Record<keyof CustomerIntakeFormData, string>> = {};
    if (!formData.customerName.trim()) errs.customerName = "Customer name is required";
    if (!formData.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = "Enter a valid email address";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate() || !record) return;
    setSaving(true);
    upsertCustomerIntake({
      ...record,
      ...formData,
      modifiedTime: new Date().toISOString(),
    });
    router.push(`/customer-intake/${record.id}`);
  }

  function handleSendEmail() {
    if (!validate() || !record) return;
    upsertCustomerIntake({
      ...record,
      ...formData,
      modifiedTime: new Date().toISOString(),
    });
    if (formData.email) {
      window.location.href = `mailto:${formData.email}?subject=Customer Intake - ${formData.customerName}`;
    }
  }

  function handleCancel() {
    router.push(`/customer-intake/${id}`);
  }

  // ── States ───────────────────────────────────────────────────────────────────

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
          <ClipboardList size={24} className="text-slate-400" />
        </div>
        <p className="text-base font-semibold text-slate-700">Record not found</p>
        <Link href="/customer-intake" className="text-sm font-semibold text-[#002f93] hover:underline">
          ← Back to Customer Intake
        </Link>
      </div>
    );
  }

  if (!record) {
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
          {record.customerName}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50"
          >
            Save Changes
          </button>
          <button
            onClick={handleSendEmail}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-[#002f93] text-white rounded-lg hover:bg-[#002070] transition-colors disabled:opacity-50"
          >
            <Mail size={14} />
            Send Email
          </button>
        </div>
      </div>

      {/* Form body */}
      <div className="flex-1 p-6">
        <CustomerIntakeFormFields
          value={formData}
          onChange={setFormData}
          errors={errors}
        />
      </div>
    </div>
  );
}
