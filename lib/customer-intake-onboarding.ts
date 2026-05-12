import type { CustomerIntakeRecord } from "@/lib/mock-data/customer-intake";

/** Fields required before onboarding submit (Company & sales fields excluded). */
const REQUIRED_STRING_FIELDS: (keyof CustomerIntakeRecord)[] = [
  "primaryContactPhone",
  "accountsPayableFirstName",
  "accountsPayableLastName",
  "accountsPayableEmail",
  "accountsPayablePhone",
  "primaryAddressStreet",
  "primaryAddressCity",
  "primaryAddressState",
  "primaryAddressZipCode",
];

function nonEmpty(v: string | undefined): boolean {
  return typeof v === "string" && v.trim().length > 0;
}

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export function isOrderMethodComplete(v: string | undefined): boolean {
  return nonEmpty(v) && v !== "None";
}

export function isW9Complete(v: string | undefined): boolean {
  return nonEmpty(v);
}

/** Required slots for progress (optional fields excluded). */
export const ONBOARDING_PROGRESS_TOTAL =
  REQUIRED_STRING_FIELDS.length + 2;

export function countOnboardingFilled(r: Partial<CustomerIntakeRecord>): number {
  let n = 0;
  for (const key of REQUIRED_STRING_FIELDS) {
    if (nonEmpty(r[key] as string)) n += 1;
  }
  if (isOrderMethodComplete(r.orderMethodPreference)) n += 1;
  if (isW9Complete(r.w9OrTaxExempt)) n += 1;
  return n;
}

export function getOnboardingProgress(r: Partial<CustomerIntakeRecord>): {
  filled: number;
  total: number;
  percent: number;
} {
  const filled = countOnboardingFilled(r);
  const total = ONBOARDING_PROGRESS_TOTAL;
  const percent = total === 0 ? 0 : Math.min(100, Math.round((filled / total) * 100));
  return { filled, total, percent };
}

export function isOnboardingComplete(r: Partial<CustomerIntakeRecord>): boolean {
  for (const key of REQUIRED_STRING_FIELDS) {
    if (!nonEmpty(r[key] as string)) return false;
  }
  if (!isOrderMethodComplete(r.orderMethodPreference)) return false;
  if (!isW9Complete(r.w9OrTaxExempt)) return false;
  if (!nonEmpty(r.accountsPayableEmail) || !isValidEmail(r.accountsPayableEmail!)) return false;
  return true;
}

/** Step indices 0–3 (Primary contact → AP → Address → Ordering). */
export function getIncompleteStepIndexes(r: Partial<CustomerIntakeRecord>): number[] {
  const incomplete: number[] = [];
  if (!nonEmpty(r.primaryContactPhone)) {
    incomplete.push(0);
  }
  if (
    !nonEmpty(r.accountsPayableFirstName) ||
    !nonEmpty(r.accountsPayableLastName) ||
    !nonEmpty(r.accountsPayablePhone) ||
    !nonEmpty(r.accountsPayableEmail) ||
    !isValidEmail(r.accountsPayableEmail ?? "")
  ) {
    incomplete.push(1);
  }
  if (
    !nonEmpty(r.primaryAddressStreet) ||
    !nonEmpty(r.primaryAddressCity) ||
    !nonEmpty(r.primaryAddressState) ||
    !nonEmpty(r.primaryAddressZipCode)
  ) {
    incomplete.push(2);
  }
  if (!isOrderMethodComplete(r.orderMethodPreference) || !isW9Complete(r.w9OrTaxExempt)) {
    incomplete.push(3);
  }
  return incomplete;
}

export function isStepValid(step: number, r: Partial<CustomerIntakeRecord>): boolean {
  const bad = getIncompleteStepIndexes(r);
  return !bad.includes(step);
}
