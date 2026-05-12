"use client";

import { useState, useEffect, useMemo } from "react";
import { useTenantRouter } from "@/components/providers/TenantProvider";
import { ArrowLeft, Calendar, AlertCircle, Info } from "lucide-react";
import { Opportunity, OpportunityStage, Priority, AllocationCustomerType } from "@/lib/types";
import { persistCrmCustomerRecords } from "@/lib/opportunity-customer-persist";
import type { AccountRecord } from "@/lib/mock-data/accounts";
import { loadAccounts } from "@/lib/mock-data/accounts";
import { formatPhoneMobile, loadContacts } from "@/lib/mock-data/contacts";
import {
  contactDisplayLabel,
  contactIdCompatibleWithAccount,
  contactsForAccountName,
  validateExistingLeadSelection,
} from "@/lib/lead-customer-linking";

function uid() { return Math.random().toString(36).slice(2, 9); }
function oppId() { return `P-${Math.floor(10000 + Math.random() * 90000)}`; }

const OPPORTUNITY_OWNERS = ["Katie Allen", "Kevin Calamari", "Unassigned"];
const BUSINESS_TYPES     = ["New Business", "Existing Business", "B2B", "B2C", "B2G", "Retail", "Wholesale", "Other"];
const PIPELINES          = ["Medzah Sales Pipeline", "Medzah Bid Opportunity Pipeline"];
const STAGES: OpportunityStage[] = ["Qualified", "Proposal/Price Quote", "Negotiation/Review", "Closed Won", "Closed Lost"];
const LEAD_SOURCES       = ["Cold Call", "Internal Referral", "External Referral", "Chamber of Commerce", "Premier", "Premier Activation", "Facebook", "LinkedIn", "Trade Show", "Yamas Rental Commerce", "Other"];
const PRIORITIES: Priority[] = ["Hot", "Warm", "Cold"];
const INDUSTRIES         = ["None", "Healthcare", "Retail", "Hospitality", "Education", "Real Estate", "Technology", "Finance", "Construction", "Other"];
const GENDER_OPTIONS     = ["Male", "Female", "Non-binary", "Prefer not to say", "Other"];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-4 mt-1">
      {children}
    </p>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[13px] text-slate-600 font-medium">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
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
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-[13px] font-semibold text-slate-800">{label}</p>
        <p className="text-[12px] text-slate-500 mt-0.5">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[#002f93] focus:ring-offset-2 ${
          checked ? "bg-[#002f93]" : "bg-slate-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

const inputCls  = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93] placeholder:text-slate-300 text-slate-800 bg-white transition-colors";
const selectCls = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93] bg-white text-slate-800 transition-colors appearance-none";

interface FormState {
  opportunityId:    string;
  opportunityOwner: string;
  businessType:     string;
  closingDate:      string;
  pipeline:         string;
  stage:            OpportunityStage;
  leadSource:       string;
  leadPriority:     Priority;
  expectedRevenue:  string;
  description:      string;
}

const emptyAccountDetails = () => ({
  companyName: "",
  website: "",
  industry: "None" as string,
});

const emptyContactDetails = () => ({
  firstName: "",
  lastName: "",
  email: "",
  mobile: "",
  gender: "",
});

function emptyAddress() {
  return { street: "", city: "", state: "", zip: "", country: "" };
}

function emptyForm(): FormState {
  return {
    opportunityId:    oppId(),
    opportunityOwner: "Katie Allen",
    businessType:     "",
    closingDate:      "",
    pipeline:         "",
    stage:            "Qualified",
    leadSource:       "",
    leadPriority:     "Hot",
    expectedRevenue:  "",
    description:      "",
  };
}

export default function CreateOpportunityPage() {
  const router = useTenantRouter();
  const [form, setForm] = useState<FormState>(emptyForm());
  const [existingAccount, setExistingAccount] = useState(false);
  const [existingContact, setExistingContact] = useState(false);
  const [accountDetails, setAccountDetails] = useState(emptyAccountDetails);
  const [contactDetails, setContactDetails] = useState(emptyContactDetails);
  const [addressDetails, setAddressDetails] = useState(emptyAddress);
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedContactId, setSelectedContactId] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [existingError, setExistingError] = useState<string | null>(null);

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

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function onExistingAccountToggle(next: boolean) {
    setExistingAccount(next);
    setSelectedAccountId("");
    setExistingError(null);
    if (!next) setAccountDetails(emptyAccountDetails());
  }

  function onExistingContactToggle(next: boolean) {
    setExistingContact(next);
    setSelectedContactId("");
    setExistingError(null);
    if (!next) setContactDetails(emptyContactDetails());
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

  function buildOpportunityFromState(): Opportunity | null {
    const today = new Date();
    const createdDate = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}/${String(today.getFullYear()).slice(2)} ; ${String(today.getHours()).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}`;

    const base = {
      id:               `opp-${uid()}`,
      opportunityRef:   form.opportunityId,
      businessType:     form.businessType,
      closingDate:      form.closingDate,
      pipeline:         form.pipeline,
      expectedRevenue:  form.expectedRevenue,
      amount:           "",
      campaignSource:   "",
      description:      form.description,
      note:             "",
      leadSource:       form.leadSource,
      createdDate,
      leadPriority:     form.leadPriority,
      opportunityStage: form.stage,
      assignedTo:       form.opportunityOwner,
      activities: [{
        id:          `oact-${uid()}`,
        type:        "created" as const,
        title:       "Opportunity Created",
        description: `Source: ${form.leadSource || "Direct"}`,
        timestamp:   "TODAY",
      }],
    };

    if (existingAccount && existingContact) {
      const v = validateExistingLeadSelection(selectedAccountId, selectedContactId, accounts, allContacts);
      if (!v.ok) {
        setExistingError(v.message);
        return null;
      }
      const { contact: vContact, account: vAccount } = v;
      const displayName = `${vContact.firstName} ${vContact.lastName}`.trim();
      const phoneLine = formatPhoneMobile(vContact) || vContact.phone || vContact.mobile || "";
      return {
        ...base,
        accountName: vAccount.name,
        contactName: displayName,
        contactEmail: vContact.email ?? "",
        contactPhone: phoneLine,
        companyName: vAccount.name,
        customerType: "existing" as AllocationCustomerType,
        linkedAccountId: vAccount.id,
        linkedContactId: vContact.id,
      };
    }

    if (existingAccount && !existingContact) {
      const acc = accounts.find((a) => a.id === selectedAccountId);
      if (!acc) {
        setExistingError("Select a valid account.");
        return null;
      }
      const cn = `${contactDetails.firstName} ${contactDetails.lastName}`.trim();
      return {
        ...base,
        accountName: acc.name,
        contactName: cn,
        contactEmail: contactDetails.email,
        contactPhone: contactDetails.mobile,
        companyName: acc.name,
        customerType: "new" as AllocationCustomerType,
        linkedAccountId: acc.id,
        linkedContactId: undefined,
        contactFirstName: contactDetails.firstName,
        contactLastName: contactDetails.lastName,
        contactGender: contactDetails.gender || undefined,
      };
    }

    if (!existingAccount && existingContact) {
      const contact = allContacts.find((c) => c.id === selectedContactId);
      if (!contact) {
        setExistingError("Select a valid contact.");
        return null;
      }
      const displayName = `${contact.firstName} ${contact.lastName}`.trim();
      const phoneLine = formatPhoneMobile(contact) || contact.phone || contact.mobile || "";
      return {
        ...base,
        expectedRevenue: form.expectedRevenue,
        accountName: accountDetails.companyName.trim(),
        contactName: displayName,
        contactEmail: contact.email ?? "",
        contactPhone: phoneLine,
        companyName: accountDetails.companyName.trim(),
        customerType: "new" as AllocationCustomerType,
        linkedAccountId: undefined,
        linkedContactId: contact.id,
        accountWebsite: accountDetails.website || undefined,
        accountIndustry: accountDetails.industry !== "None" ? accountDetails.industry : undefined,
      };
    }

    const cn = `${contactDetails.firstName} ${contactDetails.lastName}`.trim();
    return {
      ...base,
      expectedRevenue: form.expectedRevenue,
      accountName: accountDetails.companyName.trim(),
      contactName: cn,
      contactEmail: contactDetails.email,
      contactPhone: contactDetails.mobile,
      companyName: accountDetails.companyName.trim(),
      customerType: "new" as AllocationCustomerType,
      linkedAccountId: undefined,
      linkedContactId: undefined,
      accountWebsite: accountDetails.website || undefined,
      accountIndustry: accountDetails.industry !== "None" ? accountDetails.industry : undefined,
      contactFirstName: contactDetails.firstName,
      contactLastName: contactDetails.lastName,
      contactGender: contactDetails.gender || undefined,
    };
  }

  function validateAndBuild(): Opportunity | null {
    setAttempted(true);
    setExistingError(null);

    if (!form.businessType || !form.closingDate || !form.pipeline) return null;
    if (!customerPartOk) return null;

    return buildOpportunityFromState();
  }

  function handleSave() {
    const opp = validateAndBuild();
    if (!opp) return;
    const idMerge = persistCrmCustomerRecords({
      customerType: opp.customerType,
      linkedAccountId: opp.linkedAccountId,
      linkedContactId: opp.linkedContactId,
      accountName: opp.accountName,
      accountWebsite: opp.accountWebsite,
      accountIndustry: opp.accountIndustry,
      contactFirstName: opp.contactFirstName,
      contactLastName: opp.contactLastName,
      contactName: opp.contactName,
      contactEmail: opp.contactEmail,
      contactPhone: opp.contactPhone,
      contactGender: opp.contactGender,
      addressStreet: addressDetails.street,
      addressCity: addressDetails.city,
      addressState: addressDetails.state,
      addressZip: addressDetails.zip,
      addressCountry: addressDetails.country,
    });
    const finalOpp = { ...opp, ...idMerge };
    try {
      const existing: Opportunity[] = JSON.parse(sessionStorage.getItem("pendingOpportunities") ?? "[]");
      existing.push(finalOpp);
      sessionStorage.setItem("pendingOpportunities", JSON.stringify(existing));
    } catch {
      // ignore
    }
    router.push("/opportunity");
  }

  function handleSaveAndNew() {
    const opp = validateAndBuild();
    if (!opp) return;
    const idMerge = persistCrmCustomerRecords({
      customerType: opp.customerType,
      linkedAccountId: opp.linkedAccountId,
      linkedContactId: opp.linkedContactId,
      accountName: opp.accountName,
      accountWebsite: opp.accountWebsite,
      accountIndustry: opp.accountIndustry,
      contactFirstName: opp.contactFirstName,
      contactLastName: opp.contactLastName,
      contactName: opp.contactName,
      contactEmail: opp.contactEmail,
      contactPhone: opp.contactPhone,
      contactGender: opp.contactGender,
      addressStreet: addressDetails.street,
      addressCity: addressDetails.city,
      addressState: addressDetails.state,
      addressZip: addressDetails.zip,
      addressCountry: addressDetails.country,
    });
    const finalOpp = { ...opp, ...idMerge };
    try {
      const existing: Opportunity[] = JSON.parse(sessionStorage.getItem("pendingOpportunities") ?? "[]");
      existing.push(finalOpp);
      sessionStorage.setItem("pendingOpportunities", JSON.stringify(existing));
    } catch {
      // ignore
    }
    setForm(emptyForm());
    setExistingAccount(false);
    setExistingContact(false);
    setAccountDetails(emptyAccountDetails());
    setContactDetails(emptyContactDetails());
    setAddressDetails(emptyAddress());
    setSelectedAccountId("");
    setSelectedContactId("");
    setAttempted(false);
    setExistingError(null);
  }

  const baseOk = form.businessType && form.closingDate && form.pipeline;
  const showRequiredHint = attempted && (!baseOk || !customerPartOk);

  const existingAccountErr = attempted && existingAccount && !selectedAccountId;
  const existingContactSelErr = attempted && existingContact && !selectedContactId;
  const companyErr = attempted && !existingAccount && !accountDetails.companyName.trim();
  const contactNameErr =
    attempted && !existingContact &&
    (!contactDetails.firstName.trim() || !contactDetails.lastName.trim());

  return (
    <div className="min-h-full bg-[#f8f9fb]">

      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between px-6 h-[60px]">
          <button
            onClick={() => router.push("/opportunity")}
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-semibold text-[15px] transition-colors"
          >
            <ArrowLeft size={17} />
            Create Opportunity
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-5 py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-black transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => router.push("/opportunity")}
              className="px-5 py-2 text-sm font-semibold border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAndNew}
              className="px-5 py-2 text-sm font-semibold border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Save and New
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-8">

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionLabel>Opportunity Information</SectionLabel>

          {showRequiredHint && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
              <AlertCircle size={13} className="flex-shrink-0" />
              Please fill in all required fields.
            </div>
          )}
          {attempted && existingError && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
              <AlertCircle size={13} className="flex-shrink-0" />
              {existingError}
            </div>
          )}

          <div className="flex flex-col gap-3 mb-6">
            <div className="flex items-start gap-2 bg-sky-50 border border-sky-200 rounded-xl px-4 py-3">
              <AlertCircle size={14} className="text-sky-600 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-sky-900 leading-relaxed">
                If the account and contact already exist in the system, choose them by switching the toggles. If the customer is new, fill the fields accordingly. According to your entries, the account and contact information will be added in the respective fields.
              </p>
            </div>
            <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <Info size={14} className="text-slate-600 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-slate-700 leading-relaxed">
                When you save, any new account, new contact, and general address you enter is added to the Accounts and Contacts lists so the data exists in the system from what you filled in here.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-slate-100">
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
            <div className="mb-6 p-5 rounded-xl border border-slate-200 bg-slate-50/70">
              <p className="text-[11px] font-bold text-slate-500 tracking-widest uppercase mb-4">Account details</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <Field label="Company Name" required>
                  <input
                    value={accountDetails.companyName}
                    onChange={(e) => setAccountDetails((d) => ({ ...d, companyName: e.target.value }))}
                    placeholder="Company name"
                    className={`${inputCls} ${companyErr ? "border-red-300 bg-red-50/40" : ""}`}
                  />
                </Field>
                <Field label="Website">
                  <input
                    value={accountDetails.website}
                    onChange={(e) => setAccountDetails((d) => ({ ...d, website: e.target.value }))}
                    placeholder="https://example.com"
                    className={inputCls}
                  />
                </Field>
                <Field label="Expected revenue">
                  <input
                    value={form.expectedRevenue}
                    onChange={(e) => set("expectedRevenue", e.target.value)}
                    placeholder="e.g. $48,500"
                    className={inputCls}
                  />
                </Field>
                <Field label="Industry">
                  <div className="relative">
                    <select
                      value={accountDetails.industry}
                      onChange={(e) => setAccountDetails((d) => ({ ...d, industry: e.target.value }))}
                      className={selectCls}
                    >
                      {INDUSTRIES.map((i) => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
                  </div>
                </Field>
              </div>
            </div>
          )}

          {!existingContact && (
            <div className="mb-6 p-5 rounded-xl border border-slate-200 bg-slate-50/70">
              <p className="text-[11px] font-bold text-slate-500 tracking-widest uppercase mb-4">Contact details</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <Field label="First Name" required>
                  <input
                    value={contactDetails.firstName}
                    onChange={(e) => setContactDetails((d) => ({ ...d, firstName: e.target.value }))}
                    placeholder="First name"
                    className={`${inputCls} ${contactNameErr ? "border-red-300 bg-red-50/40" : ""}`}
                  />
                </Field>
                <Field label="Last Name" required>
                  <input
                    value={contactDetails.lastName}
                    onChange={(e) => setContactDetails((d) => ({ ...d, lastName: e.target.value }))}
                    placeholder="Last name"
                    className={`${inputCls} ${contactNameErr ? "border-red-300 bg-red-50/40" : ""}`}
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    value={contactDetails.email}
                    onChange={(e) => setContactDetails((d) => ({ ...d, email: e.target.value }))}
                    placeholder="email@company.com"
                    className={inputCls}
                  />
                </Field>
                <Field label="Mobile No.">
                  <input
                    value={contactDetails.mobile}
                    onChange={(e) => setContactDetails((d) => ({ ...d, mobile: e.target.value }))}
                    placeholder="+1 (555) 000-0000"
                    className={inputCls}
                  />
                </Field>
                <Field label="Gender">
                  <div className="relative">
                    <select
                      value={contactDetails.gender}
                      onChange={(e) => setContactDetails((d) => ({ ...d, gender: e.target.value }))}
                      className={selectCls}
                    >
                      <option value="">Select</option>
                      {GENDER_OPTIONS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
                  </div>
                </Field>
              </div>
            </div>
          )}

          {(!existingAccount || !existingContact) && (
            <div className="mb-6 p-5 rounded-xl border border-slate-200 bg-slate-50/70">
              <p className="text-[11px] font-bold text-slate-500 tracking-widest uppercase mb-4">General address</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <Field label="Street">
                  <input
                    value={addressDetails.street}
                    onChange={(e) => setAddressDetails((d) => ({ ...d, street: e.target.value }))}
                    placeholder="Street address"
                    className={inputCls}
                  />
                </Field>
                <Field label="City">
                  <input
                    value={addressDetails.city}
                    onChange={(e) => setAddressDetails((d) => ({ ...d, city: e.target.value }))}
                    placeholder="City"
                    className={inputCls}
                  />
                </Field>
                <Field label="State / Province">
                  <input
                    value={addressDetails.state}
                    onChange={(e) => setAddressDetails((d) => ({ ...d, state: e.target.value }))}
                    placeholder="State or province"
                    className={inputCls}
                  />
                </Field>
                <Field label="ZIP / Postal code">
                  <input
                    value={addressDetails.zip}
                    onChange={(e) => setAddressDetails((d) => ({ ...d, zip: e.target.value }))}
                    placeholder="ZIP or postal code"
                    className={inputCls}
                  />
                </Field>
                <Field label="Country">
                  <input
                    value={addressDetails.country}
                    onChange={(e) => setAddressDetails((d) => ({ ...d, country: e.target.value }))}
                    placeholder="Country"
                    className={inputCls}
                  />
                </Field>
              </div>
            </div>
          )}

          {/* CRM pickers + opportunity grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            {existingAccount && existingContact && (
              <>
                <Field label="Account Name" required>
                  <div className="relative">
                    <select
                      value={selectedAccountId}
                      onChange={(e) => handleAccountChange(e.target.value)}
                      className={`${selectCls} ${existingAccountErr ? "border-red-300 bg-red-50/40" : ""}`}
                    >
                      <option value="">Select account</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
                  </div>
                </Field>
                <Field label="Business Type" required>
                  <div className="relative">
                    <select
                      value={form.businessType}
                      onChange={(e) => set("businessType", e.target.value)}
                      className={selectCls}
                    >
                      <option value="">Select type</option>
                      {BUSINESS_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
                  </div>
                </Field>
                <Field label="Contact Name" required>
                  <div className="relative">
                    <select
                      value={selectedContactId}
                      onChange={(e) => handleContactChange(e.target.value)}
                      className={`${selectCls} ${existingContactSelErr ? "border-red-300 bg-red-50/40" : ""}`}
                    >
                      <option value="">
                        {!selectedAccountId ? "Select account first or choose contact" : "Select contact"}
                      </option>
                      {contactOptions.map((c) => (
                        <option key={c.id} value={c.id}>{contactDisplayLabel(c)}</option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
                  </div>
                </Field>
                <Field label="Closing Date" required>
                  <div className="relative">
                    <input
                      type="date"
                      value={form.closingDate}
                      onChange={(e) => set("closingDate", e.target.value)}
                      className={`${inputCls} pr-10`}
                    />
                    <Calendar size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </Field>
                <Field label="Pipeline" required>
                  <div className="relative">
                    <select
                      value={form.pipeline}
                      onChange={(e) => set("pipeline", e.target.value)}
                      className={selectCls}
                    >
                      <option value="">Select pipeline</option>
                      {PIPELINES.map((p) => <option key={p}>{p}</option>)}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
                  </div>
                </Field>
                <Field label="Expected Revenue">
                  <input
                    value={form.expectedRevenue}
                    onChange={(e) => set("expectedRevenue", e.target.value)}
                    placeholder="Enter expected revenue"
                    className={inputCls}
                  />
                </Field>
              </>
            )}

            {existingAccount && !existingContact && (
              <>
                <Field label="Account Name" required>
                  <div className="relative">
                    <select
                      value={selectedAccountId}
                      onChange={(e) => handleAccountChange(e.target.value)}
                      className={`${selectCls} ${existingAccountErr ? "border-red-300 bg-red-50/40" : ""}`}
                    >
                      <option value="">Select account</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
                  </div>
                </Field>
                <Field label="Business Type" required>
                  <div className="relative">
                    <select
                      value={form.businessType}
                      onChange={(e) => set("businessType", e.target.value)}
                      className={selectCls}
                    >
                      <option value="">Select type</option>
                      {BUSINESS_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
                  </div>
                </Field>
                <Field label="Closing Date" required>
                  <div className="relative">
                    <input
                      type="date"
                      value={form.closingDate}
                      onChange={(e) => set("closingDate", e.target.value)}
                      className={`${inputCls} pr-10`}
                    />
                    <Calendar size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </Field>
                <Field label="Pipeline" required>
                  <div className="relative">
                    <select
                      value={form.pipeline}
                      onChange={(e) => set("pipeline", e.target.value)}
                      className={selectCls}
                    >
                      <option value="">Select pipeline</option>
                      {PIPELINES.map((p) => <option key={p}>{p}</option>)}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
                  </div>
                </Field>
                <Field label="Expected Revenue">
                  <input
                    value={form.expectedRevenue}
                    onChange={(e) => set("expectedRevenue", e.target.value)}
                    placeholder="Enter expected revenue"
                    className={inputCls}
                  />
                </Field>
                <div aria-hidden className="hidden md:block" />
              </>
            )}

            {!existingAccount && existingContact && (
              <>
                <Field label="Contact Name" required>
                  <div className="relative">
                    <select
                      value={selectedContactId}
                      onChange={(e) => handleContactChange(e.target.value)}
                      className={`${selectCls} ${existingContactSelErr ? "border-red-300 bg-red-50/40" : ""}`}
                    >
                      <option value="">Select contact</option>
                      {contactOptions.map((c) => (
                        <option key={c.id} value={c.id}>{contactDisplayLabel(c)}</option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
                  </div>
                </Field>
                <Field label="Business Type" required>
                  <div className="relative">
                    <select
                      value={form.businessType}
                      onChange={(e) => set("businessType", e.target.value)}
                      className={selectCls}
                    >
                      <option value="">Select type</option>
                      {BUSINESS_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
                  </div>
                </Field>
                <Field label="Closing Date" required>
                  <div className="relative">
                    <input
                      type="date"
                      value={form.closingDate}
                      onChange={(e) => set("closingDate", e.target.value)}
                      className={`${inputCls} pr-10`}
                    />
                    <Calendar size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </Field>
                <Field label="Pipeline" required>
                  <div className="relative">
                    <select
                      value={form.pipeline}
                      onChange={(e) => set("pipeline", e.target.value)}
                      className={selectCls}
                    >
                      <option value="">Select pipeline</option>
                      {PIPELINES.map((p) => <option key={p}>{p}</option>)}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
                  </div>
                </Field>
              </>
            )}

            {!existingAccount && !existingContact && (
              <>
                <Field label="Opportunity ID">
                  <input
                    value={form.opportunityId}
                    readOnly
                    className={`${inputCls} bg-slate-50 text-slate-500 cursor-default`}
                  />
                </Field>
                <Field label="Opportunity Owner">
                  <div className="relative">
                    <select
                      value={form.opportunityOwner}
                      onChange={(e) => set("opportunityOwner", e.target.value)}
                      className={selectCls}
                    >
                      {OPPORTUNITY_OWNERS.map((o) => <option key={o}>{o}</option>)}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
                  </div>
                </Field>
                <Field label="Business Type" required>
                  <div className="relative">
                    <select
                      value={form.businessType}
                      onChange={(e) => set("businessType", e.target.value)}
                      className={selectCls}
                    >
                      <option value="">Select type</option>
                      {BUSINESS_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
                  </div>
                </Field>
                <Field label="Closing Date" required>
                  <div className="relative">
                    <input
                      type="date"
                      value={form.closingDate}
                      onChange={(e) => set("closingDate", e.target.value)}
                      className={`${inputCls} pr-10`}
                    />
                    <Calendar size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </Field>
                <Field label="Pipeline" required>
                  <div className="relative">
                    <select
                      value={form.pipeline}
                      onChange={(e) => set("pipeline", e.target.value)}
                      className={selectCls}
                    >
                      <option value="">Select pipeline</option>
                      {PIPELINES.map((p) => <option key={p}>{p}</option>)}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
                  </div>
                </Field>
                <div aria-hidden className="hidden md:block" />
              </>
            )}
          </div>

          {/* Owner + ID + remaining fields when CRM modes (not pure new-new) */}
          {(existingAccount || existingContact) && (
            <div className="grid grid-cols-2 gap-x-8 gap-y-5 mt-5 pt-5 border-t border-slate-100">
              <Field label="Opportunity ID">
                <input
                  value={form.opportunityId}
                  readOnly
                  className={`${inputCls} bg-slate-50 text-slate-500 cursor-default`}
                />
              </Field>
              <Field label="Opportunity Owner">
                <div className="relative">
                  <select
                    value={form.opportunityOwner}
                    onChange={(e) => set("opportunityOwner", e.target.value)}
                    className={selectCls}
                  >
                    {OPPORTUNITY_OWNERS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
                </div>
              </Field>
              <Field label="Stage">
                <div className="relative">
                  <select
                    value={form.stage}
                    onChange={(e) => set("stage", e.target.value as OpportunityStage)}
                    className={selectCls}
                  >
                    {STAGES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
                </div>
              </Field>
              <Field label="Lead Source">
                <div className="relative">
                  <select
                    value={form.leadSource}
                    onChange={(e) => set("leadSource", e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Select Lead Source</option>
                    {LEAD_SOURCES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
                </div>
              </Field>
              <Field label="Lead Priority">
                <div className="relative">
                  <select
                    value={form.leadPriority}
                    onChange={(e) => set("leadPriority", e.target.value as Priority)}
                    className={selectCls}
                  >
                    {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
                </div>
              </Field>
            </div>
          )}

          {/* Pure new-new: Stage, Lead source, Lead priority below main grid */}
          {!existingAccount && !existingContact && (
            <div className="grid grid-cols-2 gap-x-8 gap-y-5 mt-2">
              <Field label="Stage">
                <div className="relative">
                  <select
                    value={form.stage}
                    onChange={(e) => set("stage", e.target.value as OpportunityStage)}
                    className={selectCls}
                  >
                    {STAGES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
                </div>
              </Field>
              <Field label="Lead Source">
                <div className="relative">
                  <select
                    value={form.leadSource}
                    onChange={(e) => set("leadSource", e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Select Lead Source</option>
                    {LEAD_SOURCES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
                </div>
              </Field>
              <Field label="Lead Priority">
                <div className="relative">
                  <select
                    value={form.leadPriority}
                    onChange={(e) => set("leadPriority", e.target.value as Priority)}
                    className={selectCls}
                  >
                    {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
                </div>
              </Field>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionLabel>Description</SectionLabel>
          <textarea
            rows={5}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Enter Description"
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#002f93] placeholder:text-slate-400 leading-relaxed"
          />
        </div>

      </div>
    </div>
  );
}
