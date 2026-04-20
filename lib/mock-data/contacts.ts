export interface ContactRecord {
  id: string;
  contactOwner: string;
  firstName: string;
  lastName: string;
  contactType: string;
  email: string;
  phone: string;
  otherPhone: string;
  homePhone: string;
  mobile: string;
  fax: string;
  accountName: string;
  department: string;
  title: string;
  // Mailing Address
  mailingStreet: string;
  mailingCity: string;
  mailingState: string;
  mailingCode: string;
  mailingCountry: string;
  // Other Address
  otherStreet: string;
  otherCity: string;
  otherState: string;
  otherCode: string;
  otherCountry: string;
  // Meta
  description: string;
  /** Internal CRM opportunity id when linked to a Closed Won / approved quote deal */
  linkedOpportunityId?: string;
  /** Quote ref (e.g. Q-2026-1001) from that deal */
  linkedQuoteId?: string;
  createdAt: string;
}

export const CONTACT_TYPES = [
  "Customer",
  "Partner",
  "Prospect",
  "Lead",
  "Vendor",
  "Other",
];

export const CONTACT_OWNERS = [
  "Kevin Calamari",
  "Katie Allen",
  "John Smith",
  "Sarah Johnson",
  "Michael Lee",
];

export const CONTACT_ACCOUNT_NAMES = [
  "Pinnacle Health Group",
  "Riverside Clinic",
  "Lumina Architecture",
  "Meridian Healthcare Group",
  "Vantage Rehabilitation Services",
  "High Pointe Surgery Center",
  "Clearview Medical Diagnostics",
  "Capstone Medical",
  "Sunridge Community Hospital",
];

export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

export const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "India",
  "Other",
];

const STORAGE_KEY = "medzah_crm_contacts_v1";

export const INITIAL_CONTACTS: ContactRecord[] = [
  {
    id: "C-56333",
    contactOwner: "Katie Allen",
    firstName: "Jone",
    lastName: "Rivers",
    contactType: "Customer",
    email: "jone.rivers@gmail.com",
    phone: "(860) 222-8989",
    otherPhone: "",
    homePhone: "(860) 222-9000",
    mobile: "(860) 555-1234",
    fax: "",
    accountName: "Pinnacle Health Group",
    department: "Procurement",
    title: "Supply Manager",
    mailingStreet: "88 Medical Blvd",
    mailingCity: "Chicago",
    mailingState: "IL",
    mailingCode: "60601",
    mailingCountry: "United States",
    otherStreet: "",
    otherCity: "",
    otherState: "",
    otherCode: "",
    otherCountry: "",
    description: "Primary procurement contact for Pinnacle Health Group.",
    createdAt: new Date("2026-04-14").toISOString(),
  },
  {
    id: "C-56102",
    contactOwner: "Kevin Calamari",
    firstName: "Maria",
    lastName: "Chen",
    contactType: "Customer",
    email: "m.chen@riversideclinic.com",
    phone: "(713) 488-1222",
    otherPhone: "",
    homePhone: "",
    mobile: "(713) 901-4455",
    fax: "",
    accountName: "Riverside Clinic",
    department: "Operations",
    title: "Operations Director",
    mailingStreet: "12 Riverside Ave",
    mailingCity: "Houston",
    mailingState: "TX",
    mailingCode: "77001",
    mailingCountry: "United States",
    otherStreet: "",
    otherCity: "",
    otherState: "",
    otherCode: "",
    otherCountry: "",
    description: "Oversees day-to-day operations at Riverside Clinic.",
    createdAt: new Date("2026-04-10").toISOString(),
  },
  {
    id: "C-55870",
    contactOwner: "Katie Allen",
    firstName: "Daniel",
    lastName: "Foster",
    contactType: "Partner",
    email: "d.foster@luminaarch.com",
    phone: "(312) 900-4410",
    otherPhone: "(312) 900-4411",
    homePhone: "",
    mobile: "(312) 707-8823",
    fax: "(312) 900-4412",
    accountName: "Lumina Architecture",
    department: "Design",
    title: "Lead Architect",
    mailingStreet: "14 Lourdes Medical Way",
    mailingCity: "Chicago",
    mailingState: "IL",
    mailingCode: "60601",
    mailingCountry: "United States",
    otherStreet: "",
    otherCity: "",
    otherState: "",
    otherCode: "",
    otherCountry: "",
    description: "Lead architect on healthcare facility design projects.",
    createdAt: new Date("2026-04-08").toISOString(),
  },
  {
    id: "C-55601",
    contactOwner: "Sarah Johnson",
    firstName: "Angela",
    lastName: "Torres",
    contactType: "Prospect",
    email: "atorres@meridianhg.com",
    phone: "(212) 774-2010",
    otherPhone: "",
    homePhone: "",
    mobile: "(212) 500-6677",
    fax: "",
    accountName: "Meridian Healthcare Group",
    department: "Finance",
    title: "CFO",
    mailingStreet: "200 Healthcare Blvd",
    mailingCity: "New York",
    mailingState: "NY",
    mailingCode: "10001",
    mailingCountry: "United States",
    otherStreet: "",
    otherCity: "",
    otherState: "",
    otherCode: "",
    otherCountry: "",
    description: "Decision maker for device procurement budgets.",
    createdAt: new Date("2026-04-05").toISOString(),
  },
  {
    id: "C-55320",
    contactOwner: "Michael Lee",
    firstName: "Robert",
    lastName: "Barnes",
    contactType: "Lead",
    email: "r.barnes@vantagerehab.com",
    phone: "(713) 660-8810",
    otherPhone: "",
    homePhone: "",
    mobile: "(713) 222-3344",
    fax: "",
    accountName: "Vantage Rehabilitation Services",
    department: "Medical",
    title: "Physical Therapist",
    mailingStreet: "45 Rehab Park Ave",
    mailingCity: "Houston",
    mailingState: "TX",
    mailingCode: "77002",
    mailingCountry: "United States",
    otherStreet: "",
    otherCity: "",
    otherState: "",
    otherCode: "",
    otherCountry: "",
    description: "Key clinical contact for rehabilitation equipment orders.",
    createdAt: new Date("2026-04-03").toISOString(),
  },
  {
    id: "C-55901",
    contactOwner: "Kevin Calamari",
    firstName: "Alara",
    lastName: "Kalila",
    contactType: "Customer",
    email: "alara.k@lumina.example.com",
    phone: "+1 404-555-0100",
    otherPhone: "",
    homePhone: "",
    mobile: "",
    fax: "",
    accountName: "Lumina Architecture",
    department: "Facilities",
    title: "OR Program Director",
    mailingStreet: "14 Lourdes Medical Way",
    mailingCity: "Chicago",
    mailingState: "IL",
    mailingCode: "60601",
    mailingCountry: "United States",
    otherStreet: "",
    otherCity: "",
    otherState: "",
    otherCode: "",
    otherCountry: "",
    description: "Primary contact for OR expansion and instrumentation quotes.",
    createdAt: new Date("2026-04-01").toISOString(),
  },
  {
    id: "C-55680",
    contactOwner: "Kevin Calamari",
    firstName: "Dr. Priya",
    lastName: "Sharma",
    contactType: "Customer",
    email: "priya.sharma@meridian.example.com",
    phone: "+1 312-555-0144",
    otherPhone: "",
    homePhone: "",
    mobile: "",
    fax: "",
    accountName: "Meridian Healthcare Group",
    department: "Clinical Operations",
    title: "Chief of Cardiology",
    mailingStreet: "200 Healthcare Blvd",
    mailingCity: "New York",
    mailingState: "NY",
    mailingCode: "10001",
    mailingCountry: "United States",
    otherStreet: "",
    otherCity: "",
    otherState: "",
    otherCode: "",
    otherCountry: "",
    description: "Clinical lead for patient monitoring rollout.",
    createdAt: new Date("2026-03-20").toISOString(),
  },
  {
    id: "C-55488",
    contactOwner: "Kevin Calamari",
    firstName: "Marcus",
    lastName: "Webb",
    contactType: "Customer",
    email: "m.webb@capstone.example.com",
    phone: "+1 617-555-0199",
    otherPhone: "",
    homePhone: "",
    mobile: "",
    fax: "",
    accountName: "Capstone Medical",
    department: "Supply Chain",
    title: "Materials Manager",
    mailingStreet: "88 Federal St",
    mailingCity: "Boston",
    mailingState: "MA",
    mailingCode: "02110",
    mailingCountry: "United States",
    otherStreet: "",
    otherCity: "",
    otherState: "",
    otherCode: "",
    otherCountry: "",
    description: "Consumables pilot point of contact.",
    createdAt: new Date("2026-04-10").toISOString(),
  },
  {
    id: "C-55001",
    contactOwner: "Katie Allen",
    firstName: "Jordan",
    lastName: "Ellis",
    contactType: "Customer",
    email: "j.ellis@sunridgecommunity.example.com",
    phone: "(503) 221-6610",
    otherPhone: "",
    homePhone: "",
    mobile: "(503) 555-0140",
    fax: "",
    accountName: "Sunridge Community Hospital",
    department: "Patient Services",
    title: "Director of Materials",
    mailingStreet: "1200 Wellness Way",
    mailingCity: "Portland",
    mailingState: "OR",
    mailingCode: "97201",
    mailingCountry: "United States",
    otherStreet: "",
    otherCity: "",
    otherState: "",
    otherCode: "",
    otherCountry: "",
    description: "Primary contact for the Sunridge account — paired with seeded user-created account.",
    createdAt: new Date("2026-04-18").toISOString(),
  },
];

export function loadContacts(): ContactRecord[] {
  if (typeof window === "undefined") return INITIAL_CONTACTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return INITIAL_CONTACTS;
}

export function saveContacts(contacts: ContactRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  } catch {
    // ignore
  }
}

export function getContactById(id: string): ContactRecord | null {
  return loadContacts().find((c) => c.id === id) ?? null;
}

/** "First Last" labels from mock contacts for quote/opportunity dropdowns */
export function getContactDisplayNamesForQuotePicker(): string[] {
  return loadContacts()
    .map((c) => `${c.firstName} ${c.lastName}`.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

/** Match opportunity contact display name to a contact on the account */
export function getContactByAccountAndName(
  accountName: string,
  contactDisplayName: string
): ContactRecord | null {
  const acc = accountName.trim();
  const want = contactDisplayName.trim().toLowerCase();
  if (!acc || !want) return null;
  return (
    loadContacts().find((c) => {
      if (c.accountName !== acc) return false;
      const full = `${c.firstName} ${c.lastName}`.trim().toLowerCase();
      return full === want;
    }) ?? null
  );
}

export function upsertContact(contact: ContactRecord): void {
  const all = loadContacts();
  const idx = all.findIndex((c) => c.id === contact.id);
  if (idx >= 0) {
    all[idx] = contact;
  } else {
    all.unshift(contact);
  }
  saveContacts(all);
}

export function deleteContact(id: string): void {
  saveContacts(loadContacts().filter((c) => c.id !== id));
}

export function generateContactId(): string {
  const num = 50000 + Math.floor(Math.random() * 9999);
  return `C-${num}`;
}
