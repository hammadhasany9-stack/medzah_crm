"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera } from "lucide-react";
import { Lead, Priority, LeadStatus } from "@/lib/types";
import { mockLeads } from "@/lib/mock-data/leads";

// ─── Constants ────────────────────────────────────────────────────────────────

const LEAD_SOURCES   = ["None", "Cold Call", "Internal Referral", "External Referral", "Chamber of Commerce", "Premier", "Premier Activation", "Facebook", "LinkedIn", "Yamas Rental Commerce"];
const LEAD_OWNERS    = ["Katie Allen", "Kevin Calamari", "Unassigned"];
const CUSTOMER_FOR   = ["None", "Medzah", "Nexkara"];
const PRIORITIES: Priority[]  = ["Hot", "Warm", "Cold"];
const STATUSES: LeadStatus[]  = ["New", "Attempted Contact", "Contacted", "Allocation", "Qualified", "Allocation on hold", "Inactive"];
const INDUSTRIES     = ["None", "Healthcare", "Retail", "Hospitality", "Education", "Real Estate", "Technology", "Finance", "Construction", "Other"];

// ─── Field components ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-4 mt-1">
      {children}
    </p>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[13px] text-slate-600 font-medium">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls  = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93] placeholder:text-slate-300 text-slate-800 bg-white transition-colors";
const selectCls = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93] bg-white text-slate-800 transition-colors appearance-none";

// ─── Pre-fill helpers ─────────────────────────────────────────────────────────

function parseFirstName(name: string): string {
  return name.split(" ")[0] ?? "";
}

function parseLastName(name: string): string {
  const parts = name.split(" ");
  return parts.slice(1).join(" ");
}

function parseCity(location?: string): string {
  if (!location) return "";
  return location.split(",")[0]?.trim() ?? "";
}

function parseState(location?: string): string {
  if (!location) return "";
  return location.split(",")[1]?.trim() ?? "";
}

function parseCountry(location?: string): string {
  if (!location) return "";
  return location.split(",")[2]?.trim() ?? "";
}

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormState {
  leadId:          string;
  leadOwner:       string;
  leadSource:      string;
  customerFor:     string;
  leadPriority:    string;
  leadStatus:      string;
  firstName:       string;
  lastName:        string;
  title:           string;
  company:         string;
  phone:           string;
  email:           string;
  mobile:          string;
  website:         string;
  industry:        string;
  premierRep:      string;
  premierRepEmail: string;
  premierRepPhone: string;
  street:          string;
  zipCode:         string;
  city:            string;
  country:         string;
  state:           string;
  attn:            string;
  description:     string;
}

function prefillForm(lead: Lead): FormState {
  return {
    leadId:          lead.leadRef,
    leadOwner:       lead.assignedTo,
    leadSource:      lead.leadSource || "None",
    customerFor:     lead.customerFor || "None",
    leadPriority:    lead.priority,
    leadStatus:      lead.status,
    firstName:       parseFirstName(lead.contactName),
    lastName:        parseLastName(lead.contactName),
    title:           lead.contactTitle ?? "",
    company:         lead.companyName,
    phone:           lead.phone,
    email:           lead.email,
    mobile:          "",
    website:         "",
    industry:        "None",
    premierRep:      "",
    premierRepEmail: "",
    premierRepPhone: "",
    street:          "",
    zipCode:         "",
    city:            parseCity(lead.location),
    country:         parseCountry(lead.location),
    state:           parseState(lead.location),
    attn:            "",
    description:     lead.note ?? "",
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditLeadPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router  = useRouter();

  const lead: Lead | undefined = mockLeads.find((l) => l.id === id);

  const [form, setForm]       = useState<FormState>(() => lead ? prefillForm(lead) : prefillForm({} as Lead));
  const [attempted, setAttempted] = useState(false);

  function set<K extends keyof FormState>(key: K, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
        <p className="text-lg font-semibold">Lead not found</p>
        <button
          onClick={() => router.push("/leads")}
          className="flex items-center gap-2 text-sm text-[#002f93] hover:underline"
        >
          <ArrowLeft size={14} /> Back to Leads
        </button>
      </div>
    );
  }

  function handleSave() {
    setAttempted(true);
    if (form.firstName.trim() === "" && form.lastName.trim() === "") return;
    // In a real app this would persist; for now navigate back to the detail view.
    router.push(`/leads/${id}`);
  }

  const nameError = attempted && form.firstName.trim() === "" && form.lastName.trim() === "";

  return (
    <div className="min-h-full bg-[#f8f9fb]">

      {/* ── Page header ── */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between px-6 h-[60px]">
          <button
            onClick={() => router.push(`/leads/${id}`)}
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-semibold text-[15px] transition-colors"
          >
            <ArrowLeft size={17} />
            Edit Lead
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-5 py-2 text-sm font-semibold bg-[#002f93] text-white rounded-lg hover:bg-[#001f6b] transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={() => router.push(`/leads/${id}`)}
              className="px-5 py-2 text-sm font-semibold border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* ── Form body ── */}
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-8">

        {/* ADD IMAGE */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionLabel>Image</SectionLabel>
          <button
            type="button"
            className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-300 hover:border-[#002f93] hover:text-[#002f93] transition-colors"
          >
            <Camera size={24} />
          </button>
        </div>

        {/* LEAD INFORMATION */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionLabel>Lead Information</SectionLabel>
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">

            <Field label="Lead ID">
              <div className="relative">
                <input
                  value={form.leadId}
                  readOnly
                  className={`${inputCls} bg-slate-50 text-slate-400 cursor-default pr-8`}
                />
              </div>
            </Field>

            <Field label="Lead Owner">
              <div className="relative">
                <select value={form.leadOwner} onChange={(e) => set("leadOwner", e.target.value)} className={selectCls}>
                  {LEAD_OWNERS.map((o) => <option key={o}>{o}</option>)}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
              </div>
            </Field>

            <Field label="Lead Source">
              <div className="relative">
                <select value={form.leadSource} onChange={(e) => set("leadSource", e.target.value)} className={selectCls}>
                  {LEAD_SOURCES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
              </div>
            </Field>

            <Field label="Customer For">
              <div className="relative">
                <select value={form.customerFor} onChange={(e) => set("customerFor", e.target.value)} className={selectCls}>
                  {CUSTOMER_FOR.map((c) => <option key={c}>{c}</option>)}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
              </div>
            </Field>

            <Field label="Lead Priority">
              <div className="relative">
                <select value={form.leadPriority} onChange={(e) => set("leadPriority", e.target.value)} className={selectCls}>
                  <option value="">None</option>
                  {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
              </div>
            </Field>

            <Field label="Lead Status">
              <div className="relative">
                <select value={form.leadStatus} onChange={(e) => set("leadStatus", e.target.value)} className={selectCls}>
                  <option value="">None</option>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
              </div>
            </Field>

          </div>
        </div>

        {/* CUSTOMER DETAILS */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionLabel>Customer Details</SectionLabel>
          {nameError && (
            <p className="text-xs text-red-500 mb-4">First name or last name is required.</p>
          )}
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            <Field label="First Name" required>
              <input
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                placeholder="First name"
                className={`${inputCls} ${nameError ? "border-red-300" : ""}`}
              />
            </Field>
            <Field label="Title">
              <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Job title" className={inputCls} />
            </Field>
            <Field label="Last Name" required>
              <input
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                placeholder="Last name"
                className={`${inputCls} ${nameError ? "border-red-300" : ""}`}
              />
            </Field>
            <Field label="Company">
              <input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Company name" className={inputCls} />
            </Field>
            <Field label="Phone">
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 (555) 000-0000" className={inputCls} />
            </Field>
            <Field label="Email">
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="email@company.com" className={inputCls} />
            </Field>
            <Field label="Mobile">
              <input value={form.mobile} onChange={(e) => set("mobile", e.target.value)} placeholder="+1 (555) 000-0000" className={inputCls} />
            </Field>
            <Field label="Website">
              <input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://example.com" className={inputCls} />
            </Field>
            <Field label="Industry">
              <div className="relative">
                <select value={form.industry} onChange={(e) => set("industry", e.target.value)} className={selectCls}>
                  {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
              </div>
            </Field>
            <Field label="Premier Rep">
              <input value={form.premierRep} onChange={(e) => set("premierRep", e.target.value)} placeholder="Rep name" className={inputCls} />
            </Field>
            <Field label="Premier Rep Email">
              <input type="email" value={form.premierRepEmail} onChange={(e) => set("premierRepEmail", e.target.value)} placeholder="rep@example.com" className={inputCls} />
            </Field>
            <Field label="Premier Rep Phone">
              <input value={form.premierRepPhone} onChange={(e) => set("premierRepPhone", e.target.value)} placeholder="+1 (555) 000-0000" className={inputCls} />
            </Field>
          </div>
        </div>

        {/* CUSTOMER BILLING DETAILS */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionLabel>Customer Billing Details</SectionLabel>
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            <Field label="Street">
              <input value={form.street} onChange={(e) => set("street", e.target.value)} placeholder="Street address" className={inputCls} />
            </Field>
            <Field label="Zip Code">
              <input value={form.zipCode} onChange={(e) => set("zipCode", e.target.value)} placeholder="Zip / Postal code" className={inputCls} />
            </Field>
            <Field label="City">
              <input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="City" className={inputCls} />
            </Field>
            <Field label="Country">
              <input value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="Country" className={inputCls} />
            </Field>
            <Field label="State">
              <input value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="State / Province" className={inputCls} />
            </Field>
            <Field label="Attn">
              <input value={form.attn} onChange={(e) => set("attn", e.target.value)} placeholder="Attention to" className={inputCls} />
            </Field>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionLabel>Description</SectionLabel>
          <textarea
            rows={5}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Enter description"
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#002f93] placeholder:text-slate-400 leading-relaxed"
          />
        </div>

      </div>
    </div>
  );
}
