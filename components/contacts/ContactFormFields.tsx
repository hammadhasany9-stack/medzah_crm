"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Lock, UserCircle2, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCRMShell } from "@/components/shell/CRMShellContext";
import { isClosedWonApprovedQuotedOpportunity } from "@/lib/opportunity-stage-guards";
import { getAccountNamesForContactsPicker, getAccountByName } from "@/lib/mock-data/accounts";
import type { Opportunity } from "@/lib/types";
import {
  ContactRecord,
  CONTACT_TYPES,
  CONTACT_OWNERS,
  CONTACT_ACCOUNT_NAMES,
  US_STATES,
  COUNTRIES,
  loadContacts,
} from "@/lib/mock-data/contacts";

export type ContactFormData = Omit<ContactRecord, "id" | "createdAt">;

export const EMPTY_FORM_DATA: ContactFormData = {
  contactOwner: "Kevin Calamari",
  firstName: "",
  lastName: "",
  contactType: "",
  email: "",
  phone: "",
  otherPhone: "",
  homePhone: "",
  mobile: "",
  fax: "",
  accountName: "",
  department: "",
  title: "",
  mailingStreet: "",
  mailingCity: "",
  mailingState: "",
  mailingCode: "",
  mailingCountry: "",
  otherStreet: "",
  otherCity: "",
  otherState: "",
  otherCode: "",
  otherCountry: "",
  description: "",
  linkedOpportunityId: "",
  linkedQuoteId: "",
};

interface ContactFormFieldsProps {
  contactId: string;
  value: ContactFormData;
  onChange: (data: ContactFormData) => void;
  errors?: Partial<Record<keyof ContactFormData, string>>;
}

// ─── Reusable field primitives ────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-slate-500 mb-1.5 tracking-wide">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002f93]/20 focus:border-[#002f93] transition-colors";

const selectCls =
  "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#002f93]/20 focus:border-[#002f93] transition-colors cursor-pointer appearance-none";

function TextInput({
  placeholder,
  value,
  onChange,
  type = "text",
  error,
}: {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string;
}) {
  return (
    <div>
      <input
        type={type}
        className={cn(inputCls, error && "border-red-300 ring-2 ring-red-100")}
        placeholder={placeholder ?? "None"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function SelectInput({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <select
        className={cn(selectCls, !value && "text-slate-400")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 4l4 4 4-4"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

function splitOppContactName(display: string): { firstName: string; lastName: string } {
  const t = display.trim();
  if (!t) return { firstName: "", lastName: "" };
  const i = t.indexOf(" ");
  if (i <= 0) return { firstName: t, lastName: "" };
  return { firstName: t.slice(0, i), lastName: t.slice(i + 1).trim() };
}

function applyAccountBillingToValue(
  base: ContactFormData,
  accountName: string
): ContactFormData {
  const acc = getAccountByName(accountName);
  if (!acc) return { ...base, accountName };
  return {
    ...base,
    accountName,
    mailingStreet: acc.billingStreet,
    mailingCity: acc.billingCity,
    mailingState: acc.billingState,
    mailingCode: acc.billingCode,
    mailingCountry: acc.billingCountry,
  };
}

// ─── Section header ───────────────────────────────────────────────────────────

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

// ─── Main component ───────────────────────────────────────────────────────────

export function ContactFormFields({
  contactId,
  value,
  onChange,
  errors = {},
}: ContactFormFieldsProps) {
  const { opportunities } = useCRMShell();

  const eligibleOpportunities = useMemo(
    () => opportunities.filter(isClosedWonApprovedQuotedOpportunity),
    [opportunities]
  );

  const [accountOptions, setAccountOptions] = useState<string[]>(CONTACT_ACCOUNT_NAMES);
  const [contactDisplayOptions, setContactDisplayOptions] = useState<string[]>([]);

  const refreshAccountOptions = useCallback(() => {
    const merged = new Set(getAccountNamesForContactsPicker());
    const extra = value.accountName?.trim();
    if (extra) merged.add(extra);
    eligibleOpportunities.forEach((o) => merged.add(o.accountName));
    setAccountOptions(Array.from(merged).sort((a, b) => a.localeCompare(b)));
  }, [value.accountName, eligibleOpportunities]);

  const refreshContactDisplayOptions = useCallback(() => {
    const accFilter = value.accountName?.trim();
    const merged = new Set<string>();
    loadContacts()
      .filter((c) => !accFilter || c.accountName === accFilter)
      .forEach((c) => {
        const line = `${c.firstName} ${c.lastName}`.trim();
        if (line) merged.add(line);
      });
    eligibleOpportunities.forEach((o) => {
      if (!accFilter || o.accountName === accFilter) {
        const line = o.contactName?.trim();
        if (line) merged.add(line);
      }
    });
    const cur = `${value.firstName} ${value.lastName}`.trim();
    if (cur) merged.add(cur);
    setContactDisplayOptions(Array.from(merged).sort((a, b) => a.localeCompare(b)));
  }, [value.accountName, value.firstName, value.lastName, eligibleOpportunities]);

  useEffect(() => {
    refreshAccountOptions();
  }, [refreshAccountOptions]);

  useEffect(() => {
    refreshContactDisplayOptions();
  }, [refreshContactDisplayOptions]);

  const contactDisplayValue = `${value.firstName} ${value.lastName}`.trim();

  const contactOptionsForSelect = useMemo(() => {
    const s = new Set(contactDisplayOptions);
    const cur = contactDisplayValue.trim();
    if (cur) s.add(cur);
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [contactDisplayOptions, contactDisplayValue]);

  useEffect(() => {
    function onFocus() {
      refreshAccountOptions();
      refreshContactDisplayOptions();
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshAccountOptions, refreshContactDisplayOptions]);

  function set<K extends keyof ContactFormData>(key: K, val: ContactFormData[K]) {
    onChange({ ...value, [key]: val });
  }

  function applyOpportunityToForm(opp: Opportunity) {
    const qid = opp.quoteData?.quoteId?.trim() ?? "";
    const { firstName, lastName } = splitOppContactName(opp.contactName || "");
    const next: ContactFormData = {
      ...value,
      linkedOpportunityId: opp.id,
      linkedQuoteId: qid,
      accountName: opp.accountName,
      firstName: firstName || value.firstName,
      lastName: lastName || value.lastName,
    };
    onChange(applyAccountBillingToValue(next, opp.accountName));
  }

  function handleLinkedOpportunityChange(oppId: string) {
    if (!oppId) {
      onChange({ ...value, linkedOpportunityId: "", linkedQuoteId: "" });
      return;
    }
    const opp = opportunities.find((o) => o.id === oppId);
    if (opp && isClosedWonApprovedQuotedOpportunity(opp)) applyOpportunityToForm(opp);
    else onChange({ ...value, linkedOpportunityId: oppId });
  }

  function handleLinkedQuoteChange(quoteRef: string) {
    if (!quoteRef) {
      onChange({ ...value, linkedQuoteId: "", linkedOpportunityId: "" });
      return;
    }
    const opp = eligibleOpportunities.find((o) => o.quoteData?.quoteId === quoteRef) ?? null;
    if (opp) applyOpportunityToForm(opp);
    else onChange({ ...value, linkedQuoteId: quoteRef });
  }

  function onAccountNameChange(next: string) {
    onChange(applyAccountBillingToValue({ ...value, accountName: next }, next));
  }

  function handleContactDisplayPick(display: string) {
    if (!display) return;
    const fromBook = loadContacts().find(
      (c) => `${c.firstName} ${c.lastName}`.trim() === display
    );
    if (fromBook) {
      onChange({
        ...value,
        firstName: fromBook.firstName,
        lastName: fromBook.lastName,
        email: fromBook.email || value.email,
        phone: fromBook.phone || value.phone,
        accountName: fromBook.accountName || value.accountName,
      });
      return;
    }
    const { firstName, lastName } = splitOppContactName(display);
    onChange({ ...value, firstName, lastName });
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      {/* Add Image */}
      <div className="mb-2">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
          Add Image
        </p>
        <div className="relative w-16 h-16 group cursor-pointer">
          <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center group-hover:border-[#002f93] transition-colors">
            <UserCircle2
              size={28}
              className="text-slate-400 group-hover:text-[#002f93] transition-colors"
            />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#002f93] flex items-center justify-center shadow">
            <Camera size={10} className="text-white" />
          </div>
        </div>
      </div>

      {/* ── CONTACT INFORMATION ── */}
      <SectionHeader title="Contact Information" />

      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        {/* Contact ID (read-only) */}
        <div>
          <FieldLabel>Contact ID</FieldLabel>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-600">
            <span className="flex-1 font-mono">{contactId}</span>
            <Lock size={12} className="text-slate-400 flex-shrink-0" />
          </div>
        </div>

        {/* Contact Owner */}
        <div>
          <FieldLabel>Contact Owner</FieldLabel>
          <SelectInput
            options={CONTACT_OWNERS}
            value={value.contactOwner}
            onChange={(v) => set("contactOwner", v)}
          />
        </div>

        {/* Opportunity ID — Closed Won with approved quote only (same rule as Create Contract) */}
        <div>
          <FieldLabel>Opportunity ID</FieldLabel>
          <div className="relative">
            <select
              className={cn(selectCls, !value.linkedOpportunityId && "text-slate-400")}
              value={value.linkedOpportunityId ?? ""}
              onChange={(e) => handleLinkedOpportunityChange(e.target.value)}
            >
              <option value="" disabled>
                Select Closed Won opportunity
              </option>
              {eligibleOpportunities.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.opportunityRef} — {o.opportunityName}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 4l4 4 4-4"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Quote ID — Closed Won deals only */}
        <div>
          <FieldLabel>Quote ID</FieldLabel>
          <div className="relative">
            <select
              className={cn(selectCls, !value.linkedQuoteId && "text-slate-400")}
              value={value.linkedQuoteId ?? ""}
              onChange={(e) => handleLinkedQuoteChange(e.target.value)}
            >
              <option value="" disabled>
                Select quote (Closed Won)
              </option>
              {eligibleOpportunities.map((o) => (
                <option
                  key={`${o.id}-${o.quoteData!.quoteId}`}
                  value={o.quoteData!.quoteId!}
                >
                  {o.quoteData!.quoteId} — {o.quoteData!.subject}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 4l4 4 4-4"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* First Name */}
        <div>
          <FieldLabel required>First Name</FieldLabel>
          <TextInput
            placeholder="Enter Name"
            value={value.firstName}
            onChange={(v) => set("firstName", v)}
            error={errors.firstName}
          />
        </div>

        {/* Last Name */}
        <div>
          <FieldLabel>Last Name</FieldLabel>
          <TextInput
            placeholder="Enter Name"
            value={value.lastName}
            onChange={(v) => set("lastName", v)}
          />
        </div>

        {/* Contact Type */}
        <div>
          <FieldLabel>Contact Type</FieldLabel>
          <SelectInput
            options={CONTACT_TYPES}
            value={value.contactType}
            onChange={(v) => set("contactType", v)}
            placeholder="Select Type"
          />
        </div>

        {/* Email */}
        <div>
          <FieldLabel>Email</FieldLabel>
          <TextInput
            placeholder="None"
            value={value.email}
            onChange={(v) => set("email", v)}
            type="email"
            error={errors.email}
          />
        </div>

        {/* Phone */}
        <div>
          <FieldLabel>Phone</FieldLabel>
          <TextInput
            placeholder="None"
            value={value.phone}
            onChange={(v) => set("phone", v)}
            type="tel"
          />
        </div>

        {/* Other Phone */}
        <div>
          <FieldLabel>Other Phone</FieldLabel>
          <TextInput
            placeholder="None"
            value={value.otherPhone}
            onChange={(v) => set("otherPhone", v)}
            type="tel"
          />
        </div>

        {/* Home Phone */}
        <div>
          <FieldLabel>Home Phone</FieldLabel>
          <TextInput
            placeholder="None"
            value={value.homePhone}
            onChange={(v) => set("homePhone", v)}
            type="tel"
          />
        </div>

        {/* Mobile */}
        <div>
          <FieldLabel>Mobile</FieldLabel>
          <TextInput
            placeholder="None"
            value={value.mobile}
            onChange={(v) => set("mobile", v)}
            type="tel"
          />
        </div>

        {/* Fax */}
        <div>
          <FieldLabel>Fax</FieldLabel>
          <TextInput
            placeholder="None"
            value={value.fax}
            onChange={(v) => set("fax", v)}
          />
        </div>

        {/* Account Name */}
        <div>
          <FieldLabel>Account Name</FieldLabel>
          <SelectInput
            options={accountOptions}
            value={value.accountName}
            onChange={onAccountNameChange}
            placeholder="Select Account"
          />
        </div>

        {/* Contact name — matches account when possible; from saved contacts + Closed Won deals */}
        <div>
          <FieldLabel>Contact name</FieldLabel>
          <SelectInput
            options={contactOptionsForSelect}
            value={contactDisplayValue}
            onChange={handleContactDisplayPick}
            placeholder="Select contact name"
          />
        </div>

        {/* Department */}
        <div>
          <FieldLabel>Department</FieldLabel>
          <TextInput
            placeholder="None"
            value={value.department}
            onChange={(v) => set("department", v)}
          />
        </div>

        {/* Title */}
        <div>
          <FieldLabel>Title</FieldLabel>
          <TextInput
            placeholder="None"
            value={value.title}
            onChange={(v) => set("title", v)}
          />
        </div>
      </div>

      {/* ── ADDRESS INFORMATION ── */}
      <SectionHeader title="Address Information" />

      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        {/* Mailing Street */}
        <div>
          <FieldLabel>Mailing Street</FieldLabel>
          <TextInput
            placeholder="Enter Street"
            value={value.mailingStreet}
            onChange={(v) => set("mailingStreet", v)}
          />
        </div>

        {/* Other Street */}
        <div>
          <FieldLabel>Other Street</FieldLabel>
          <TextInput
            placeholder="Enter Street"
            value={value.otherStreet}
            onChange={(v) => set("otherStreet", v)}
          />
        </div>

        {/* Mailing City */}
        <div>
          <FieldLabel>Mailing City</FieldLabel>
          <TextInput
            placeholder="Enter City"
            value={value.mailingCity}
            onChange={(v) => set("mailingCity", v)}
          />
        </div>

        {/* Other City */}
        <div>
          <FieldLabel>Other City</FieldLabel>
          <TextInput
            placeholder="Enter City"
            value={value.otherCity}
            onChange={(v) => set("otherCity", v)}
          />
        </div>

        {/* Mailing State */}
        <div>
          <FieldLabel>Mailing State</FieldLabel>
          <SelectInput
            options={US_STATES}
            value={value.mailingState}
            onChange={(v) => set("mailingState", v)}
            placeholder="Enter State"
          />
        </div>

        {/* Other State */}
        <div>
          <FieldLabel>Other State</FieldLabel>
          <SelectInput
            options={US_STATES}
            value={value.otherState}
            onChange={(v) => set("otherState", v)}
            placeholder="Enter State"
          />
        </div>

        {/* Mailing Code */}
        <div>
          <FieldLabel>Mailing Code</FieldLabel>
          <TextInput
            placeholder="Enter Code"
            value={value.mailingCode}
            onChange={(v) => set("mailingCode", v)}
          />
        </div>

        {/* Other Code */}
        <div>
          <FieldLabel>Other Code</FieldLabel>
          <TextInput
            placeholder="Enter Code"
            value={value.otherCode}
            onChange={(v) => set("otherCode", v)}
          />
        </div>

        {/* Mailing Country */}
        <div>
          <FieldLabel>Mailing Country</FieldLabel>
          <SelectInput
            options={COUNTRIES}
            value={value.mailingCountry}
            onChange={(v) => set("mailingCountry", v)}
            placeholder="Enter Country"
          />
        </div>

        {/* Other Country */}
        <div>
          <FieldLabel>Other Country</FieldLabel>
          <SelectInput
            options={COUNTRIES}
            value={value.otherCountry}
            onChange={(v) => set("otherCountry", v)}
            placeholder="Enter Country"
          />
        </div>
      </div>

      {/* ── DESCRIPTION ── */}
      <SectionHeader title="Description" />

      <textarea
        rows={4}
        placeholder="Enter Description"
        value={value.description}
        onChange={(e) => set("description", e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002f93]/20 focus:border-[#002f93] transition-colors resize-none"
      />
    </div>
  );
}
