"use client";

import { useMemo } from "react";
import {
  INTAKE_OWNERS,
  IntakeFieldGrid,
  IntakeFormRow,
  IntakeSelectInput,
  IntakeSelectOption,
  IntakeTextInput,
  joinContactName,
  splitContactName,
} from "@/components/customer-intake/intake-form-shared";
import { loadAccounts } from "@/lib/mock-data/accounts";
import { loadContacts } from "@/lib/mock-data/contacts";

export interface CustomerIntakeQuickFormValue {
  /** Stable id from Contact screen (`ContactRecord.id`); empty until user selects. */
  contactId: string;
  contactName: string;
  email: string;
  accountName: string;
  intakeOwner: string;
}

export const EMPTY_QUICK_INTAKE: CustomerIntakeQuickFormValue = {
  contactId: "",
  contactName: "",
  email: "",
  accountName: "",
  intakeOwner: "Kevin Calamari",
};

export function quickFormToPrimaryNames(value: CustomerIntakeQuickFormValue) {
  return splitContactName(value.contactName);
}

export function recordToQuickForm(record: {
  primaryContactFirstName: string;
  primaryContactLastName: string;
  email: string;
  customerName: string;
  intakeOwner: string;
}): CustomerIntakeQuickFormValue {
  const contacts = loadContacts();
  const nameMatch = joinContactName(record.primaryContactFirstName, record.primaryContactLastName);
  const match =
    contacts.find(
      (c) =>
        joinContactName(c.firstName, c.lastName) === nameMatch &&
        c.email === record.email
    ) ??
    contacts.find(
      (c) =>
        joinContactName(c.firstName, c.lastName) === nameMatch &&
        (!record.customerName || c.accountName === record.customerName)
    ) ??
    contacts.find((c) => joinContactName(c.firstName, c.lastName) === nameMatch);

  return {
    contactId: match?.id ?? "",
    contactName: nameMatch,
    email: record.email,
    accountName: record.customerName,
    intakeOwner: record.intakeOwner,
  };
}

interface CustomerIntakeQuickFormProps {
  value: CustomerIntakeQuickFormValue;
  onChange: (v: CustomerIntakeQuickFormValue) => void;
  errors?: Partial<Record<keyof CustomerIntakeQuickFormValue, string>>;
}

export function CustomerIntakeQuickForm({ value, onChange, errors = {} }: CustomerIntakeQuickFormProps) {
  function patch(next: CustomerIntakeQuickFormValue) {
    onChange(next);
  }

  function setAccountName(accountName: string) {
    const next: CustomerIntakeQuickFormValue = { ...value, accountName };
    if (value.contactId) {
      const contacts = loadContacts();
      const c = contacts.find((x) => x.id === value.contactId);
      if (c && accountName && c.accountName !== accountName) {
        next.contactId = "";
        next.contactName = "";
        next.email = "";
      }
    }
    patch(next);
  }

  function setContactId(contactId: string) {
    if (!contactId) {
      patch({ ...value, contactId: "", contactName: "", email: "" });
      return;
    }
    const c = loadContacts().find((x) => x.id === contactId);
    if (!c) return;
    patch({
      ...value,
      contactId,
      contactName: joinContactName(c.firstName, c.lastName),
      email: c.email,
      accountName: c.accountName,
    });
  }

  const accountOptions: IntakeSelectOption[] = useMemo(() => {
    const names = [...new Set(loadAccounts().map((a) => a.name))].sort((a, b) =>
      a.localeCompare(b)
    );
    return [{ value: "", label: "Select account" }, ...names.map((n) => ({ value: n, label: n }))];
  }, []);

  const contactOptions: IntakeSelectOption[] = useMemo(() => {
    const contacts = loadContacts();
    const filtered = value.accountName.trim()
      ? contacts.filter((c) => c.accountName === value.accountName.trim())
      : contacts;
    const sorted = [...filtered].sort((a, b) =>
      joinContactName(a.firstName, a.lastName).localeCompare(
        joinContactName(b.firstName, b.lastName)
      )
    );
    const rows: IntakeSelectOption[] = sorted.map((c) => ({
      value: c.id,
      label: `${joinContactName(c.firstName, c.lastName)} (${c.accountName})`,
    }));

    const extra: IntakeSelectOption[] = [];
    if (value.contactId && !sorted.some((c) => c.id === value.contactId)) {
      const c = loadContacts().find((x) => x.id === value.contactId);
      if (c) {
        extra.push({
          value: c.id,
          label: `${joinContactName(c.firstName, c.lastName)} (${c.accountName})`,
        });
      }
    }

    return [{ value: "", label: "Select contact" }, ...extra, ...rows];
  }, [value.accountName, value.contactId]);

  const accountSelectValue = value.accountName.trim();
  const contactSelectValue = value.contactId;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-100 px-6 py-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Customer Intake</h3>
      </div>
      <div className="px-8 py-6 space-y-5">
        <IntakeFormRow>
          <IntakeFieldGrid label="Contact name" required>
            <IntakeSelectInput
              value={contactSelectValue}
              onChange={setContactId}
              options={contactOptions}
              error={errors.contactName}
            />
          </IntakeFieldGrid>
          <IntakeFieldGrid label="Customer Intake Owner">
            <IntakeSelectInput
              value={value.intakeOwner}
              onChange={(v) => patch({ ...value, intakeOwner: v })}
              options={INTAKE_OWNERS}
            />
          </IntakeFieldGrid>
        </IntakeFormRow>
        <IntakeFormRow>
          <IntakeFieldGrid label="Email" required>
            <IntakeTextInput
              type="email"
              placeholder="email@example.com"
              value={value.email}
              onChange={(v) => patch({ ...value, email: v })}
              error={errors.email}
              required
            />
          </IntakeFieldGrid>
          <IntakeFieldGrid label="Account name" required>
            <IntakeSelectInput
              value={accountSelectValue}
              onChange={setAccountName}
              options={accountOptions}
              error={errors.accountName}
            />
          </IntakeFieldGrid>
        </IntakeFormRow>
      </div>
    </div>
  );
}
