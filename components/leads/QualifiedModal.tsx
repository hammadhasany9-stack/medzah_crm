"use client";

import { useRef, useState } from "react";
import { Check, X, CalendarDays, AlertCircle, ChevronDown } from "lucide-react";
import { OpportunityData, Priority } from "@/lib/types";

export type { OpportunityData };

interface QualifiedModalProps {
  leadName: string;
  defaultContactName?: string;
  defaultAccountName?: string;
  onSave: (data: OpportunityData) => void;
  onCancel: () => void;
}

// ─── Static option lists (will be replaced by real data when screens are built) ─

const BUSINESS_TYPES   = ["B2B", "B2C", "B2G", "New Business", "Existing Business", "Retail", "Wholesale", "Other"];
const PIPELINES        = ["Medzah Sales Pipeline", "Medzah Bid Opportunity Pipeline"];
const CAMPAIGN_SOURCES = ["Cold Call", "Cold Outreach", "Referral", "Website", "LinkedIn", "Trade Show", "Email Campaign", "Social Media", "Other"];
const LEAD_PRIORITIES: Priority[] = ["Hot", "Warm", "Cold"];

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

// ─── Main modal ───────────────────────────────────────────────────────────────

export function QualifiedModal({ leadName, defaultContactName = "", defaultAccountName = "", onSave, onCancel }: QualifiedModalProps) {
  const dateRef    = useRef<HTMLInputElement>(null);
  const closingRef = useRef<HTMLInputElement>(null);
  const [attempted, setAttempted] = useState(false);

  const [form, setForm] = useState<OpportunityData>({
    opportunityName: "",
    accountName:     defaultAccountName,
    businessType:    "",
    closingDate:     "",
    contactName:     defaultContactName,
    pipeline:        "",
    expectedRevenue: "",
    amount:          "",
    campaignSource:  "",
    description:     "",
    followUpDate:    addDays(2),
    leadPriority:    "Hot",
  });

  function set<K extends keyof OpportunityData>(key: K, val: OpportunityData[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  const requiredFilled =
    form.opportunityName.trim() !== "" &&
    form.accountName.trim()     !== "" &&
    form.businessType           !== "" &&
    form.closingDate            !== "" &&
    form.contactName.trim()     !== "" &&
    form.pipeline               !== "";

  function handleSave() {
    setAttempted(true);
    if (!requiredFilled) return;
    onSave(form);
  }

  const e = (field: keyof OpportunityData) =>
    attempted && (form[field] === "" || form[field] === null);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={(ev) => { if (ev.target === ev.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-2xl w-[580px] mx-4 shadow-[0_24px_64px_rgba(0,0,0,0.22)] overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header – fixed */}
        <div className="flex justify-end pt-4 pr-4 flex-shrink-0">
          <button type="button" onClick={onCancel} className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-8 pb-8 -mt-2">
          <div className="flex flex-col items-center gap-1 mb-5">
            {/* Icon */}
            <div className="w-11 h-11 rounded-full bg-slate-900 flex items-center justify-center shadow-md mb-2">
              <Check size={20} strokeWidth={3} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Lead Status Changed!</h2>
            <p className="text-sm text-slate-500 text-center">
              Your lead has moved to qualified, fill this form to create an opportunity
            </p>

            {/* Mandatory note */}
            <div className="flex items-start gap-2 mt-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 w-full">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-red-600 leading-relaxed font-medium text-center">
                <span className="font-bold">Mandatory Note:</span> If you haven&apos;t created account and contact, please create them first and then create opportunity, you can find create opportunity button in the opportunity screen
              </p>
            </div>
          </div>

          {/* Section title */}
          <p className="text-[15px] font-bold text-slate-900 text-center mb-5">Create new Opportunity</p>

          {/* ── Required fields grid ── */}
          {attempted && !requiredFilled && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
              <AlertCircle size={13} className="flex-shrink-0" />
              Please fill in all required fields before saving.
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-4 gap-y-4 mb-4">
            {/* Opportunity Name */}
            <Field label="Opportunity Name" required>
              <input
                type="text"
                value={form.opportunityName}
                onChange={(ev) => set("opportunityName", ev.target.value)}
                placeholder="Enter opportunity name"
                className={inputCls(e("opportunityName"))}
              />
            </Field>

            {/* Account Name */}
            <Field label="Account Name" required>
              <input
                type="text"
                value={form.accountName}
                onChange={(ev) => set("accountName", ev.target.value)}
                placeholder="Select account name"
                className={inputCls(e("accountName"))}
              />
            </Field>

            {/* Business Type */}
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

            {/* Closing Date */}
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

            {/* Contact Name */}
            <Field label="Contact Name" required>
              <input
                type="text"
                value={form.contactName}
                onChange={(ev) => set("contactName", ev.target.value)}
                placeholder="Select contact name"
                className={inputCls(e("contactName"))}
              />
            </Field>

            {/* Pipeline */}
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

            {/* Expected Revenue */}
            <Field label="Expected Revenue">
              <input
                type="text"
                value={form.expectedRevenue}
                onChange={(ev) => set("expectedRevenue", ev.target.value)}
                placeholder="Enter expected revenue"
                className={inputCls()}
              />
            </Field>

            {/* Amount */}
            <Field label="Amount">
              <input
                type="text"
                value={form.amount}
                onChange={(ev) => set("amount", ev.target.value)}
                placeholder="Enter amount"
                className={inputCls()}
              />
            </Field>

            {/* Campaign Source – spans left column only */}
            <Field label="Campaign Source">
              <SelectWrap>
                <select
                  value={form.campaignSource}
                  onChange={(ev) => set("campaignSource", ev.target.value)}
                  className={selectCls()}
                >
                  <option value="">Select campaign source</option>
                  {CAMPAIGN_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </SelectWrap>
            </Field>
          </div>

          {/* ── Description section ── */}
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

          {/* ── Next Action ── */}
          <div className="border-t border-slate-100 pt-4">
            <p className="text-[15px] font-bold text-slate-900 text-center mb-3">Your Next Action</p>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              {/* Follow-up date */}
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

              {/* Lead Priority */}
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

          {/* Save */}
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
