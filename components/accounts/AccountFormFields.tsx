"use client";

import { Lock, UserCircle2, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AccountRecord,
  ACCOUNT_TYPES,
  INDUSTRIES,
  ACCOUNT_OWNERS,
  US_STATES,
  COUNTRIES,
} from "@/lib/mock-data/accounts";

export type AccountFormData = Omit<AccountRecord, "id" | "createdAt">;

export const EMPTY_FORM_DATA: AccountFormData = {
  accountOwner: "Kevin Calamari",
  name: "",
  phone: "",
  accountNumber: "",
  fax: "",
  accountType: "",
  website: "",
  industry: "",
  contractsCounterPartyId: "",
  billingStreet: "",
  billingCity: "",
  billingState: "",
  billingCode: "",
  billingCountry: "",
  shippingStreet: "",
  shippingCity: "",
  shippingState: "",
  shippingCode: "",
  shippingCountry: "",
  description: "",
  status: "Active",
};

interface AccountFormFieldsProps {
  accountId: string;
  value: AccountFormData;
  onChange: (data: AccountFormData) => void;
  errors?: Partial<Record<keyof AccountFormData, string>>;
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
          <path d="M2 4l4 4 4-4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
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

export function AccountFormFields({
  accountId,
  value,
  onChange,
  errors = {},
}: AccountFormFieldsProps) {
  function set<K extends keyof AccountFormData>(key: K, val: AccountFormData[K]) {
    onChange({ ...value, [key]: val });
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
            <UserCircle2 size={28} className="text-slate-400 group-hover:text-[#002f93] transition-colors" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#002f93] flex items-center justify-center shadow">
            <Camera size={10} className="text-white" />
          </div>
        </div>
      </div>

      {/* ── ACCOUNT INFORMATION ── */}
      <SectionHeader title="Account Information" />

      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        {/* Account ID (read-only) */}
        <div>
          <FieldLabel>Account ID</FieldLabel>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-600">
            <span className="flex-1 font-mono">{accountId}</span>
            <Lock size={12} className="text-slate-400 flex-shrink-0" />
          </div>
        </div>

        {/* Account Owner */}
        <div>
          <FieldLabel>Account Owner</FieldLabel>
          <SelectInput
            options={ACCOUNT_OWNERS}
            value={value.accountOwner}
            onChange={(v) => set("accountOwner", v)}
          />
        </div>

        {/* Account Name */}
        <div>
          <FieldLabel required>Account Name</FieldLabel>
          <TextInput
            placeholder="Enter Name"
            value={value.name}
            onChange={(v) => set("name", v)}
            error={errors.name}
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

        {/* Account Number */}
        <div>
          <FieldLabel>Account Number</FieldLabel>
          <TextInput
            placeholder="None"
            value={value.accountNumber}
            onChange={(v) => set("accountNumber", v)}
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

        {/* Account Type */}
        <div>
          <FieldLabel>Account Type</FieldLabel>
          <SelectInput
            options={ACCOUNT_TYPES}
            value={value.accountType}
            onChange={(v) => set("accountType", v)}
            placeholder="Select type"
          />
        </div>

        {/* Website */}
        <div>
          <FieldLabel>Website</FieldLabel>
          <TextInput
            placeholder="None"
            value={value.website}
            onChange={(v) => set("website", v)}
          />
        </div>

        {/* Industry */}
        <div>
          <FieldLabel>Industry</FieldLabel>
          <SelectInput
            options={INDUSTRIES}
            value={value.industry}
            onChange={(v) => set("industry", v)}
            placeholder="Select Industry"
          />
        </div>

        {/* Contracts Counter Party ID */}
        <div>
          <FieldLabel>Contracts Counter Party ID</FieldLabel>
          <TextInput
            placeholder="None"
            value={value.contractsCounterPartyId}
            onChange={(v) => set("contractsCounterPartyId", v)}
          />
        </div>

        {/* Status */}
        <div>
          <FieldLabel>Status</FieldLabel>
          <SelectInput
            options={["Active", "Inactive", "Prospect"]}
            value={value.status}
            onChange={(v) => set("status", v as AccountFormData["status"])}
          />
        </div>
      </div>

      {/* ── ADDRESS INFORMATION ── */}
      <SectionHeader title="Address Information" />

      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        {/* Billing Street */}
        <div>
          <FieldLabel>Billing Street</FieldLabel>
          <TextInput
            placeholder="Enter Street"
            value={value.billingStreet}
            onChange={(v) => set("billingStreet", v)}
          />
        </div>

        {/* Shipping Street */}
        <div>
          <FieldLabel required>Shipping Street</FieldLabel>
          <TextInput
            placeholder="Enter Shipping Street"
            value={value.shippingStreet}
            onChange={(v) => set("shippingStreet", v)}
          />
        </div>

        {/* Billing City */}
        <div>
          <FieldLabel>Billing City</FieldLabel>
          <TextInput
            placeholder="Enter City"
            value={value.billingCity}
            onChange={(v) => set("billingCity", v)}
          />
        </div>

        {/* Shipping City */}
        <div>
          <FieldLabel>Shipping City</FieldLabel>
          <TextInput
            placeholder="Enter City"
            value={value.shippingCity}
            onChange={(v) => set("shippingCity", v)}
          />
        </div>

        {/* Billing State */}
        <div>
          <FieldLabel>Billing State</FieldLabel>
          <SelectInput
            options={US_STATES}
            value={value.billingState}
            onChange={(v) => set("billingState", v)}
            placeholder="Enter State"
          />
        </div>

        {/* Shipping State */}
        <div>
          <FieldLabel>Shipping State</FieldLabel>
          <SelectInput
            options={US_STATES}
            value={value.shippingState}
            onChange={(v) => set("shippingState", v)}
            placeholder="Enter State"
          />
        </div>

        {/* Billing Code */}
        <div>
          <FieldLabel>Billing Code</FieldLabel>
          <TextInput
            placeholder="Enter amount"
            value={value.billingCode}
            onChange={(v) => set("billingCode", v)}
          />
        </div>

        {/* Shipping Code */}
        <div>
          <FieldLabel>Shipping Code</FieldLabel>
          <TextInput
            placeholder="Enter amount"
            value={value.shippingCode}
            onChange={(v) => set("shippingCode", v)}
          />
        </div>

        {/* Billing Country */}
        <div>
          <FieldLabel>Billing Country</FieldLabel>
          <SelectInput
            options={COUNTRIES}
            value={value.billingCountry}
            onChange={(v) => set("billingCountry", v)}
            placeholder="Enter Country"
          />
        </div>

        {/* Shipping Country */}
        <div>
          <FieldLabel>Shipping Country</FieldLabel>
          <SelectInput
            options={COUNTRIES}
            value={value.shippingCountry}
            onChange={(v) => set("shippingCountry", v)}
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
