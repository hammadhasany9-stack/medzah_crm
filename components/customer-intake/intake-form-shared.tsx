"use client";

import { INTAKE_OWNERS } from "@/lib/mock-data/customer-intake";
import { cn } from "@/lib/utils";

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

export const intakeInputCls =
  "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002f93]/20 focus:border-[#002f93] transition-colors";

export const intakeInputErrorCls =
  "w-full px-3 py-2 rounded-lg border border-red-400 text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400/20 focus:border-red-400 transition-colors";

export const intakeSelectCls =
  "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#002f93]/20 focus:border-[#002f93] transition-colors cursor-pointer appearance-none";

export function splitContactName(full: string): { first: string; last: string } {
  const t = full.trim();
  if (!t) return { first: "", last: "" };
  const i = t.indexOf(" ");
  if (i < 0) return { first: t, last: "" };
  return { first: t.slice(0, i), last: t.slice(i + 1).trim() };
}

export function joinContactName(first: string, last: string): string {
  return [first.trim(), last.trim()].filter(Boolean).join(" ");
}

export function IntakeFieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-slate-500 tracking-wide leading-snug pr-2 sm:pr-3 pt-2">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

export function IntakeTextInput({
  placeholder,
  value,
  onChange,
  type = "text",
  error,
  required,
  disabled,
}: {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        required={required}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={error ? intakeInputErrorCls : intakeInputCls}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export type IntakeSelectOption = string | { value: string; label: string };

function optionToEntry(opt: IntakeSelectOption): { value: string; label: string } {
  return typeof opt === "string" ? { value: opt, label: opt } : opt;
}

export function IntakeSelectInput({
  value,
  onChange,
  options,
  disabled,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  options: IntakeSelectOption[];
  disabled?: boolean;
  error?: string;
}) {
  const entries = options.map(optionToEntry);
  return (
    <div>
      <div className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={error ? intakeInputErrorCls : intakeSelectCls}
        >
          {entries.map((opt) => {
            const v =
              opt.value === "-None-" || opt.value === "Choose File" ? "" : opt.value;
            return (
              <option key={`${v}|${opt.label}`} value={v}>
                {opt.label}
              </option>
            );
          })}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function IntakeFormRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("grid grid-cols-2 gap-x-16 gap-y-5", className)}>{children}</div>;
}

export function IntakeFieldGrid({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-[180px_1fr] items-start gap-x-3", className)}>
      <IntakeFieldLabel required={required}>{label}</IntakeFieldLabel>
      <div className="min-w-0 w-full">{children}</div>
    </div>
  );
}

export { INTAKE_OWNERS };
