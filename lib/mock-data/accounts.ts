export interface AccountRecord {
  id: string;
  accountOwner: string;
  name: string;
  phone: string;
  accountNumber: string;
  fax: string;
  accountType: string;
  website: string;
  industry: string;
  contractsCounterPartyId: string;
  // Billing Address
  billingStreet: string;
  billingCity: string;
  billingState: string;
  billingCode: string;
  billingCountry: string;
  // Shipping Address
  shippingStreet: string;
  shippingCity: string;
  shippingState: string;
  shippingCode: string;
  shippingCountry: string;
  // Meta
  description: string;
  status: "Active" | "Inactive" | "Prospect";
  createdAt: string; // ISO string for JSON serialization
}

export const ACCOUNT_TYPES = [
  "Customer",
  "Partner",
  "Competitor",
  "Distributor",
  "Reseller",
  "Vendor",
  "Other",
];

export const INDUSTRIES = [
  "Healthcare",
  "Cardiology",
  "Diagnostics",
  "Orthopedics",
  "Rehabilitation",
  "Surgical",
  "Urgent Care",
  "Technology",
  "Finance",
  "Other",
];

export const ACCOUNT_OWNERS = [
  "Kevin Calamari",
  "Katie Allen",
  "John Smith",
  "Sarah Johnson",
  "Michael Lee",
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

const STORAGE_KEY = "medzah_crm_accounts_v2";

// These account names intentionally match the accountName fields used across
// Opportunities and Quotes so navigation between modules is consistent.
export const INITIAL_ACCOUNTS: AccountRecord[] = [
  {
    id: "A-45633",
    accountOwner: "Katie Allen",
    name: "Pinnacle Health Group",
    phone: "(555) 234-5678",
    accountNumber: "ACC-001",
    fax: "(555) 234-5679",
    accountType: "Customer",
    website: "www.pinnaclehealth.com",
    industry: "Healthcare",
    contractsCounterPartyId: "CP-001",
    billingStreet: "88 Medical Blvd",
    billingCity: "Chicago",
    billingState: "IL",
    billingCode: "60601",
    billingCountry: "United States",
    shippingStreet: "88 Medical Blvd",
    shippingCity: "Chicago",
    shippingState: "IL",
    shippingCode: "60601",
    shippingCountry: "United States",
    description: "Full-service health group specialising in wound care and surgical supply.",
    status: "Active",
    createdAt: new Date("2026-04-14").toISOString(),
  },
  {
    id: "A-45210",
    accountOwner: "Kevin Calamari",
    name: "Riverside Clinic",
    phone: "(713) 488-1200",
    accountNumber: "ACC-002",
    fax: "(713) 488-1201",
    accountType: "Customer",
    website: "www.riversideclinic.com",
    industry: "Diagnostics",
    contractsCounterPartyId: "CP-002",
    billingStreet: "12 Riverside Ave",
    billingCity: "Houston",
    billingState: "TX",
    billingCode: "77001",
    billingCountry: "United States",
    shippingStreet: "12 Riverside Ave",
    shippingCity: "Houston",
    shippingState: "TX",
    shippingCode: "77001",
    shippingCountry: "United States",
    description: "Diagnostics starter clinic serving the greater Houston area.",
    status: "Active",
    createdAt: new Date("2026-04-10").toISOString(),
  },
  {
    id: "A-44987",
    accountOwner: "Katie Allen",
    name: "Lumina Architecture",
    phone: "(312) 900-4400",
    accountNumber: "ACC-003",
    fax: "(312) 900-4401",
    accountType: "Partner",
    website: "www.luminaarchitecture.com",
    industry: "Healthcare",
    contractsCounterPartyId: "CP-003",
    billingStreet: "14 Lourdes Medical Way",
    billingCity: "Chicago",
    billingState: "IL",
    billingCode: "60601",
    billingCountry: "United States",
    shippingStreet: "14 Lourdes Medical Way",
    shippingCity: "Chicago",
    shippingState: "IL",
    shippingCode: "60601",
    shippingCountry: "United States",
    description: "Healthcare facility architecture and hot/cold therapy supply partner.",
    status: "Active",
    createdAt: new Date("2026-04-08").toISOString(),
  },
  {
    id: "A-44762",
    accountOwner: "David Walsh",
    name: "Meridian Healthcare Group",
    phone: "(212) 774-2000",
    accountNumber: "ACC-004",
    fax: "(212) 774-2001",
    accountType: "Customer",
    website: "www.meridianhealthcare.com",
    industry: "Healthcare",
    contractsCounterPartyId: "CP-004",
    billingStreet: "200 Healthcare Blvd",
    billingCity: "New York",
    billingState: "NY",
    billingCode: "10001",
    billingCountry: "United States",
    shippingStreet: "200 Healthcare Blvd",
    shippingCity: "New York",
    shippingState: "NY",
    shippingCode: "10001",
    shippingCountry: "United States",
    description: "Multi-site hospital group pursuing medical device fleet renewal.",
    status: "Active",
    createdAt: new Date("2026-04-05").toISOString(),
  },
  {
    id: "A-44530",
    accountOwner: "Patrick Moore",
    name: "Vantage Rehabilitation Services",
    phone: "(713) 660-8801",
    accountNumber: "ACC-005",
    fax: "(713) 660-8802",
    accountType: "Customer",
    website: "www.vantagerehab.com",
    industry: "Rehabilitation",
    contractsCounterPartyId: "CP-005",
    billingStreet: "45 Rehab Park Ave",
    billingCity: "Houston",
    billingState: "TX",
    billingCode: "77002",
    billingCountry: "United States",
    shippingStreet: "45 Rehab Park Ave",
    shippingCity: "Houston",
    shippingState: "TX",
    shippingCode: "77002",
    shippingCountry: "United States",
    description: "New 80-bed rehabilitation facility requiring full fit-out supply.",
    status: "Active",
    createdAt: new Date("2026-04-03").toISOString(),
  },
  {
    id: "A-44310",
    accountOwner: "Kevin Calamari",
    name: "High Pointe Surgery Center",
    phone: "(617) 552-3300",
    accountNumber: "ACC-006",
    fax: "(617) 552-3301",
    accountType: "Customer",
    website: "www.highpointesurgery.com",
    industry: "Surgical",
    contractsCounterPartyId: "CP-006",
    billingStreet: "300 High Pointe Dr",
    billingCity: "Boston",
    billingState: "MA",
    billingCode: "02108",
    billingCountry: "United States",
    shippingStreet: "300 High Pointe Dr",
    shippingCity: "Boston",
    shippingState: "MA",
    shippingCode: "02108",
    shippingCountry: "United States",
    description: "Ambulatory surgery center specialising in same-day surgical procedures.",
    status: "Active",
    createdAt: new Date("2026-04-01").toISOString(),
  },
  {
    id: "A-44105",
    accountOwner: "Katie Allen",
    name: "Clearview Medical Diagnostics",
    phone: "(404) 887-5500",
    accountNumber: "ACC-007",
    fax: "(404) 887-5501",
    accountType: "Prospect",
    website: "www.clearviewdiag.com",
    industry: "Diagnostics",
    contractsCounterPartyId: "CP-007",
    billingStreet: "900 Clearview Pkwy",
    billingCity: "Atlanta",
    billingState: "GA",
    billingCode: "30308",
    billingCountry: "United States",
    shippingStreet: "900 Clearview Pkwy",
    shippingCity: "Atlanta",
    shippingState: "GA",
    shippingCode: "30308",
    shippingCountry: "United States",
    description: "Independent diagnostic lab network expanding across the Southeast.",
    status: "Prospect",
    createdAt: new Date("2026-03-28").toISOString(),
  },
  {
    id: "A-44001",
    accountOwner: "Kevin Calamari",
    name: "Capstone Medical",
    phone: "(617) 555-0100",
    accountNumber: "ACC-008",
    fax: "",
    accountType: "Customer",
    website: "www.capstonemed.example.com",
    industry: "Healthcare",
    contractsCounterPartyId: "CP-008",
    billingStreet: "88 Federal St",
    billingCity: "Boston",
    billingState: "MA",
    billingCode: "02110",
    billingCountry: "United States",
    shippingStreet: "88 Federal St",
    shippingCity: "Boston",
    shippingState: "MA",
    shippingCode: "02110",
    shippingCountry: "United States",
    description: "Regional health system consumables and pilot programs.",
    status: "Active",
    createdAt: new Date("2026-04-10").toISOString(),
  },
  {
    id: "A-43588",
    accountOwner: "Kevin Calamari",
    name: "Sunridge Community Hospital",
    phone: "(503) 221-6600",
    accountNumber: "ACC-009",
    fax: "(503) 221-6601",
    accountType: "Customer",
    website: "www.sunridgecommunity.example.com",
    industry: "Healthcare",
    contractsCounterPartyId: "CP-009",
    billingStreet: "1200 Wellness Way",
    billingCity: "Portland",
    billingState: "OR",
    billingCode: "97201",
    billingCountry: "United States",
    shippingStreet: "1200 Wellness Way",
    shippingCity: "Portland",
    shippingState: "OR",
    shippingCode: "97201",
    shippingCountry: "United States",
    description: "Community hospital added via Create Account — demo seed aligned with user-created records.",
    status: "Active",
    createdAt: new Date("2026-04-18").toISOString(),
  },
];

export function loadAccounts(): AccountRecord[] {
  if (typeof window === "undefined") return INITIAL_ACCOUNTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return INITIAL_ACCOUNTS;
}

export function saveAccounts(accounts: AccountRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch {
    // ignore
  }
}

export function getAccountById(id: string): AccountRecord | null {
  return loadAccounts().find((a) => a.id === id) ?? null;
}

export function getAccountByName(name: string): AccountRecord | null {
  const t = name.trim();
  if (!t) return null;
  return loadAccounts().find((a) => a.name === t) ?? null;
}

export function upsertAccount(account: AccountRecord): void {
  const all = loadAccounts();
  const idx = all.findIndex((a) => a.id === account.id);
  if (idx >= 0) {
    all[idx] = account;
  } else {
    all.unshift(account);
  }
  saveAccounts(all);
}

export function deleteAccount(id: string): void {
  saveAccounts(loadAccounts().filter((a) => a.id !== id));
}

export function generateAccountId(): string {
  const num = 40000 + Math.floor(Math.random() * 9999);
  return `A-${num}`;
}

/** Account names for pickers (localStorage + seed), sorted. */
export function getAccountNamesForContactsPicker(): string[] {
  return loadAccounts()
    .map((a) => a.name)
    .sort((a, b) => a.localeCompare(b));
}
