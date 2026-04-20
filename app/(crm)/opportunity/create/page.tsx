"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import { Opportunity, OpportunityStage, Priority } from "@/lib/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2, 9); }
function oppId() { return `P-${Math.floor(10000 + Math.random() * 90000)}`; }

const OPPORTUNITY_OWNERS = ["Katie Allen", "Kevin Calamari", "Unassigned"];
const ACCOUNT_NAMES      = ["Lumina Architecture", "Meridian Healthcare Group", "High Pointe Surgery Center", "Vantage Rehabilitation Services", "Clearview Medical Diagnostics", "Other"];
const BUSINESS_TYPES     = ["New Business", "Existing Business", "B2B", "B2C", "B2G", "Retail", "Wholesale", "Other"];
const CONTACT_NAMES      = ["Alara Kalila", "Dr. Priya Sharma", "Josh Stoke", "Marcus Webb", "Dr. Aisha Nkemdirim", "Other"];
const PIPELINES          = ["Medzah Sales Pipeline", "Medzah Bid Opportunity Pipeline"];
const STAGES: OpportunityStage[] = ["Qualified", "Proposal/Price Quote", "Negotiation/Review", "Closed Won", "Closed Lost"];
const LEAD_SOURCES       = ["Cold Call", "Internal Referral", "External Referral", "Chamber of Commerce", "Premier", "Premier Activation", "Facebook", "LinkedIn", "Trade Show", "Yamas Rental Commerce", "Other"];
const CAMPAIGN_SOURCES   = ["Cold Call", "Cold Outreach", "Referral", "Website", "LinkedIn", "Trade Show", "Email Campaign", "Social Media", "Other"];
const PRIORITIES: Priority[] = ["Hot", "Warm", "Cold"];

// ─── Field components ─────────────────────────────────────────────────────────

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

const inputCls  = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93] placeholder:text-slate-300 text-slate-800 bg-white transition-colors";
const selectCls = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93] bg-white text-slate-800 transition-colors appearance-none";

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormState {
  opportunityId:    string;
  opportunityOwner: string;
  opportunityName:  string;
  accountName:      string;
  businessType:     string;
  closingDate:      string;
  contactName:      string;
  pipeline:         string;
  stage:            OpportunityStage;
  leadSource:       string;
  leadPriority:     Priority;
  expectedRevenue:  string;
  amount:           string;
  campaignSource:   string;
  description:      string;
}

function emptyForm(): FormState {
  return {
    opportunityId:    oppId(),
    opportunityOwner: "Katie Allen",
    opportunityName:  "",
    accountName:      "",
    businessType:     "",
    closingDate:      "",
    contactName:      "",
    pipeline:         "",
    stage:            "Qualified",
    leadSource:       "",
    leadPriority:     "Hot",
    expectedRevenue:  "",
    amount:           "",
    campaignSource:   "",
    description:      "",
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreateOpportunityPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm());

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function buildOpportunity(): Opportunity {
    const today = new Date();
    const createdDate = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}/${String(today.getFullYear()).slice(2)} ; ${String(today.getHours()).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}`;

    return {
      id:               `opp-${uid()}`,
      opportunityRef:   form.opportunityId,
      opportunityName:  form.opportunityName || "Untitled Opportunity",
      accountName:      form.accountName,
      businessType:     form.businessType,
      closingDate:      form.closingDate,
      contactName:      form.contactName,
      contactEmail:     "",
      contactPhone:     "",
      pipeline:         form.pipeline,
      expectedRevenue:  form.expectedRevenue,
      amount:           form.amount,
      campaignSource:   form.campaignSource,
      description:      form.description,
      note:             "",
      leadSource:       form.leadSource,
      createdDate,
      leadPriority:     form.leadPriority,
      opportunityStage: form.stage,
      assignedTo:       form.opportunityOwner,
      companyName:      form.accountName,
      activities: [{
        id:          `oact-${uid()}`,
        type:        "created",
        title:       "Opportunity Created",
        description: `Source: ${form.leadSource || "Direct"}`,
        timestamp:   "TODAY",
      }],
    };
  }

  function handleSave() {
    const opp = buildOpportunity();
    try {
      const existing: Opportunity[] = JSON.parse(sessionStorage.getItem("pendingOpportunities") ?? "[]");
      existing.push(opp);
      sessionStorage.setItem("pendingOpportunities", JSON.stringify(existing));
    } catch {
      // ignore
    }
    router.push("/opportunity");
  }

  function handleSaveAndNew() {
    const opp = buildOpportunity();
    try {
      const existing: Opportunity[] = JSON.parse(sessionStorage.getItem("pendingOpportunities") ?? "[]");
      existing.push(opp);
      sessionStorage.setItem("pendingOpportunities", JSON.stringify(existing));
    } catch {
      // ignore
    }
    setForm(emptyForm());
  }

  return (
    <div className="min-h-full bg-[#f8f9fb]">

      {/* ── Page header ── */}
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

      {/* ── Form body ── */}
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-8">

        {/* OPPORTUNITY INFORMATION */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <SectionLabel>Opportunity Information</SectionLabel>
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">

            {/* Opportunity ID */}
            <Field label="Opportunity ID">
              <input
                value={form.opportunityId}
                readOnly
                className={`${inputCls} bg-slate-50 text-slate-500 cursor-default`}
              />
            </Field>

            {/* Opportunity Owner */}
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

            {/* Opportunity Name */}
            <Field label="Opportunity Name" required>
              <input
                value={form.opportunityName}
                onChange={(e) => set("opportunityName", e.target.value)}
                placeholder="Enter opportunity name"
                className={inputCls}
              />
            </Field>

            {/* Account Name */}
            <Field label="Account Name" required>
              <div className="relative">
                <select
                  value={form.accountName}
                  onChange={(e) => set("accountName", e.target.value)}
                  className={selectCls}
                >
                  <option value="">Select account name</option>
                  {ACCOUNT_NAMES.map((a) => <option key={a}>{a}</option>)}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
              </div>
            </Field>

            {/* Business Type */}
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

            {/* Closing Date */}
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

            {/* Contact Name */}
            <Field label="Contact Name" required>
              <div className="relative">
                <select
                  value={form.contactName}
                  onChange={(e) => set("contactName", e.target.value)}
                  className={selectCls}
                >
                  <option value="">Select contact name</option>
                  {CONTACT_NAMES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
              </div>
            </Field>

            {/* Pipeline */}
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

            {/* Stage */}
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

            {/* Lead Source */}
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

            {/* Expected Revenue */}
            <Field label="Expected Revenue">
              <input
                value={form.expectedRevenue}
                onChange={(e) => set("expectedRevenue", e.target.value)}
                placeholder="Enter expected revenue"
                className={inputCls}
              />
            </Field>

            {/* Amount */}
            <Field label="Amount">
              <input
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                placeholder="Enter amount"
                className={inputCls}
              />
            </Field>

            {/* Campaign Source */}
            <Field label="Campaign Source">
              <div className="relative">
                <select
                  value={form.campaignSource}
                  onChange={(e) => set("campaignSource", e.target.value)}
                  className={selectCls}
                >
                  <option value="">Select campaign source</option>
                  {CAMPAIGN_SOURCES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">▾</span>
              </div>
            </Field>

            {/* Lead Priority */}
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
        </div>

        {/* DESCRIPTION */}
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
