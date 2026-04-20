"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import {
  CustomerIntakeFormFields,
  CustomerIntakeFormData,
  EMPTY_INTAKE_FORM,
} from "@/components/customer-intake/CustomerIntakeFormFields";
import {
  loadCustomerIntakes,
  saveCustomerIntakes,
  generateIntakeId,
} from "@/lib/mock-data/customer-intake";

export default function CreateCustomerIntakePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CustomerIntakeFormData>(EMPTY_INTAKE_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerIntakeFormData, string>>>({});
  const [saving, setSaving] = useState(false);

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

  function persistRecord() {
    const all = loadCustomerIntakes();
    all.unshift({
      id: generateIntakeId(),
      customerFor: formData.customerFor,
      customerName: formData.customerName,
      email: formData.email,
      intakeOwner: formData.intakeOwner,
      modifiedTime: new Date().toISOString(),
      status: "Onboarding Pending" as const,
      primaryContactFirstName: formData.primaryContactFirstName,
      primaryContactLastName: formData.primaryContactLastName,
      primaryContactPhone: formData.primaryContactPhone,
      primaryContactMobile: formData.primaryContactMobile,
      website: formData.website,
      accountsPayableFirstName: formData.accountsPayableFirstName,
      accountsPayableLastName: formData.accountsPayableLastName,
      accountsPayableEmail: formData.accountsPayableEmail,
      accountsPayablePhone: formData.accountsPayablePhone,
      primaryAddressStreet: formData.primaryAddressStreet,
      primaryAddressCity: formData.primaryAddressCity,
      primaryAddressState: formData.primaryAddressState,
      primaryAddressZipCode: formData.primaryAddressZipCode,
      orderMethodPreference: formData.orderMethodPreference,
      w9OrTaxExempt: formData.w9OrTaxExempt,
      jobTitle: formData.jobTitle,
      secondaryEmail: formData.secondaryEmail,
      salesRep: formData.salesRep,
    });
    saveCustomerIntakes(all);
  }

  function handleSave() {
    if (!validate()) return;
    setSaving(true);
    persistRecord();
    router.push("/customer-intake");
  }

  function handleSaveAndNew() {
    if (!validate()) return;
    setSaving(true);
    persistRecord();
    // Reset form for a fresh entry
    setFormData(EMPTY_INTAKE_FORM);
    setErrors({});
    setSaving(false);
  }

  function handleSendEmail() {
    if (!validate()) return;
    persistRecord();
    if (formData.email) {
      window.location.href = `mailto:${formData.email}?subject=Customer Intake - ${formData.customerName}`;
    }
  }

  function handleCancel() {
    router.push("/customer-intake");
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
          Create Customer Intake
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAndNew}
            disabled={saving}
            className="px-4 py-2 text-sm font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Save and New
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50"
          >
            Save
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
