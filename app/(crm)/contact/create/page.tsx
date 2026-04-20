"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  ContactFormFields,
  ContactFormData,
  EMPTY_FORM_DATA,
} from "@/components/contacts/ContactFormFields";
import { generateContactId, upsertContact } from "@/lib/mock-data/contacts";

export default function CreateContactPage() {
  const router = useRouter();
  const [contactId, setContactId] = useState(() => generateContactId());
  const [formData, setFormData] = useState<ContactFormData>(EMPTY_FORM_DATA);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [saving, setSaving] = useState(false);

  function validate(): boolean {
    const errs: Partial<Record<keyof ContactFormData, string>> = {};
    if (!formData.firstName.trim()) errs.firstName = "First name is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    setSaving(true);
    upsertContact({
      id: contactId,
      ...formData,
      createdAt: new Date().toISOString(),
    });
    router.push("/contact");
  }

  function handleSaveAndNew() {
    if (!validate()) return;
    setSaving(true);
    upsertContact({
      id: contactId,
      ...formData,
      createdAt: new Date().toISOString(),
    });
    setFormData(EMPTY_FORM_DATA);
    setErrors({});
    setContactId(generateContactId());
    setSaving(false);
  }

  function handleCancel() {
    router.push("/contact");
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
          Create Contact
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-5 py-2 text-sm font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAndNew}
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Save and New
          </button>
        </div>
      </div>

      {/* Form body */}
      <div className="flex-1 p-6">
        <ContactFormFields
          contactId={contactId}
          value={formData}
          onChange={setFormData}
          errors={errors}
        />
      </div>
    </div>
  );
}
