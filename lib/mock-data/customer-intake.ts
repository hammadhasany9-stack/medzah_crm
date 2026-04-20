export type IntakeStatus = "Email Sent" | "Onboarding Complete" | "Onboarding Pending";

export type IntakeApprovalStatus = "pending" | "approved";

export interface CustomerIntakeRecord {
  id: string;
  // Core list fields
  customerName: string;
  email: string;
  intakeOwner: string;
  modifiedTime: string; // ISO string
  status: IntakeStatus;
  /** Set when the record is sent for internal approval (Customer Intake Approvals screen). */
  intakeApprovalStatus?: IntakeApprovalStatus | null;
  intakeApprovalSubmittedAt?: string;
  // Extended form fields
  customerFor: string;
  primaryContactFirstName: string;
  primaryContactLastName: string;
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
  secondaryEmail: string;
  salesRep: string;
}

const STORAGE_KEY = "medzah_crm_customer_intake_v3";

export const INTAKE_OWNERS = [
  "Patrick Lacasse",
  "Katie Allen",
  "Sohail Chaudhry",
  "Kevin Calamari",
  "Sarah Johnson",
];

export const INITIAL_CUSTOMER_INTAKES: CustomerIntakeRecord[] = [
  {
    id: "CI-001",
    customerFor: "Medzah",
    customerName: "Sheriff's Department Hampden",
    email: "mary.pastore@sdh.state.ma.us",
    intakeOwner: "Patrick Lacasse",
    modifiedTime: new Date("2026-02-13T09:21:00").toISOString(),
    status: "Onboarding Complete",
    primaryContactFirstName: "Mary",
    primaryContactLastName: "Pastore",
    primaryContactPhone: "(413) 555-0100",
    primaryContactMobile: "",
    website: "",
    accountsPayableFirstName: "Mary",
    accountsPayableLastName: "Pastore",
    accountsPayableEmail: "mary.pastore@sdh.state.ma.us",
    accountsPayablePhone: "(413) 555-0100",
    primaryAddressStreet: "100 Congress St",
    primaryAddressCity: "Springfield",
    primaryAddressState: "MA",
    primaryAddressZipCode: "01103",
    orderMethodPreference: "Email",
    w9OrTaxExempt: "Tax Exempt",
    jobTitle: "Procurement Officer",
    secondaryEmail: "",
    salesRep: "Patrick Lacasse",
  },
  {
    id: "CI-002",
    customerFor: "Medzah",
    customerName: "Fount Medical",
    email: "brianwriston@fountmedical.com",
    intakeOwner: "Katie Allen",
    modifiedTime: new Date("2026-01-22T10:51:00").toISOString(),
    status: "Email Sent",
    primaryContactFirstName: "Brian",
    primaryContactLastName: "Wriston",
    primaryContactPhone: "919-605-4804",
    primaryContactMobile: "",
    website: "",
    accountsPayableFirstName: "Brian",
    accountsPayableLastName: "Wriston",
    accountsPayableEmail: "brianwriston@fountmedical.com",
    accountsPayablePhone: "919-605-4804",
    primaryAddressStreet: "11645 Retail Drive #1164",
    primaryAddressCity: "Wake Forest",
    primaryAddressState: "NC",
    primaryAddressZipCode: "27587",
    orderMethodPreference: "Email",
    w9OrTaxExempt: "W9 Submitted",
    jobTitle: "Office Manager",
    secondaryEmail: "",
    salesRep: "Katie Allen",
  },
  {
    id: "CI-003",
    customerFor: "Medzah",
    customerName: "Deli Delight",
    email: "hayel35@gmail.com",
    intakeOwner: "Patrick Lacasse",
    modifiedTime: new Date("2025-11-20T16:08:00").toISOString(),
    status: "Onboarding Pending",
    primaryContactFirstName: "Hayel",
    primaryContactLastName: "",
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
    secondaryEmail: "",
    salesRep: "Patrick Lacasse",
  },
  {
    id: "CI-004",
    customerFor: "Medzah",
    customerName: "TruDME Management, LLC",
    email: "dshelley@trudme.com",
    intakeOwner: "Patrick Lacasse",
    modifiedTime: new Date("2025-10-31T14:39:00").toISOString(),
    status: "Onboarding Complete",
    primaryContactFirstName: "D.",
    primaryContactLastName: "Shelley",
    primaryContactPhone: "(919) 555-0200",
    primaryContactMobile: "",
    website: "www.trudme.com",
    accountsPayableFirstName: "D.",
    accountsPayableLastName: "Shelley",
    accountsPayableEmail: "dshelley@trudme.com",
    accountsPayablePhone: "(919) 555-0200",
    primaryAddressStreet: "200 Business Park Dr",
    primaryAddressCity: "Raleigh",
    primaryAddressState: "NC",
    primaryAddressZipCode: "27601",
    orderMethodPreference: "Online Portal",
    w9OrTaxExempt: "W9 Submitted",
    jobTitle: "Operations Manager",
    secondaryEmail: "",
    salesRep: "Patrick Lacasse",
  },
  {
    id: "CI-005",
    customerFor: "Medzah",
    customerName: "Fairview Old Fellows Home of Connecticut",
    email: "gigliottik@fairviewct.org",
    intakeOwner: "Katie Allen",
    modifiedTime: new Date("2025-09-24T12:56:00").toISOString(),
    status: "Email Sent",
    primaryContactFirstName: "K.",
    primaryContactLastName: "Gigliotti",
    primaryContactPhone: "(860) 555-0300",
    primaryContactMobile: "",
    website: "www.fairviewct.org",
    accountsPayableFirstName: "K.",
    accountsPayableLastName: "Gigliotti",
    accountsPayableEmail: "gigliottik@fairviewct.org",
    accountsPayablePhone: "(860) 555-0300",
    primaryAddressStreet: "45 Fairview Rd",
    primaryAddressCity: "Hartford",
    primaryAddressState: "CT",
    primaryAddressZipCode: "06101",
    orderMethodPreference: "Email",
    w9OrTaxExempt: "Tax Exempt",
    jobTitle: "Administrator",
    secondaryEmail: "",
    salesRep: "Katie Allen",
  },
  {
    id: "CI-006",
    customerFor: "Medzah",
    customerName: "Ashe Memorial Hospital",
    email: "purchasing@ashememorial.org",
    intakeOwner: "Sohail Chaudhry",
    modifiedTime: new Date("2025-09-25T15:30:00").toISOString(),
    status: "Onboarding Pending",
    primaryContactFirstName: "Purchasing",
    primaryContactLastName: "Department",
    primaryContactPhone: "(336) 555-0400",
    primaryContactMobile: "",
    website: "www.ashememorial.org",
    accountsPayableFirstName: "",
    accountsPayableLastName: "",
    accountsPayableEmail: "purchasing@ashememorial.org",
    accountsPayablePhone: "(336) 555-0400",
    primaryAddressStreet: "200 Hospital Ave",
    primaryAddressCity: "Jefferson",
    primaryAddressState: "NC",
    primaryAddressZipCode: "28640",
    orderMethodPreference: "Phone",
    w9OrTaxExempt: "Tax Exempt",
    jobTitle: "Purchasing Manager",
    secondaryEmail: "",
    salesRep: "Sohail Chaudhry",
  },
  {
    id: "CI-007",
    customerFor: "Medzah",
    customerName: "Test Company",
    email: "dirt@company.com",
    intakeOwner: "Patrick Lacasse",
    modifiedTime: new Date("2025-09-11T10:48:00").toISOString(),
    status: "Onboarding Pending",
    primaryContactFirstName: "",
    primaryContactLastName: "",
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
    secondaryEmail: "",
    salesRep: "",
  },
  {
    id: "CI-008",
    customerFor: "Medzah",
    customerName: "Fireside Primary Care",
    email: "drjeffreygoodsell@gmail.com",
    intakeOwner: "Katie Allen",
    modifiedTime: new Date("2025-09-24T16:19:00").toISOString(),
    status: "Email Sent",
    primaryContactFirstName: "Jeffrey",
    primaryContactLastName: "Goodsell",
    primaryContactPhone: "(603) 555-0500",
    primaryContactMobile: "",
    website: "",
    accountsPayableFirstName: "Jeffrey",
    accountsPayableLastName: "Goodsell",
    accountsPayableEmail: "drjeffreygoodsell@gmail.com",
    accountsPayablePhone: "(603) 555-0500",
    primaryAddressStreet: "78 Fireside Way",
    primaryAddressCity: "Concord",
    primaryAddressState: "NH",
    primaryAddressZipCode: "03301",
    orderMethodPreference: "Email",
    w9OrTaxExempt: "W9 Submitted",
    jobTitle: "Physician / Owner",
    secondaryEmail: "",
    salesRep: "Katie Allen",
  },
  {
    id: "CI-009",
    customerFor: "Medzah",
    customerName: "University Orthopedics - Walkers",
    email: "cbraddock@uoi.com",
    intakeOwner: "Katie Allen",
    modifiedTime: new Date("2025-08-22T11:39:00").toISOString(),
    status: "Onboarding Complete",
    primaryContactFirstName: "C.",
    primaryContactLastName: "Braddock",
    primaryContactPhone: "(401) 555-0600",
    primaryContactMobile: "",
    website: "www.uoi.com",
    accountsPayableFirstName: "C.",
    accountsPayableLastName: "Braddock",
    accountsPayableEmail: "cbraddock@uoi.com",
    accountsPayablePhone: "(401) 555-0600",
    primaryAddressStreet: "1 Kettle Point Ave",
    primaryAddressCity: "East Providence",
    primaryAddressState: "RI",
    primaryAddressZipCode: "02914",
    orderMethodPreference: "Online Portal",
    w9OrTaxExempt: "W9 Submitted",
    jobTitle: "Practice Manager",
    secondaryEmail: "",
    salesRep: "Katie Allen",
  },
  {
    id: "CI-010",
    customerFor: "Medzah",
    customerName: "Franciscan Children's Hospital",
    email: "purchasing@franciscanchildrens.org",
    intakeOwner: "Patrick Lacasse",
    modifiedTime: new Date("2025-08-14T08:16:00").toISOString(),
    status: "Email Sent",
    primaryContactFirstName: "Purchasing",
    primaryContactLastName: "Dept",
    primaryContactPhone: "(617) 555-0700",
    primaryContactMobile: "",
    website: "www.franciscanchildrens.org",
    accountsPayableFirstName: "",
    accountsPayableLastName: "",
    accountsPayableEmail: "purchasing@franciscanchildrens.org",
    accountsPayablePhone: "(617) 555-0700",
    primaryAddressStreet: "30 Warren St",
    primaryAddressCity: "Brighton",
    primaryAddressState: "MA",
    primaryAddressZipCode: "02135",
    orderMethodPreference: "Email",
    w9OrTaxExempt: "Tax Exempt",
    jobTitle: "Supply Chain Coordinator",
    secondaryEmail: "",
    salesRep: "Patrick Lacasse",
  },
];

export function loadCustomerIntakes(): CustomerIntakeRecord[] {
  if (typeof window === "undefined") return INITIAL_CUSTOMER_INTAKES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return INITIAL_CUSTOMER_INTAKES;
}

export function saveCustomerIntakes(records: CustomerIntakeRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // ignore
  }
}

export function getCustomerIntakeById(id: string): CustomerIntakeRecord | null {
  return loadCustomerIntakes().find((r) => r.id === id) ?? null;
}

export function upsertCustomerIntake(record: CustomerIntakeRecord): void {
  const all = loadCustomerIntakes();
  const idx = all.findIndex((r) => r.id === record.id);
  if (idx >= 0) {
    all[idx] = record;
  } else {
    all.unshift(record);
  }
  saveCustomerIntakes(all);
}

export function deleteCustomerIntake(id: string): void {
  saveCustomerIntakes(loadCustomerIntakes().filter((r) => r.id !== id));
}

function patchCustomerIntake(
  id: string,
  patch: (r: CustomerIntakeRecord) => CustomerIntakeRecord | null
): boolean {
  const all = loadCustomerIntakes();
  const idx = all.findIndex((r) => r.id === id);
  if (idx < 0) return false;
  const next = patch(all[idx]);
  if (!next) return false;
  all[idx] = next;
  saveCustomerIntakes(all);
  return true;
}

/** Submit for approval from the main list (requires Onboarding Complete). */
export function submitCustomerIntakeForApproval(id: string): boolean {
  return patchCustomerIntake(id, (r) => {
    if (r.status !== "Onboarding Complete") return null;
    const now = new Date().toISOString();
    return {
      ...r,
      intakeApprovalStatus: "pending",
      intakeApprovalSubmittedAt: now,
    };
  });
}

/** Approver marks the intake approved. */
export function approveCustomerIntakeApproval(id: string): boolean {
  return patchCustomerIntake(id, (r) => {
    if (r.intakeApprovalStatus !== "pending") return null;
    return { ...r, intakeApprovalStatus: "approved" };
  });
}

function clearIntakeApprovalFields(r: CustomerIntakeRecord): CustomerIntakeRecord {
  const next: CustomerIntakeRecord = { ...r };
  delete next.intakeApprovalStatus;
  delete next.intakeApprovalSubmittedAt;
  return next;
}

/** Reject from approvals queue (row leaves approvals table). */
export function rejectCustomerIntakeApproval(id: string): boolean {
  return patchCustomerIntake(id, (r) => {
    if (r.intakeApprovalStatus !== "pending") return null;
    return clearIntakeApprovalFields(r);
  });
}

/** Clear approval state so the owner can send for approval again. */
export function sendCustomerIntakeFormAgain(id: string): boolean {
  return patchCustomerIntake(id, (r) => {
    if (r.intakeApprovalStatus !== "pending" && r.intakeApprovalStatus !== "approved") {
      return null;
    }
    return clearIntakeApprovalFields(r);
  });
}

export function generateIntakeId(): string {
  const existing = loadCustomerIntakes().map((r) => r.id);
  let id: string;
  do {
    const num = String(Math.floor(Math.random() * 900) + 100).padStart(3, "0");
    id = `CI-${num}`;
  } while (existing.includes(id));
  return id;
}
