"use client";

import { useState } from "react";
import { useTenantRouter } from "@/components/providers/TenantProvider";
import { ArrowLeft, Mail } from "lucide-react";
import {
  CustomerIntakeQuickForm,
  EMPTY_QUICK_INTAKE,
  CustomerIntakeQuickFormValue,
  quickFormToPrimaryNames,
} from "@/components/customer-intake/CustomerIntakeQuickForm";
import { EMPTY_INTAKE_FORM } from "@/components/customer-intake/intake-form-shared";
import {
  loadCustomerIntakes,
  saveCustomerIntakes,
  generateIntakeId,
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

export default function CreateCustomerIntakePage() {
  const router = useTenantRouter();
  const [formData, setFormData] = useState<CustomerIntakeQuickFormValue>(EMPTY_QUICK_INTAKE);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerIntakeQuickFormValue, string>>>({});
  const [saving, setSaving] = useState(false);

  function validate(): boolean {
    const errs = validateQuickForm(formData);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function persistRecord() {
    const { first, last } = quickFormToPrimaryNames(formData);
    const extended = EMPTY_INTAKE_FORM;
    const all = loadCustomerIntakes();
    all.unshift({
      id: generateIntakeId(),
      customerFor: extended.customerFor,
      customerName: formData.accountName.trim(),
      email: formData.email.trim(),
      intakeOwner: formData.intakeOwner,
      modifiedTime: new Date().toISOString(),
      status: "Onboarding Pending" as const,
      primaryContactFirstName: first,
      primaryContactLastName: last,
      primaryContactPhone: extended.primaryContactPhone,
      primaryContactMobile: extended.primaryContactMobile,
      website: extended.website,
      accountsPayableFirstName: extended.accountsPayableFirstName,
      accountsPayableLastName: extended.accountsPayableLastName,
      accountsPayableEmail: extended.accountsPayableEmail,
      accountsPayablePhone: extended.accountsPayablePhone,
      primaryAddressStreet: extended.primaryAddressStreet,
      primaryAddressCity: extended.primaryAddressCity,
      primaryAddressState: extended.primaryAddressState,
      primaryAddressZipCode: extended.primaryAddressZipCode,
      orderMethodPreference: extended.orderMethodPreference,
      w9OrTaxExempt: extended.w9OrTaxExempt,
      jobTitle: extended.jobTitle,
      secondaryEmail: extended.secondaryEmail,
      salesRep: extended.salesRep,
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
    setFormData(EMPTY_QUICK_INTAKE);
    setErrors({});
    setSaving(false);
  }

  function handleSendEmail() {
    if (!validate()) return;
    persistRecord();
    if (formData.email) {
      window.location.href = `mailto:${formData.email}?subject=Customer Intake - ${formData.accountName.trim()}`;
    }
  }

  function handleCancel() {
    router.push("/customer-intake");
  }

  return (
    <div className="flex flex-col min-h-full">
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

      <div className="flex-1 p-6">
        <CustomerIntakeQuickForm value={formData} onChange={setFormData} errors={errors} />
      </div>
    </div>
  );
}
