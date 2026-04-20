"use client";

import type { AccountRecord } from "@/lib/mock-data/accounts";
import type { ContactRecord } from "@/lib/mock-data/contacts";
import type { Opportunity, QuoteData } from "@/lib/types";

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
        {title}
      </span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`text-sm ${value ? "text-slate-800 font-medium" : "text-slate-400"}`}>{value || "—"}</p>
    </div>
  );
}

function AddressBlock({
  street,
  city,
  state,
  code,
  country,
  label,
}: {
  street: string;
  city: string;
  state: string;
  code: string;
  country: string;
  label: string;
}) {
  const parts = [
    street,
    city && state ? `${city}, ${state} ${code}` : city || state,
    country,
  ].filter(Boolean);
  return (
    <div>
      {label ? (
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      ) : null}
      {!parts.length ? (
        <p className="text-sm text-slate-400">—</p>
      ) : (
        <div className="text-sm text-slate-800 font-medium space-y-0.5">
          {parts.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function formatValidDate(iso: string): string {
  if (!iso) return "—";
  const d = iso.split("T")[0];
  const [y, m, day] = d.split("-");
  return `${m}/${day}/${y} ; 21:00`;
}

export function PrimeAccountBlock({
  account,
  opportunity,
}: {
  account: AccountRecord | null;
  opportunity: Opportunity;
}) {
  if (!account) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm">
        <p className="font-semibold text-amber-900 mb-1">No matching account record</p>
        <p className="text-xs text-amber-800">
          Opportunity account: <span className="font-medium">{opportunity.accountName}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start gap-3">
        <div>
          <p className="text-base font-bold text-slate-900">{account.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {account.industry}
            {account.accountType ? ` · ${account.accountType}` : ""}
          </p>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
          {account.status}
        </span>
      </div>

      <SectionHeader title="Account details" />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Account owner" value={account.accountOwner} />
        <Field label="Account number" value={account.accountNumber} />
        <Field label="Phone" value={account.phone} />
        <Field label="Website" value={account.website} />
        <Field label="Fax" value={account.fax} />
        <Field label="Contracts counter-party ID" value={account.contractsCounterPartyId} />
      </div>

      <SectionHeader title="Addresses" />
      <div className="grid sm:grid-cols-2 gap-6">
        <AddressBlock
          label="Billing"
          street={account.billingStreet}
          city={account.billingCity}
          state={account.billingState}
          code={account.billingCode}
          country={account.billingCountry}
        />
        <AddressBlock
          label="Shipping"
          street={account.shippingStreet}
          city={account.shippingCity}
          state={account.shippingState}
          code={account.shippingCode}
          country={account.shippingCountry}
        />
      </div>

      {account.description ? (
        <>
          <SectionHeader title="Description" />
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{account.description}</p>
        </>
      ) : null}
    </div>
  );
}

export function PrimeContactBlock({
  contact,
  opportunity,
}: {
  contact: ContactRecord | null;
  opportunity: Opportunity;
}) {
  if (!contact) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm space-y-1">
        <p className="font-semibold text-slate-800">Contact (from opportunity)</p>
        <Field label="Name" value={opportunity.contactName} />
        <Field label="Email" value={opportunity.contactEmail} />
        <Field label="Phone" value={opportunity.contactPhone} />
        <p className="text-[11px] text-slate-500 pt-1">No matching contact record for this account and name.</p>
      </div>
    );
  }

  const displayName = `${contact.firstName} ${contact.lastName}`.trim();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-base font-bold text-slate-900">{displayName}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {contact.title}
          {contact.department ? ` · ${contact.department}` : ""}
        </p>
      </div>

      <SectionHeader title="Contact details" />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Contact owner" value={contact.contactOwner} />
        <Field label="Type" value={contact.contactType} />
        <Field label="Email" value={contact.email} />
        <Field label="Phone" value={contact.phone} />
        <Field label="Mobile" value={contact.mobile} />
        <Field label="Account" value={contact.accountName} />
      </div>

      <SectionHeader title="Mailing address" />
      <AddressBlock
        label=""
        street={contact.mailingStreet}
        city={contact.mailingCity}
        state={contact.mailingState}
        code={contact.mailingCode}
        country={contact.mailingCountry}
      />

      {(contact.otherStreet || contact.otherCity) && (
        <>
          <SectionHeader title="Other address" />
          <AddressBlock
            label=""
            street={contact.otherStreet}
            city={contact.otherCity}
            state={contact.otherState}
            code={contact.otherCode}
            country={contact.otherCountry}
          />
        </>
      )}

      {contact.description ? (
        <>
          <SectionHeader title="Description" />
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{contact.description}</p>
        </>
      ) : null}
    </div>
  );
}

export function PrimeQuoteBlock({ quoteData, opportunity }: { quoteData: QuoteData; opportunity: Opportunity }) {
  const qid = quoteData.quoteId?.trim() || "—";
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-base font-bold text-slate-900">{quoteData.subject}</span>
        <span className="text-[11px] font-mono font-semibold text-[#002f93] bg-[#002f93]/8 px-2 py-0.5 rounded">{qid}</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <Field label="Opportunity" value={opportunity.opportunityName} />
        <Field label="Quote stage" value={quoteData.quoteStage} />
        <Field label="Valid through" value={formatValidDate(quoteData.validDate)} />
        <Field label="Urgency" value={quoteData.urgency} />
        <Field label="Business type" value={quoteData.businessType} />
        <Field label="Shipping method" value={quoteData.shippingMethod} />
        <Field label="Grand total" value={quoteData.grandTotal} />
        <Field label="Opportunity owner" value={quoteData.opportunityOwner} />
      </div>

      <SectionHeader title="Billing (quote)" />
      <AddressBlock
        label=""
        street={quoteData.billingStreet}
        city={quoteData.billingCity}
        state={quoteData.billingState}
        code={quoteData.billingCode}
        country={quoteData.billingCountry}
      />

      <SectionHeader title="Shipping (quote)" />
      <AddressBlock
        label=""
        street={quoteData.shippingStreet}
        city={quoteData.shippingCity}
        state={quoteData.shippingState}
        code={quoteData.shippingCode}
        country={quoteData.shippingCountry}
      />

      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Subtotal" value={quoteData.subtotal} />
        <Field label="Discount" value={quoteData.discount} />
        <Field label="Tax" value={quoteData.tax} />
        <Field label="Adjustment" value={quoteData.adjustment} />
      </div>

      {quoteData.termsAndConditions ? (
        <>
          <SectionHeader title="Terms & conditions" />
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{quoteData.termsAndConditions}</p>
        </>
      ) : null}

      {quoteData.teamForApproval?.length ? (
        <>
          <SectionHeader title="Team for approval" />
          <p className="text-sm text-slate-800">{quoteData.teamForApproval.join(", ")}</p>
        </>
      ) : null}

      {quoteData.orderNotes ? <Field label="Order notes" value={quoteData.orderNotes} /> : null}
    </div>
  );
}
