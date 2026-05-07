import type { AccountRecord } from "@/lib/mock-data/accounts";
import type { ContactRecord } from "@/lib/mock-data/contacts";
import { getAccountByName, loadAccounts } from "@/lib/mock-data/accounts";
import { loadContacts } from "@/lib/mock-data/contacts";

export function sortedAccounts(): AccountRecord[] {
  return loadAccounts().slice().sort((a, b) => a.name.localeCompare(b.name));
}

export function sortedContacts(): ContactRecord[] {
  return loadContacts()
    .slice()
    .sort((a, b) => {
      const na = `${a.firstName} ${a.lastName}`.trim().toLowerCase();
      const nb = `${b.firstName} ${b.lastName}`.trim().toLowerCase();
      return na.localeCompare(nb);
    });
}

export function contactsForAccountName(
  accountName: string,
  contacts: ContactRecord[] = sortedContacts()
): ContactRecord[] {
  const want = accountName.trim();
  if (!want) return contacts;
  return contacts.filter((c) => c.accountName === want);
}

export function contactDisplayLabel(c: ContactRecord): string {
  const name = `${c.firstName} ${c.lastName}`.trim();
  return `${name || c.id}${c.accountName ? ` (${c.accountName})` : ""}`;
}

/** After account change — clear contact if it no longer matches. */
export function contactIdCompatibleWithAccount(
  contactId: string,
  account: AccountRecord | undefined,
  contacts: ContactRecord[]
): boolean {
  if (!contactId || !account) return !contactId;
  const c = contacts.find((x) => x.id === contactId);
  return !!c && c.accountName === account.name;
}

export type ExistingLeadValidation =
  | { ok: true; contact: ContactRecord; account: AccountRecord }
  | { ok: false; message: string };

/**
 * Existing leads require CRM account + contact; contact must belong to the selected account
 * and the account entity must exist (navigable from Accounts).
 */
export function validateExistingLeadSelection(
  selectedAccountId: string,
  selectedContactId: string,
  accounts: AccountRecord[],
  contacts: ContactRecord[] = loadContacts()
): ExistingLeadValidation {
  if (!selectedAccountId.trim() || !selectedContactId.trim()) {
    return { ok: false, message: "Select an account and a contact." };
  }
  const contact = contacts.find((c) => c.id === selectedContactId);
  if (!contact) {
    return { ok: false, message: "Select a valid contact." };
  }
  const accountByContact = getAccountByName(contact.accountName);
  if (!accountByContact) {
    return {
      ok: false,
      message: "That contact's account does not exist in CRM. Fix the contact record or choose another.",
    };
  }
  const account = accounts.find((a) => a.id === selectedAccountId);
  if (!account || account.id !== accountByContact.id) {
    return { ok: false, message: "The contact must belong to the selected account." };
  }
  if (contact.accountName !== account.name) {
    return { ok: false, message: "The contact must belong to the selected account." };
  }
  return { ok: true, contact, account };
}
