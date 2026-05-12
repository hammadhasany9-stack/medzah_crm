"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Check, X, CalendarDays, AlertCircle, ChevronDown, Info } from "lucide-react";
import { OpportunityData, Priority } from "@/lib/types";
import type { AccountRecord } from "@/lib/mock-data/accounts";
import { loadAccounts } from "@/lib/mock-data/accounts";
import { formatPhoneMobile, loadContacts } from "@/lib/mock-data/contacts";
import {
  contactDisplayLabel,
  contactIdCompatibleWithAccount,
  contactsForAccountName,
  validateExistingLeadSelection,
} from "@/lib/lead-customer-linking";

export type { OpportunityData };

export interface QualifiedLeadPrefill {
  companyName?: string;
  website?: string;
  industry?: string;
  expectedRevenue?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  gender?: string;
}

interface QualifiedModalProps {
  /** Display name for context (e.g. lead primary contact). */
  leadName: string;
  defaultContactName?: string;
  defaultAccountName?: string;
  /** Values from the lead card when present. */
  leadPrefill?: QualifiedLeadPrefill;
  onSave: (data: OpportunityData) => void;
  onCancel: () => void;
}

const BUSINESS_TYPES   = ["B2B", "B2C", "B2G", "New Business", "Existing Business", "Retail", "Wholesale", "Other"];
const PIPELINES        = ["Medzah Sales Pipeline", "Medzah Bid Opportunity Pipeline"];
const LEAD_PRIORITIES: Priority[] = ["Hot", "Warm", "Cold"];
const INDUSTRIES       = ["None", "Healthcare", "Retail", "Hospitality", "Education", "Real Estate", "Technology", "Finance", "Construction", "Other"];
const GENDER_OPTIONS   = ["Male", "Female", "Non-binary", "Prefer not to say", "Other"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function addDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y.slice(2)}`;
}

function splitContactName(full: string): { first: string; last: string } {
  const t = full.trim();
  if (!t) return { first: "", last: "" };
  const i = t.indexOf(" ");
  if (i === -1) return { first: t, last: "" };
  return { first: t.slice(0, i), last: t.slice(i + 1).trim() };
}

function initialAccountDetails(prefill: QualifiedLeadPrefill | undefined, defaultCompany: string) {
  return {
    companyName: prefill?.companyName ?? defaultCompany,
    website:     prefill?.website ?? "",
    industry:    prefill?.industry && prefill.industry !== "None" ? prefill.industry : "None",
  };
}

function emptyAddress() {
  return { street: "", city: "", state: "", zip: "", country: "" };
}

function initialContactDetails(prefill: QualifiedLeadPrefill | undefined, defaultContactFull: string) {
  const fromSplit =
    prefill?.firstName != null || prefill?.lastName != null
      ? { first: prefill?.firstName ?? "", last: prefill?.lastName ?? "" }
      : splitContactName(defaultContactFull);
  return {
    firstName: prefill?.firstName ?? fromSplit.first,
    lastName:  prefill?.lastName ?? fromSplit.last,
    email:     prefill?.email ?? "",
    mobile:    prefill?.mobile ?? "",
    gender:    prefill?.gender ?? "",
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[13px] font-semibold text-slate-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = (err?: boolean) =>
  `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93] placeholder:text-slate-400 transition-colors ${
    err ? "border-red-300 bg-red-50/40" : "border-slate-200"
  }`;

const selectCls = (err?: boolean) =>
  `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93] bg-white appearance-none transition-colors ${
    err ? "border-red-300 bg-red-50/40" : "border-slate-200"
  }`;

function SelectWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[13px] font-semibold text-slate-800">{label}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[#002f93] focus:ring-offset-2 ${
          checked ? "bg-[#002f93]" : "bg-slate-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export function QualifiedModal({
  leadName,
  defaultContactName = "",
  defaultAccountName = "",
  leadPrefill,
  onSave,
  onCancel,
}: QualifiedModalProps) {
  const dateRef = useRef<HTMLInputElement>(null);
  const closingRef = useRef<HTMLInputElement>(null);
  const [attempted, setAttempted] = useState(false);
  const [existingAccount, setExistingAccount] = useState(false);
  const [existingContact, setExistingContact] = useState(false);
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedContactId, setSelectedContactId] = useState("");
  const [existingError, setExistingError] = useState<string | null>(null);

  const [accountDetails, setAccountDetails] = useState(() =>
    initialAccountDetails(leadPrefill, defaultAccountName)
  );
  const [contactDetails, setContactDetails] = useState(() =>
    initialContactDetails(leadPrefill, defaultContactName)
  );
  const [addressDetails, setAddressDetails] = useState(emptyAddress);

  useEffect(() => {
    setAccounts(loadAccounts().slice().sort((a, b) => a.name.localeCompare(b.name)));
  }, []);

  const allContacts = useMemo(() => loadContacts(), []);
  const selectedAccountRecord = accounts.find((a) => a.id === selectedAccountId);
  const contactOptions = useMemo(() => {
    if (existingAccount && selectedAccountId && selectedAccountRecord) {
      return contactsForAccountName(selectedAccountRecord.name, allContacts);
    }
    return allContacts;
  }, [existingAccount, selectedAccountId, selectedAccountRecord, allContacts]);

  const [form, setForm] = useState<OpportunityData>({
    accountName:     defaultAccountName,
    businessType:    "",
    closingDate:     "",
    contactName:     defaultContactName,
    pipeline:        "",
    expectedRevenue: leadPrefill?.expectedRevenue ?? "",
    amount:          "",
    campaignSource:  "",
    description:     "",
    followUpDate:    addDays(2),
    leadPriority:    "Hot",
  });

  function set<K extends keyof OpportunityData>(key: K, val: OpportunityData[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function setAccount<K extends keyof typeof accountDetails>(key: K, val: (typeof accountDetails)[K]) {
    setAccountDetails((d) => ({ ...d, [key]: val }));
  }

  function setContact<K extends keyof typeof contactDetails >(key: K, val: (typeof contactDetails)[K]) {
    setContactDetails((d) => ({ ...d, [key]: val }));
  }

  function onExistingAccountToggle(next: boolean) {
    setExistingAccount(next);
    setSelectedAccountId("");
    setExistingError(null);
    if (!next) {
      setAccountDetails(initialAccountDetails(leadPrefill, defaultAccountName));
    }
  }

  function onExistingContactToggle(next: boolean) {
    setExistingContact(next);
    setSelectedContactId("");
    setExistingError(null);
    if (!next) {
      setContactDetails(initialContactDetails(leadPrefill, defaultContactName));
    }
  }

  function handleAccountChange(accountId: string) {
    setSelectedAccountId(accountId);
    const acc = accounts.find((a) => a.id === accountId);
    if (!contactIdCompatibleWithAccount(selectedContactId, acc, allContacts)) {
      setSelectedContactId("");
    }
  }

  function handleContactChange(contactId: string) {
    setSelectedContactId(contactId);
    if (!existingAccount) return;
    const c = allContacts.find((x) => x.id === contactId);
    if (!c) return;
    const match = accounts.find((a) => a.name === c.accountName);
    if (match) setSelectedAccountId(match.id);
  }

  const customerPartOk =
    existingAccount && existingContact
      ? selectedAccountId.trim() !== "" && selectedContactId.trim() !== ""
      : existingAccount && !existingContact
        ? selectedAccountId.trim() !== "" &&
          contactDetails.firstName.trim() !== "" &&
          contactDetails.lastName.trim() !== ""
        : !existingAccount && existingContact
          ? accountDetails.companyName.trim() !== "" && selectedContactId.trim() !== ""
          : accountDetails.companyName.trim() !== "" &&
            contactDetails.firstName.trim() !== "" &&
            contactDetails.lastName.trim() !== "";

  const requiredFilled =
    form.businessType !== "" &&
    form.closingDate !== "" &&
    form.pipeline !== "" &&
    customerPartOk;

  function handleSave() {
    setAttempted(true);
    setExistingError(null);
    if (!requiredFilled) return;

    let payload: OpportunityData;

    const base = {
      ...form,
      amount: "",
      campaignSource: "",
    };

    if (existingAccount && existingContact) {
      const v = validateExistingLeadSelection(selectedAccountId, selectedContactId, accounts, allContacts);
      if (!v.ok) {
        setExistingError(v.message);
        return;
      }
      const { contact: vContact, account: vAccount } = v;
      const displayName = `${vContact.firstName} ${vContact.lastName}`.trim();
      const phoneLine = formatPhoneMobile(vContact) || vContact.phone || vContact.mobile || "";
      payload = {
        ...base,
        expectedRevenue: form.expectedRevenue,
        accountName: vAccount.name,
        contactName: displayName,
        customerType: "existing",
        linkedAccountId: vAccount.id,
        linkedContactId: vContact.id,
        contactEmail: vContact.email ?? "",
        contactPhone: phoneLine,
      };
    } else if (existingAccount && !existingContact) {
      const acc = accounts.find((a) => a.id === selectedAccountId);
      if (!acc) {
        setExistingError("Select a valid account.");
        return;
      }
      const cn = `${contactDetails.firstName} ${contactDetails.lastName}`.trim();
      payload = {
        ...base,
        accountName: acc.name,
        contactName: cn,
        contactEmail: contactDetails.email,
        contactPhone: contactDetails.mobile,
        customerType: "new",
        linkedAccountId: acc.id,
        linkedContactId: undefined,
        contactFirstName: contactDetails.firstName,
        contactLastName: contactDetails.lastName,
        contactGender: contactDetails.gender || undefined,
      };
    } else if (!existingAccount && existingContact) {
      const contact = allContacts.find((c) => c.id === selectedContactId);
      if (!contact) {
        setExistingError("Select a valid contact.");
        return;
      }
      const displayName = `${contact.firstName} ${contact.lastName}`.trim();
      const phoneLine = formatPhoneMobile(contact) || contact.phone || contact.mobile || "";
      payload = {
        ...base,
        expectedRevenue: form.expectedRevenue,
        accountName: accountDetails.companyName.trim(),
        contactName: displayName,
        contactEmail: contact.email ?? "",
        contactPhone: phoneLine,
        customerType: "new",
        linkedAccountId: undefined,
        linkedContactId: contact.id,
        accountWebsite: accountDetails.website || undefined,
        accountIndustry: accountDetails.industry !== "None" ? accountDetails.industry : undefined,
      };
    } else {
      const cn = `${contactDetails.firstName} ${contactDetails.lastName}`.trim();
      payload = {
        ...base,
        expectedRevenue: form.expectedRevenue,
        accountName: accountDetails.companyName.trim(),
        contactName: cn,
        contactEmail: contactDetails.email,
        contactPhone: contactDetails.mobile,
        customerType: "new",
        linkedAccountId: undefined,
        linkedContactId: undefined,
        accountWebsite: accountDetails.website || undefined,
        accountIndustry: accountDetails.industry !== "None" ? accountDetails.industry : undefined,
        contactFirstName: contactDetails.firstName,
        contactLastName: contactDetails.lastName,
        contactGender: contactDetails.gender || undefined,
      };
    }

    const withAddr =
      !existingAccount || !existingContact
        ? {
            addressStreet: addressDetails.street,
            addressCity: addressDetails.city,
            addressState: addressDetails.state,
            addressZip: addressDetails.zip,
            addressCountry: addressDetails.country,
          }
        : {};

    onSave({ ...payload, ...withAddr });
  }

  const e = (field: keyof OpportunityData) =>
    attempted && (form[field] === "" || form[field] === null);

  const existingAccountErr = attempted && existingAccount && !selectedAccountId;
  const existingContactSelErr = attempted && existingContact && !selectedContactId;
  const companyErr =
    attempted && !existingAccount && !accountDetails.companyName.trim();
  const contactNameErr =
    attempted &&
    !existingContact &&
    (!contactDetails.firstName.trim() || !contactDetails.lastName.trim());

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={(ev) => { if (ev.target === ev.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-2xl w-[640px] mx-4 shadow-[0_24px_64px_rgba(0,0,0,0.22)] overflow-hidden max-h-[92vh] flex flex-col">

        <div className="flex justify-end pt-4 pr-4 flex-shrink-0">
          <button type="button" onClick={onCancel} className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-8 pb-8 -mt-2">
          <div className="flex flex-col items-center gap-1 mb-5">
            <div className="w-11 h-11 rounded-full bg-slate-900 flex items-center justify-center shadow-md mb-2">
              <Check size={20} strokeWidth={3} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Lead Status Changed!</h2>
            <p className="text-sm text-slate-500 text-center">
              Your lead has moved to qualified, fill this form to create an opportunity
            </p>
            <p className="text-xs text-slate-400 text-center">{leadName}</p>

            <div className="flex items-start gap-2 mt-2 bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 w-full">
              <AlertCircle size={14} className="text-sky-600 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-sky-900 leading-relaxed text-left">
                If the account and contact already exist in the system, choose them by switching the toggles. If the customer is new, fill the fields accordingly. According to your entries, the account and contact information will be added in the respective fields.
              </p>
            </div>
            <div className="flex items-start gap-2 mt-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 w-full">
              <Info size={14} className="text-slate-600 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-slate-700 leading-relaxed text-left">
                When you save, any new account, new contact, and general address you enter is added to the Accounts and Contacts lists so the data exists in the system from what you filled in here.
              </p>
            </div>
          </div>

          <p className="text-[15px] font-bold text-slate-900 text-center mb-4">Create new Opportunity</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-100">
            <ToggleRow
              label="Existing Account"
              hint="Link an account from CRM."
              checked={existingAccount}
              onChange={onExistingAccountToggle}
            />
            <ToggleRow
              label="Existing Contact"
              hint="Link a contact from CRM."
              checked={existingContact}
              onChange={onExistingContactToggle}
            />
          </div>

          {!existingAccount && (
            <div className="mb-4 p-4 rounded-xl border border-slate-200 bg-slate-50/60">
              <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-3">Account details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                <Field label="Company Name" required>
                  <input
                    type="text"
                    value={accountDetails.companyName}
                    onChange={(ev) => setAccount("companyName", ev.target.value)}
                    className={inputCls(companyErr)}
                    placeholder="Company name"
                  />
                </Field>
                <Field label="Website">
                  <input
                    type="text"
                    value={accountDetails.website}
                    onChange={(ev) => setAccount("website", ev.target.value)}
                    className={inputCls()}
                    placeholder="https://example.com"
                  />
                </Field>
                <Field label="Expected revenue">
                  <input
                    type="text"
                    value={form.expectedRevenue}
                    onChange={(ev) => set("expectedRevenue", ev.target.value)}
                    className={inputCls()}
                    placeholder="e.g. $48,500"
                  />
                </Field>
                <Field label="Industry">
                  <SelectWrap>
                    <select
                      value={accountDetails.industry}
                      onChange={(ev) => setAccount("industry", ev.target.value)}
                      className={selectCls()}
                    >
                      {INDUSTRIES.map((i) => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                  </SelectWrap>
                </Field>
              </div>
            </div>
          )}

          {!existingContact && (
            <div className="mb-4 p-4 rounded-xl border border-slate-200 bg-slate-50/60">
              <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-3">Contact details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                <Field label="First Name" required>
                  <input
                    type="text"
                    value={contactDetails.firstName}
                    onChange={(ev) => setContact("firstName", ev.target.value)}
                    className={inputCls(contactNameErr)}
                    placeholder="First name"
                  />
                </Field>
                <Field label="Last Name" required>
                  <input
                    type="text"
                    value={contactDetails.lastName}
                    onChange={(ev) => setContact("lastName", ev.target.value)}
                    className={inputCls(contactNameErr)}
                    placeholder="Last name"
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    value={contactDetails.email}
                    onChange={(ev) => setContact("email", ev.target.value)}
                    className={inputCls()}
                    placeholder="email@company.com"
                  />
                </Field>
                <Field label="Mobile No.">
                  <input
                    type="text"
                    value={contactDetails.mobile}
                    onChange={(ev) => setContact("mobile", ev.target.value)}
                    className={inputCls()}
                    placeholder="+1 (555) 000-0000"
                  />
                </Field>
                <Field label="Gender">
                  <SelectWrap>
                    <select
                      value={contactDetails.gender}
                      onChange={(ev) => setContact("gender", ev.target.value)}
                      className={selectCls()}
                    >
                      <option value="">Select</option>
                      {GENDER_OPTIONS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </SelectWrap>
                </Field>
              </div>
            </div>
          )}

          {(!existingAccount || !existingContact) && (
            <div className="mb-4 p-4 rounded-xl border border-slate-200 bg-slate-50/60">
              <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-3">General address</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                <Field label="Street">
                  <input
                    type="text"
                    value={addressDetails.street}
                    onChange={(ev) => setAddressDetails((d) => ({ ...d, street: ev.target.value }))}
                    className={inputCls()}
                    placeholder="Street address"
                  />
                </Field>
                <Field label="City">
                  <input
                    type="text"
                    value={addressDetails.city}
                    onChange={(ev) => setAddressDetails((d) => ({ ...d, city: ev.target.value }))}
                    className={inputCls()}
                    placeholder="City"
                  />
                </Field>
                <Field label="State / Province">
                  <input
                    type="text"
                    value={addressDetails.state}
                    onChange={(ev) => setAddressDetails((d) => ({ ...d, state: ev.target.value }))}
                    className={inputCls()}
                    placeholder="State or province"
                  />
                </Field>
                <Field label="ZIP / Postal code">
                  <input
                    type="text"
                    value={addressDetails.zip}
                    onChange={(ev) => setAddressDetails((d) => ({ ...d, zip: ev.target.value }))}
                    className={inputCls()}
                    placeholder="ZIP or postal code"
                  />
                </Field>
                <Field label="Country">
                  <input
                    type="text"
                    value={addressDetails.country}
                    onChange={(ev) => setAddressDetails((d) => ({ ...d, country: ev.target.value }))}
                    className={inputCls()}
                    placeholder="Country"
                  />
                </Field>
              </div>
            </div>
          )}

          {attempted && existingError && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
              <AlertCircle size={13} className="flex-shrink-0" />
              {existingError}
            </div>
          )}

          {attempted && !requiredFilled && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
              <AlertCircle size={13} className="flex-shrink-0" />
              Please fill in all required fields before saving.
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-4 gap-y-4 mb-4">
            {existingAccount && existingContact && (
              <>
                <Field label="Account Name" required>
                  <SelectWrap>
                    <select
                      value={selectedAccountId}
                      onChange={(ev) => handleAccountChange(ev.target.value)}
                      className={selectCls(existingAccountErr)}
                    >
                      <option value="">Select account</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </SelectWrap>
                </Field>
                <Field label="Business Type" required>
                  <SelectWrap>
                    <select
                      value={form.businessType}
                      onChange={(ev) => set("businessType", ev.target.value)}
                      className={selectCls(e("businessType"))}
                    >
                      <option value="">Select type</option>
                      {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </SelectWrap>
                </Field>
                <Field label="Contact Name" required>
                  <SelectWrap>
                    <select
                      value={selectedContactId}
                      onChange={(ev) => handleContactChange(ev.target.value)}
                      className={selectCls(existingContactSelErr)}
                    >
                    <option value="">
                      {!selectedAccountId ? "Select account first or choose contact" : "Select contact"}
                    </option>
                      {contactOptions.map((c) => (
                        <option key={c.id} value={c.id}>{contactDisplayLabel(c)}</option>
                      ))}
                    </select>
                  </SelectWrap>
                </Field>
                <Field label="Closing Date" required>
                  <div
                    className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors ${e("closingDate") ? "border-red-300 bg-red-50/40" : "border-slate-200"}`}
                    onClick={() => closingRef.current?.showPicker()}
                  >
                    <CalendarDays size={14} className="text-slate-400 flex-shrink-0" />
                    <span className={form.closingDate ? "text-slate-800" : "text-slate-400"}>
                      {form.closingDate ? formatDate(form.closingDate) : "Select date"}
                    </span>
                    <input
                      ref={closingRef}
                      type="date"
                      value={form.closingDate}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(ev) => set("closingDate", ev.target.value)}
                      className="absolute opacity-0 w-0 h-0 pointer-events-none"
                    />
                  </div>
                </Field>
                <Field label="Pipeline" required>
                  <SelectWrap>
                    <select
                      value={form.pipeline}
                      onChange={(ev) => set("pipeline", ev.target.value)}
                      className={selectCls(e("pipeline"))}
                    >
                      <option value="">Select pipeline</option>
                      {PIPELINES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </SelectWrap>
                </Field>
                <Field label="Expected Revenue">
                  <input
                    type="text"
                    value={form.expectedRevenue}
                    onChange={(ev) => set("expectedRevenue", ev.target.value)}
                    placeholder="Enter expected revenue"
                    className={inputCls()}
                  />
                </Field>
              </>
            )}

            {existingAccount && !existingContact && (
              <>
                <Field label="Account Name" required>
                  <SelectWrap>
                    <select
                      value={selectedAccountId}
                      onChange={(ev) => handleAccountChange(ev.target.value)}
                      className={selectCls(existingAccountErr)}
                    >
                      <option value="">Select account</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </SelectWrap>
                </Field>
                <Field label="Business Type" required>
                  <SelectWrap>
                    <select
                      value={form.businessType}
                      onChange={(ev) => set("businessType", ev.target.value)}
                      className={selectCls(e("businessType"))}
                    >
                      <option value="">Select type</option>
                      {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </SelectWrap>
                </Field>
                <Field label="Closing Date" required>
                  <div
                    className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors ${e("closingDate") ? "border-red-300 bg-red-50/40" : "border-slate-200"}`}
                    onClick={() => closingRef.current?.showPicker()}
                  >
                    <CalendarDays size={14} className="text-slate-400 flex-shrink-0" />
                    <span className={form.closingDate ? "text-slate-800" : "text-slate-400"}>
                      {form.closingDate ? formatDate(form.closingDate) : "Select date"}
                    </span>
                    <input
                      ref={closingRef}
                      type="date"
                      value={form.closingDate}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(ev) => set("closingDate", ev.target.value)}
                      className="absolute opacity-0 w-0 h-0 pointer-events-none"
                    />
                  </div>
                </Field>
                <Field label="Pipeline" required>
                  <SelectWrap>
                    <select
                      value={form.pipeline}
                      onChange={(ev) => set("pipeline", ev.target.value)}
                      className={selectCls(e("pipeline"))}
                    >
                      <option value="">Select pipeline</option>
                      {PIPELINES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </SelectWrap>
                </Field>
                <Field label="Expected Revenue">
                  <input
                    type="text"
                    value={form.expectedRevenue}
                    onChange={(ev) => set("expectedRevenue", ev.target.value)}
                    placeholder="Enter expected revenue"
                    className={inputCls()}
                  />
                </Field>
                <div aria-hidden className="hidden sm:block" />
              </>
            )}

            {!existingAccount && existingContact && (
              <>
                <Field label="Contact Name" required>
                  <SelectWrap>
                    <select
                      value={selectedContactId}
                      onChange={(ev) => handleContactChange(ev.target.value)}
                      className={selectCls(existingContactSelErr)}
                    >
                      <option value="">Select contact</option>
                      {contactOptions.map((c) => (
                        <option key={c.id} value={c.id}>{contactDisplayLabel(c)}</option>
                      ))}
                    </select>
                  </SelectWrap>
                </Field>
                <Field label="Business Type" required>
                  <SelectWrap>
                    <select
                      value={form.businessType}
                      onChange={(ev) => set("businessType", ev.target.value)}
                      className={selectCls(e("businessType"))}
                    >
                      <option value="">Select type</option>
                      {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </SelectWrap>
                </Field>
                <Field label="Closing Date" required>
                  <div
                    className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors ${e("closingDate") ? "border-red-300 bg-red-50/40" : "border-slate-200"}`}
                    onClick={() => closingRef.current?.showPicker()}
                  >
                    <CalendarDays size={14} className="text-slate-400 flex-shrink-0" />
                    <span className={form.closingDate ? "text-slate-800" : "text-slate-400"}>
                      {form.closingDate ? formatDate(form.closingDate) : "Select date"}
                    </span>
                    <input
                      ref={closingRef}
                      type="date"
                      value={form.closingDate}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(ev) => set("closingDate", ev.target.value)}
                      className="absolute opacity-0 w-0 h-0 pointer-events-none"
                    />
                  </div>
                </Field>
                <Field label="Pipeline" required>
                  <SelectWrap>
                    <select
                      value={form.pipeline}
                      onChange={(ev) => set("pipeline", ev.target.value)}
                      className={selectCls(e("pipeline"))}
                    >
                      <option value="">Select pipeline</option>
                      {PIPELINES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </SelectWrap>
                </Field>
              </>
            )}

            {!existingAccount && !existingContact && (
              <>
                <Field label="Business Type" required>
                  <SelectWrap>
                    <select
                      value={form.businessType}
                      onChange={(ev) => set("businessType", ev.target.value)}
                      className={selectCls(e("businessType"))}
                    >
                      <option value="">Select type</option>
                      {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </SelectWrap>
                </Field>
                <Field label="Closing Date" required>
                  <div
                    className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors ${e("closingDate") ? "border-red-300 bg-red-50/40" : "border-slate-200"}`}
                    onClick={() => closingRef.current?.showPicker()}
                  >
                    <CalendarDays size={14} className="text-slate-400 flex-shrink-0" />
                    <span className={form.closingDate ? "text-slate-800" : "text-slate-400"}>
                      {form.closingDate ? formatDate(form.closingDate) : "Select date"}
                    </span>
                    <input
                      ref={closingRef}
                      type="date"
                      value={form.closingDate}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(ev) => set("closingDate", ev.target.value)}
                      className="absolute opacity-0 w-0 h-0 pointer-events-none"
                    />
                  </div>
                </Field>
                <Field label="Pipeline" required>
                  <SelectWrap>
                    <select
                      value={form.pipeline}
                      onChange={(ev) => set("pipeline", ev.target.value)}
                      className={selectCls(e("pipeline"))}
                    >
                      <option value="">Select pipeline</option>
                      {PIPELINES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </SelectWrap>
                </Field>
                <div aria-hidden className="hidden sm:block" />
              </>
            )}
          </div>

          <div className="border-t border-slate-100 pt-4 mb-4">
            <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-3">Description Information</p>
            <Field label="Description">
              <textarea
                rows={4}
                value={form.description}
                onChange={(ev) => set("description", ev.target.value)}
                placeholder="Enter description....."
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#002f93] placeholder:text-slate-400 leading-relaxed"
              />
            </Field>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="text-[15px] font-bold text-slate-900 text-center mb-3">Your Next Action</p>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="flex flex-col items-center gap-1">
                <p className="text-xs text-slate-500">Follow up on:</p>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-900">{formatDate(form.followUpDate)}</span>
                  <button
                    type="button"
                    onClick={() => dateRef.current?.showPicker()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <CalendarDays size={12} />
                    Change date
                  </button>
                  <input
                    ref={dateRef}
                    type="date"
                    value={form.followUpDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(ev) => set("followUpDate", ev.target.value)}
                    className="absolute opacity-0 w-0 h-0 pointer-events-none"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center gap-1">
                <p className="text-xs text-slate-500">Lead Priority</p>
                <SelectWrap>
                  <select
                    value={form.leadPriority}
                    onChange={(ev) => set("leadPriority", ev.target.value as Priority)}
                    className="pl-3 pr-8 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93] bg-white appearance-none"
                  >
                    {LEAD_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </SelectWrap>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full bg-slate-900 hover:bg-black text-white text-sm font-semibold py-3 rounded-xl transition-colors duration-150 mt-6"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
