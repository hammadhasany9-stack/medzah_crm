import type { AllocationCustomerType, OpportunityData } from "@/lib/types";
import type { AccountRecord } from "@/lib/mock-data/accounts";
import type { ContactRecord } from "@/lib/mock-data/contacts";
import { upsertAccount, generateAccountId, getAccountById } from "@/lib/mock-data/accounts";
import { upsertContact, generateContactId } from "@/lib/mock-data/contacts";

export type CrmPersistInput = {
  customerType?: AllocationCustomerType;
  linkedAccountId?: string;
  linkedContactId?: string;
  accountName: string;
  accountWebsite?: string;
  accountIndustry?: string;
  contactFirstName?: string;
  contactLastName?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactGender?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
  addressCountry?: string;
};

function normIndustry(v?: string): string {
  if (!v || v === "None") return "Other";
  return v;
}

function splitName(full?: string): { first: string; last: string } {
  const t = (full ?? "").trim();
  if (!t) return { first: "", last: "" };
  const i = t.indexOf(" ");
  if (i === -1) return { first: t, last: "" };
  return { first: t.slice(0, i), last: t.slice(i + 1).trim() };
}

/**
 * Creates Account / Contact records in mock CRM storage when the opportunity flow
 * introduces new customer data. No-op when both account and contact already link to CRM.
 */
export function persistCrmCustomerRecords(input: CrmPersistInput): Pick<
  CrmPersistInput,
  "linkedAccountId" | "linkedContactId"
> {
  if (typeof window === "undefined") {
    return { linkedAccountId: input.linkedAccountId, linkedContactId: input.linkedContactId };
  }

  const fullExisting =
    input.customerType === "existing" &&
    Boolean(input.linkedAccountId) &&
    Boolean(input.linkedContactId);
  if (fullExisting) {
    return { linkedAccountId: input.linkedAccountId, linkedContactId: input.linkedContactId };
  }

  let linkedAccountId = input.linkedAccountId;
  let linkedContactId = input.linkedContactId;
  const accountName = input.accountName.trim();

  const street = input.addressStreet?.trim() ?? "";
  const city = input.addressCity?.trim() ?? "";
  const state = input.addressState?.trim() ?? "";
  const zip = input.addressZip?.trim() ?? "";
  const country = input.addressCountry?.trim() ?? "";

  if (!linkedAccountId && accountName) {
    const id = generateAccountId();
    const website = (input.accountWebsite ?? "").replace(/^https?:\/\//i, "").trim();
    const rec: AccountRecord = {
      id,
      accountOwner: "Katie Allen",
      name: accountName,
      phone: (input.contactPhone ?? "").trim(),
      accountNumber: "",
      fax: "",
      accountType: "Customer",
      website,
      industry: normIndustry(input.accountIndustry),
      contractsCounterPartyId: "",
      billingStreet: street,
      billingCity: city,
      billingState: state,
      billingCode: zip,
      billingCountry: country,
      shippingStreet: street,
      shippingCity: city,
      shippingState: state,
      shippingCode: zip,
      shippingCountry: country,
      description: "Created from opportunity flow.",
      status: "Active",
      createdAt: new Date().toISOString(),
    };
    upsertAccount(rec);
    linkedAccountId = id;
  }

  let accNameForContact = accountName;
  if (linkedAccountId) {
    const acc = getAccountById(linkedAccountId);
    if (acc) accNameForContact = acc.name;
  }

  if (linkedAccountId && !linkedContactId) {
    let first = input.contactFirstName?.trim() ?? "";
    let last = input.contactLastName?.trim() ?? "";
    if (!first && !last && input.contactName) {
      const sp = splitName(input.contactName);
      first = sp.first;
      last = sp.last;
    }
    if (first && last) {
      const id = generateContactId();
      const gender = input.contactGender?.trim();
      const descParts = [gender ? `Gender: ${gender}` : "", "Created from opportunity flow."].filter(Boolean);
      const phone = (input.contactPhone ?? "").trim();
      const rec: ContactRecord = {
        id,
        contactOwner: "Katie Allen",
        firstName: first,
        lastName: last,
        contactType: "Prospect",
        email: (input.contactEmail ?? "").trim(),
        phone,
        otherPhone: "",
        homePhone: "",
        mobile: phone,
        fax: "",
        accountName: accNameForContact,
        department: "",
        title: "",
        mailingStreet: street,
        mailingCity: city,
        mailingState: state,
        mailingCode: zip,
        mailingCountry: country,
        otherStreet: "",
        otherCity: "",
        otherState: "",
        otherCode: "",
        otherCountry: "",
        description: descParts.join(" "),
        createdAt: new Date().toISOString(),
      };
      upsertContact(rec);
      linkedContactId = id;
    }
  }

  return { linkedAccountId, linkedContactId };
}

export function opportunityDataToPersistInput(data: OpportunityData): CrmPersistInput {
  return {
    customerType: data.customerType,
    linkedAccountId: data.linkedAccountId,
    linkedContactId: data.linkedContactId,
    accountName: data.accountName,
    accountWebsite: data.accountWebsite,
    accountIndustry: data.accountIndustry,
    contactFirstName: data.contactFirstName,
    contactLastName: data.contactLastName,
    contactName: data.contactName,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,
    contactGender: data.contactGender,
    addressStreet: data.addressStreet,
    addressCity: data.addressCity,
    addressState: data.addressState,
    addressZip: data.addressZip,
    addressCountry: data.addressCountry,
  };
}
