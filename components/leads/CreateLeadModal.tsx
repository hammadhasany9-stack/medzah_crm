"use client";

import { useState } from "react";
import { X, UserCircle2 } from "lucide-react";
import { Lead, Priority, LeadStatus } from "@/lib/types";

interface CreateLeadModalProps {
  sourceLabel: string;
  sourceBadgeColor: string;
  onSave: (lead: Lead) => void;
  onCancel: () => void;
}

function uid()   { return Math.random().toString(36).slice(2, 9); }
function leadId() { return `L-${Math.floor(10000 + Math.random() * 90000)}`; }

const PRIORITIES: Priority[]   = ["Hot", "Warm", "Cold"];
const STATUSES: LeadStatus[]   = ["New", "Attempted Contact", "Contacted", "Allocation", "Qualified", "Allocation on hold", "Inactive"];
const LEAD_OWNERS   = ["Katie Allen", "Kevin Calamari", "Unassigned"];
const CUSTOMER_FOR  = ["None", "Medzah", "Nexkara"];
const INDUSTRIES    = ["None", "Healthcare", "Retail", "Hospitality", "Education", "Real Estate", "Technology", "Finance", "Construction", "Other"];

const priorityEmoji: Record<Priority, string> = { Hot: "🔥", Warm: "☀️", Cold: "❄️" };
const priorityActive: Record<Priority, string> = {
  Hot:  "bg-orange-500 text-white border-orange-500",
  Warm: "bg-amber-400 text-white border-amber-400",
  Cold: "bg-sky-500 text-white border-sky-500",
};

const inputCls = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93] placeholder:text-slate-400 text-slate-800 bg-white transition-colors";
const selectCls = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93] bg-white text-slate-800 transition-colors appearance-none";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-3">{children}</p>;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] text-slate-600 font-medium">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function SelectWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
    </div>
  );
}

export function CreateLeadModal({ sourceLabel, sourceBadgeColor, onSave, onCancel }: CreateLeadModalProps) {
  const [attempted, setAttempted] = useState(false);

  const [leadOwner,      setLeadOwner]      = useState("Katie Allen");
  const [customerFor,    setCustomerFor]    = useState("None");
  const [leadPriority,   setLeadPriority]   = useState<Priority>("Warm");
  const [leadStatus,     setLeadStatus]     = useState<LeadStatus>("New");
  const [firstName,      setFirstName]      = useState("");
  const [lastName,       setLastName]       = useState("");
  const [title,          setTitle]          = useState("");
  const [company,        setCompany]        = useState("");
  const [phone,          setPhone]          = useState("");
  const [email,          setEmail]          = useState("");
  const [mobile,         setMobile]         = useState("");
  const [website,        setWebsite]        = useState("");
  const [industry,       setIndustry]       = useState("None");
  const [premierRep,     setPremierRep]     = useState("");
  const [premierRepEmail,setPremierRepEmail]= useState("");
  const [premierRepPhone,setPremierRepPhone]= useState("");
  const [street,         setStreet]         = useState("");
  const [zipCode,        setZipCode]        = useState("");
  const [city,           setCity]           = useState("");
  const [country,        setCountry]        = useState("");
  const [state,          setState]          = useState("");
  const [attn,           setAttn]           = useState("");
  const [description,    setDescription]    = useState("");

  const nameError = attempted && firstName.trim() === "" && lastName.trim() === "";

  function handleSave() {
    setAttempted(true);
    if (firstName.trim() === "" && lastName.trim() === "") return;

    const lead: Lead = {
      id:               `lead-${uid()}`,
      leadRef:          leadId(),
      title:            `${company || firstName} – New Lead`,
      status:           leadStatus,
      urgency:          "Medium",
      priority:         leadPriority,
      contactName:      `${firstName} ${lastName}`.trim(),
      companyName:      company,
      assignedTo:       leadOwner,
      email,
      phone,
      leadSource:       sourceLabel,
      customerFor:      customerFor === "None" ? undefined : customerFor,
      contactTitle:     title,
      location:         [city, state, country].filter(Boolean).join(", "),
      validTill:        "",
      expectedRevenue:  "",
      grandTotal:       "",
      subject:          "",
      opportunityOwner: leadOwner,
      accountName:      company,
      pipeline:         "Sales Pipeline",
      businessType:     "B2B",
      skusQuantity:     "",
      shippingMethod:   "",
      createdDate:      new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      note:             description,
      activities: [{
        id:          `act-${uid()}`,
        type:        "created",
        title:       "Lead Created",
        description: `Source: ${sourceLabel}`,
        timestamp:   "TODAY",
      }],
    };
    onSave(lead);
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-2xl w-[640px] mx-4 shadow-[0_24px_64px_rgba(0,0,0,0.22)] overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between flex-shrink-0"
          style={{ backgroundColor: sourceBadgeColor + "12", borderBottom: `2px solid ${sourceBadgeColor}22` }}
        >
          <div className="flex items-center gap-2.5">
            <UserCircle2 size={20} style={{ color: sourceBadgeColor }} />
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">Create New Lead</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sourceBadgeColor }} />
                <span className="text-[12px] font-semibold" style={{ color: sourceBadgeColor }}>{sourceLabel}</span>
              </div>
            </div>
          </div>
          <button type="button" onClick={onCancel} className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-white/60 hover:text-slate-700 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-6">

          {/* LEAD INFORMATION */}
          <div>
            <SectionLabel>Lead Information</SectionLabel>
            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
              <Field label="Lead Owner">
                <SelectWrap>
                  <select value={leadOwner} onChange={(e) => setLeadOwner(e.target.value)} className={selectCls}>
                    {LEAD_OWNERS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </SelectWrap>
              </Field>
              <Field label="Customer For">
                <SelectWrap>
                  <select value={customerFor} onChange={(e) => setCustomerFor(e.target.value)} className={selectCls}>
                    {CUSTOMER_FOR.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </SelectWrap>
              </Field>
              <Field label="Lead Priority">
                <div className="flex gap-2">
                  {PRIORITIES.map((p) => (
                    <button key={p} type="button" onClick={() => setLeadPriority(p)}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[12px] font-semibold rounded-lg border-2 transition-all ${
                        leadPriority === p ? priorityActive[p] : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      }`}>
                      {priorityEmoji[p]} {p}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Lead Status">
                <SelectWrap>
                  <select value={leadStatus} onChange={(e) => setLeadStatus(e.target.value as LeadStatus)} className={selectCls}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </SelectWrap>
              </Field>
            </div>
          </div>

          {/* CUSTOMER DETAILS */}
          <div className="border-t border-slate-100 pt-5">
            <SectionLabel>Customer Details</SectionLabel>
            {nameError && <p className="text-xs text-red-500 mb-3">First name or last name is required.</p>}
            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
              <Field label="First Name" required>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className={`${inputCls} ${nameError ? "border-red-300" : ""}`} autoFocus />
              </Field>
              <Field label="Title">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Job title" className={inputCls} />
              </Field>
              <Field label="Last Name" required>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className={`${inputCls} ${nameError ? "border-red-300" : ""}`} />
              </Field>
              <Field label="Company">
                <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name" className={inputCls} />
              </Field>
              <Field label="Phone">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className={inputCls} />
              </Field>
              <Field label="Email">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@company.com" className={inputCls} />
              </Field>
              <Field label="Mobile">
                <input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+1 (555) 000-0000" className={inputCls} />
              </Field>
              <Field label="Website">
                <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" className={inputCls} />
              </Field>
              <Field label="Industry">
                <SelectWrap>
                  <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={selectCls}>
                    {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
                  </select>
                </SelectWrap>
              </Field>
              <Field label="Premier Rep">
                <input value={premierRep} onChange={(e) => setPremierRep(e.target.value)} placeholder="Rep name" className={inputCls} />
              </Field>
              <Field label="Premier Rep Email">
                <input type="email" value={premierRepEmail} onChange={(e) => setPremierRepEmail(e.target.value)} placeholder="rep@example.com" className={inputCls} />
              </Field>
              <Field label="Premier Rep Phone">
                <input value={premierRepPhone} onChange={(e) => setPremierRepPhone(e.target.value)} placeholder="+1 (555) 000-0000" className={inputCls} />
              </Field>
            </div>
          </div>

          {/* CUSTOMER BILLING DETAILS */}
          <div className="border-t border-slate-100 pt-5">
            <SectionLabel>Customer Billing Details</SectionLabel>
            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
              <Field label="Street">
                <input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Street address" className={inputCls} />
              </Field>
              <Field label="Zip Code">
                <input value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="Zip / Postal code" className={inputCls} />
              </Field>
              <Field label="City">
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className={inputCls} />
              </Field>
              <Field label="Country">
                <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" className={inputCls} />
              </Field>
              <Field label="State">
                <input value={state} onChange={(e) => setState(e.target.value)} placeholder="State / Province" className={inputCls} />
              </Field>
              <Field label="Attn">
                <input value={attn} onChange={(e) => setAttn(e.target.value)} placeholder="Attention to" className={inputCls} />
              </Field>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="border-t border-slate-100 pt-5">
            <SectionLabel>Description</SectionLabel>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description..."
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#002f93] placeholder:text-slate-400 leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1 border-t border-slate-100">
            <button type="button" onClick={onCancel} className="flex-1 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={handleSave} className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white transition-colors" style={{ backgroundColor: sourceBadgeColor }}>
              Create Lead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
