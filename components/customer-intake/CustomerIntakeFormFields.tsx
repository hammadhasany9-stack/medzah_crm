"use client";

import { cn } from "@/lib/utils";
import { INTAKE_OWNERS } from "@/lib/mock-data/customer-intake";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CustomerIntakeFormData {
  customerFor: string;
  customerName: string;
  primaryContactFirstName: string;
  primaryContactLastName: string;
  email: string;
  primaryContactPhone: string;
  primaryContactMobile: string;
  website: string;
  accountsPayableFirstName: string;
  accountsPayableLastName: string;
  accountsPayableEmail: string;
  accountsPayablePhone: string;
  primaryAddressStreet: string;
  primaryAddressCity: string;
  primaryAddressState: string;
  primaryAddressZipCode: string;
  orderMethodPreference: string;
  w9OrTaxExempt: string;
  jobTitle: string;
  intakeOwner: string;
  secondaryEmail: string;
  salesRep: string;
}

export const EMPTY_INTAKE_FORM: CustomerIntakeFormData = {
  customerFor: "",
  customerName: "",
  primaryContactFirstName: "",
  primaryContactLastName: "",
  email: "",
  primaryContactPhone: "",
  primaryContactMobile: "",
  website: "",
  accountsPayableFirstName: "",
  accountsPayableLastName: "",
  accountsPayableEmail: "",
  accountsPayablePhone: "",
  primaryAddressStreet: "",
  primaryAddressCity: "",
  primaryAddressState: "",
  primaryAddressZipCode: "",
  orderMethodPreference: "",
  w9OrTaxExempt: "",
  jobTitle: "",
  intakeOwner: "Kevin Calamari",
  secondaryEmail: "",
  salesRep: "",
};

export const CUSTOMER_FOR_OPTIONS = [
  "-None-",
  "New Customer",
  "Existing Customer",
  "Referral",
  "Partner",
];

export const ORDER_METHOD_OPTIONS = [
  "None",
  "Email",
  "Phone",
  "Online Portal",
  "Fax",
  "Mail",
];

export const W9_OPTIONS = [
  "Choose File",
  "W9 Submitted",
  "Tax Exempt",
  "Pending",
];

export const SALES_REPS = [
  "-None-",
  "Kevin Calamari",
  "Katie Allen",
  "Patrick Lacasse",
  "Sohail Chaudhry",
  "Sarah Johnson",
];

// ─── Field primitives ─────────────────────────────────────────────────────────

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

const inputErrorCls =
  "w-full px-3 py-2 rounded-lg border border-red-400 text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400/20 focus:border-red-400 transition-colors";

const selectCls =
  "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#002f93]/20 focus:border-[#002f93] transition-colors cursor-pointer appearance-none";

function TextInput({
  placeholder,
  value,
  onChange,
  type = "text",
  error,
  required,
}: {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className={error ? inputErrorCls : inputCls}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={selectCls}
      >
        {options.map((opt) => (
          <option key={opt} value={opt === "-None-" || opt === "Choose File" ? "" : opt}>
            {opt}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

function FormRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-x-16 gap-y-5">
      {children}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[180px_1fr] items-start gap-3">
      <FieldLabel required={required}>{label}</FieldLabel>
      <div>{children}</div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface CustomerIntakeFormFieldsProps {
  value: CustomerIntakeFormData;
  onChange: (data: CustomerIntakeFormData) => void;
  errors?: Partial<Record<keyof CustomerIntakeFormData, string>>;
}

export function CustomerIntakeFormFields({
  value,
  onChange,
  errors = {},
}: CustomerIntakeFormFieldsProps) {
  function set<K extends keyof CustomerIntakeFormData>(key: K, val: CustomerIntakeFormData[K]) {
    onChange({ ...value, [key]: val });
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Section header */}
      <div className="bg-slate-50 border-b border-slate-100 px-6 py-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Customer Intake Information
        </h3>
      </div>

      {/* Fields */}
      <div className="px-8 py-6 space-y-5">
        <FormRow>
          {/* Left: Customer For */}
          <Field label="Customer For">
            <SelectInput
              value={value.customerFor}
              onChange={(v) => set("customerFor", v)}
              options={CUSTOMER_FOR_OPTIONS}
            />
          </Field>

          {/* Right: Customer Intake Owner */}
          <Field label="Customer Intake Owner">
            <SelectInput
              value={value.intakeOwner}
              onChange={(v) => set("intakeOwner", v)}
              options={INTAKE_OWNERS}
            />
          </Field>
        </FormRow>

        <FormRow>
          {/* Left: Customer Name (required) */}
          <Field label="Customer Name" required>
            <TextInput
              placeholder="Enter customer name"
              value={value.customerName}
              onChange={(v) => set("customerName", v)}
              error={errors.customerName}
              required
            />
          </Field>

          {/* Right: Secondary Email */}
          <Field label="Secondary Email">
            <TextInput
              type="email"
              placeholder="secondary@example.com"
              value={value.secondaryEmail}
              onChange={(v) => set("secondaryEmail", v)}
            />
          </Field>
        </FormRow>

        <FormRow>
          {/* Left: Primary Contact First Name */}
          <Field label="Primary Contact First Name">
            <TextInput
              placeholder="First name"
              value={value.primaryContactFirstName}
              onChange={(v) => set("primaryContactFirstName", v)}
            />
          </Field>

          {/* Right: Medzah/Ditek Sales Rep */}
          <Field label="Medzah / Ditek Sales Rep">
            <SelectInput
              value={value.salesRep}
              onChange={(v) => set("salesRep", v)}
              options={SALES_REPS}
            />
          </Field>
        </FormRow>

        <FormRow>
          {/* Left: Primary Contact Last Name */}
          <Field label="Primary Contact Last Name">
            <TextInput
              placeholder="Last name"
              value={value.primaryContactLastName}
              onChange={(v) => set("primaryContactLastName", v)}
            />
          </Field>

          {/* Right: empty spacer */}
          <div />
        </FormRow>

        <FormRow>
          {/* Left: Email (required) */}
          <Field label="Email" required>
            <TextInput
              type="email"
              placeholder="email@example.com"
              value={value.email}
              onChange={(v) => set("email", v)}
              error={errors.email}
              required
            />
          </Field>

          <div />
        </FormRow>

        <FormRow>
          <Field label="Primary Contact Phone">
            <TextInput
              type="tel"
              placeholder="(555) 000-0000"
              value={value.primaryContactPhone}
              onChange={(v) => set("primaryContactPhone", v)}
            />
          </Field>
          <div />
        </FormRow>

        <FormRow>
          <Field label="Primary Contact Mobile">
            <TextInput
              type="tel"
              placeholder="(555) 000-0000"
              value={value.primaryContactMobile}
              onChange={(v) => set("primaryContactMobile", v)}
            />
          </Field>
          <div />
        </FormRow>

        <FormRow>
          <Field label="Website">
            <TextInput
              placeholder="www.example.com"
              value={value.website}
              onChange={(v) => set("website", v)}
            />
          </Field>
          <div />
        </FormRow>

        {/* Divider */}
        <div className="border-t border-slate-100 my-2" />

        <FormRow>
          <Field label="Accounts Payable First Name">
            <TextInput
              placeholder="First name"
              value={value.accountsPayableFirstName}
              onChange={(v) => set("accountsPayableFirstName", v)}
            />
          </Field>
          <div />
        </FormRow>

        <FormRow>
          <Field label="Accounts Payable Last Name">
            <TextInput
              placeholder="Last name"
              value={value.accountsPayableLastName}
              onChange={(v) => set("accountsPayableLastName", v)}
            />
          </Field>
          <div />
        </FormRow>

        <FormRow>
          <Field label="Accounts Payable Email">
            <TextInput
              type="email"
              placeholder="ap@example.com"
              value={value.accountsPayableEmail}
              onChange={(v) => set("accountsPayableEmail", v)}
            />
          </Field>
          <div />
        </FormRow>

        <FormRow>
          <Field label="Accounts Payable Phone">
            <TextInput
              type="tel"
              placeholder="(555) 000-0000"
              value={value.accountsPayablePhone}
              onChange={(v) => set("accountsPayablePhone", v)}
            />
          </Field>
          <div />
        </FormRow>

        {/* Divider */}
        <div className="border-t border-slate-100 my-2" />

        <FormRow>
          <Field label="Primary Address Street">
            <TextInput
              placeholder="123 Main St"
              value={value.primaryAddressStreet}
              onChange={(v) => set("primaryAddressStreet", v)}
            />
          </Field>
          <div />
        </FormRow>

        <FormRow>
          <Field label="Primary Address City">
            <TextInput
              placeholder="City"
              value={value.primaryAddressCity}
              onChange={(v) => set("primaryAddressCity", v)}
            />
          </Field>
          <div />
        </FormRow>

        <FormRow>
          <Field label="Primary Address State">
            <TextInput
              placeholder="State"
              value={value.primaryAddressState}
              onChange={(v) => set("primaryAddressState", v)}
            />
          </Field>
          <div />
        </FormRow>

        <FormRow>
          <Field label="Primary Address Zip Code">
            <TextInput
              placeholder="00000"
              value={value.primaryAddressZipCode}
              onChange={(v) => set("primaryAddressZipCode", v)}
            />
          </Field>
          <div />
        </FormRow>

        {/* Divider */}
        <div className="border-t border-slate-100 my-2" />

        <FormRow>
          <Field label="Order Method Preference">
            <SelectInput
              value={value.orderMethodPreference}
              onChange={(v) => set("orderMethodPreference", v)}
              options={ORDER_METHOD_OPTIONS}
            />
          </Field>
          <div />
        </FormRow>

        <FormRow>
          <Field label="W9 or Tax Exempt">
            <SelectInput
              value={value.w9OrTaxExempt}
              onChange={(v) => set("w9OrTaxExempt", v)}
              options={W9_OPTIONS}
            />
          </Field>
          <div />
        </FormRow>

        <FormRow>
          <Field label="Job Title">
            <TextInput
              placeholder="Job title"
              value={value.jobTitle}
              onChange={(v) => set("jobTitle", v)}
            />
          </Field>
          <div />
        </FormRow>
      </div>
    </div>
  );
}
