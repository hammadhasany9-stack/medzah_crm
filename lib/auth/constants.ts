export type Tenant = "kevin" | "amanda";

export const KEVIN_EMAIL = "kevin@medzah.com";
export const AMANDA_EMAIL = "amanda@medzah.com";

const EMAIL_TO_TENANT: Record<string, Tenant> = {
  [KEVIN_EMAIL]: "kevin",
  [AMANDA_EMAIL]: "amanda",
};

/** Prototype-only fixed codes per allowed login email. */
const FIXED_LOGIN_OTP: Record<string, string> = {
  [KEVIN_EMAIL]: "123456",
  [AMANDA_EMAIL]: "456789",
};

export function getFixedLoginOtp(normalizedEmail: string): string | null {
  return FIXED_LOGIN_OTP[normalizedEmail] ?? null;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function emailToTenant(email: string): Tenant | null {
  return EMAIL_TO_TENANT[normalizeEmail(email)] ?? null;
}

export function isAllowedLoginEmail(email: string): boolean {
  return emailToTenant(email) !== null;
}

export const AMANDA_ALLOWED_SEGMENTS = new Set([
  "dashboard",
  "allocation",
  "quotes",
  "sales-orders",
  "account",
  "contact",
  "customer-intake",
  "documents",
  "contracts",
  "campaign",
  "settings",
]);

export const TENANTS: Tenant[] = ["kevin", "amanda"];

export function isTenant(s: string): s is Tenant {
  return s === "kevin" || s === "amanda";
}

export const CRM_ROOT_SEGMENTS = new Set([
  "leads",
  "dashboard",
  "opportunity",
  "quotes",
  "sales-orders",
  "allocation",
  "account",
  "contact",
  "customer-intake",
  "documents",
  "contracts",
  "campaign",
  "settings",
  "inbox",
]);
