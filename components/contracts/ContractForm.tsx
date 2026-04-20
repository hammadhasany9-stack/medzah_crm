"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCRMShell } from "@/components/shell/CRMShellContext";
import type { Contract, Opportunity } from "@/lib/types";
import {
  buildNewContract,
  customerSnapshotFromOpportunity,
  lineItemsFromQuoteData,
} from "@/lib/mock-data/contracts";
import { getAccountByName, type AccountRecord } from "@/lib/mock-data/accounts";
import { getContactByAccountAndName, type ContactRecord } from "@/lib/mock-data/contacts";
import { ContractCollapsible } from "@/components/contracts/ContractCollapsible";
import { SearchableSelect, type SelectOption } from "@/components/contracts/SearchableSelect";
import {
  PrimeAccountBlock,
  PrimeContactBlock,
  PrimeQuoteBlock,
} from "@/components/contracts/ContractPrimeBlocks";

const CONTRACT_TYPES = ["Supply & Service", "Master Service", "Pilot", "MSA", "Other"];
const TERMS = ["3 months", "6 months", "1 year", "2 years", "3 years"];

const inputCls =
  "w-full px-3 py-2 text-[13px] text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93]/30 focus:border-[#002f93] bg-white";
const selectCls =
  "w-full appearance-none px-3 py-2 text-[13px] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93]/30 focus:border-[#002f93] bg-white cursor-pointer";

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function isContractEligibleOpportunity(o: Opportunity): boolean {
  return (
    o.opportunityStage === "Closed Won" &&
    o.quoteStatus === "approved" &&
    !!o.quoteData &&
    !!(o.quoteData.quoteId?.trim() ?? "")
  );
}

function resolveOpportunityForContractFetch(
  opps: Opportunity[],
  sel: { oppId: string; account: string; contact: string; quoteId: string }
): { opp: Opportunity | null; error: string | null } {
  const oppId = sel.oppId.trim();
  const account = sel.account.trim();
  const contact = sel.contact.trim();
  const quoteId = sel.quoteId.trim();
  if (!oppId || !account || !contact || !quoteId) {
    return {
      opp: null,
      error:
        "Opportunity ID, Account name, Contact name, and Quote ID are all required before fetch.",
    };
  }
  const opp = opps.find((o) => o.id === oppId) ?? null;
  if (!opp) {
    return { opp: null, error: "No opportunity exists with that Opportunity ID." };
  }
  if (opp.opportunityStage !== "Closed Won" || opp.quoteStatus !== "approved") {
    return {
      opp: null,
      error:
        "This opportunity must be Closed Won with an approved quote before you can create a contract from it.",
    };
  }
  if (!opp.quoteData) {
    return { opp: null, error: "That opportunity has no quote data." };
  }
  const expectedQuoteId = opp.quoteData.quoteId?.trim() ?? "";
  if (!expectedQuoteId) {
    return {
      opp: null,
      error: "That opportunity’s quote has no Quote ID assigned.",
    };
  }
  if (account !== opp.accountName || contact !== opp.contactName || quoteId !== expectedQuoteId) {
    return {
      opp: null,
      error:
        "Account name, Contact name, or Quote ID does not match this opportunity. Select the correct Opportunity ID and ensure all fields belong to that deal.",
    };
  }
  return { opp, error: null };
}

function applyTierNotes(
  opp: Opportunity,
  lines: Contract["lineItems"],
  allocations: import("@/lib/types").AllocationRecord[]
): Contract["lineItems"] {
  if (!opp.allocationId) return lines;
  const alloc = allocations.find((a) => a.id === opp.allocationId);
  if (!alloc) return lines;
  return lines.map((row) => {
    const match = alloc.products.find((p) => row.sku && p.sku === row.sku);
    if (!match || !match.tierPrices?.length) return row;
    const note = match.tierPrices
      .map((t) => `${t.rangeLabel}: $${t.userPrice}`)
      .join("; ");
    return { ...row, tierPricingNote: note };
  });
}

export function ContractForm({ contractId }: { contractId?: string }) {
  const router = useRouter();
  const { contracts, setContracts, opportunities, allocations } = useCRMShell();
  const [c, setC] = useState<Contract | null>(null);
  const [fetchErr, setFetchErr] = useState<string | null>(null);
  const [selOpp, setSelOpp] = useState("");
  const [selAccount, setSelAccount] = useState("");
  const [selContact, setSelContact] = useState("");
  const [selQuote, setSelQuote] = useState("");
  const [primeOpp, setPrimeOpp] = useState<Opportunity | null>(null);
  const [primeAccount, setPrimeAccount] = useState<AccountRecord | null>(null);
  const [primeContact, setPrimeContact] = useState<ContactRecord | null>(null);

  useEffect(() => {
    if (contractId) {
      const found = contracts.find((x) => x.id === contractId) ?? null;
      setC(found ? { ...found } : null);
      if (found) {
        setSelOpp(found.opportunityId);
        setSelAccount(found.accountName);
        setSelContact(found.contactName);
        setSelQuote(found.quoteId);
      }
    } else {
      setC(buildNewContract(contracts));
      setSelOpp("");
      setSelAccount("");
      setSelContact("");
      setSelQuote("");
    }
  }, [contractId, contracts]);

  const eligibleOpps = useMemo(
    () => opportunities.filter(isContractEligibleOpportunity),
    [opportunities]
  );

  useEffect(() => {
    if (!c?.opportunityId?.trim()) {
      setPrimeOpp(null);
      setPrimeAccount(null);
      setPrimeContact(null);
      return;
    }
    const opp = opportunities.find((o) => o.id === c.opportunityId);
    if (!opp) {
      setPrimeOpp(null);
      setPrimeAccount(null);
      setPrimeContact(null);
      return;
    }
    setPrimeOpp(opp);
    setPrimeAccount(getAccountByName(opp.accountName));
    setPrimeContact(getContactByAccountAndName(opp.accountName, opp.contactName));
  }, [c?.opportunityId, opportunities]);

  const oppOptions: SelectOption[] = useMemo(
    () =>
      eligibleOpps.map((o) => ({
        value: o.id,
        label: `${o.opportunityName} (${o.id})`,
      })),
    [eligibleOpps]
  );
  const accountOptions: SelectOption[] = useMemo(() => {
    const u = new Map<string, string>();
    eligibleOpps.forEach((o) => u.set(o.accountName, o.accountName));
    return Array.from(u.keys()).map((a) => ({ value: a, label: a }));
  }, [eligibleOpps]);
  const contactOptions: SelectOption[] = useMemo(() => {
    const u = new Map<string, string>();
    eligibleOpps.forEach((o) => u.set(o.contactName, o.contactName));
    return Array.from(u.keys()).map((a) => ({ value: a, label: a }));
  }, [eligibleOpps]);
  const quoteOptions: SelectOption[] = useMemo(
    () =>
      eligibleOpps.map((o) => ({
        value: o.quoteData!.quoteId!,
        label: `${o.quoteData!.quoteId} — ${o.quoteData!.subject}`,
      })),
    [eligibleOpps]
  );

  function patch<K extends keyof Contract>(key: K, value: Contract[K]) {
    setC((prev) => (prev ? { ...prev, [key]: value, updatedAt: new Date().toISOString() } : null));
  }

  function handleFetch() {
    setFetchErr(null);
    const { opp, error } = resolveOpportunityForContractFetch(opportunities, {
      oppId: selOpp,
      account: selAccount,
      contact: selContact,
      quoteId: selQuote,
    });
    if (error || !opp || !opp.quoteData) {
      setFetchErr(error ?? "Unknown error");
      return;
    }
    let lineItems = lineItemsFromQuoteData(opp.quoteData);
    lineItems = applyTierNotes(opp, lineItems, allocations);
    const customer = customerSnapshotFromOpportunity(opp);
    const qid = opp.quoteData.quoteId!;
    setPrimeOpp(opp);
    setPrimeAccount(getAccountByName(opp.accountName));
    setPrimeContact(getContactByAccountAndName(opp.accountName, opp.contactName));
    setC((prev) =>
      prev
        ? {
            ...prev,
            opportunityId: opp.id,
            quoteId: qid,
            accountName: opp.accountName,
            contactName: opp.contactName,
            customer,
            lineItems,
            updatedAt: new Date().toISOString(),
          }
        : null
    );
  }

  function persist(next: Contract, navigateTo?: string) {
    setContracts((prev) => {
      const exists = prev.some((x) => x.id === next.id);
      if (exists) return prev.map((x) => (x.id === next.id ? next : x));
      return [next, ...prev];
    });
    if (navigateTo) router.push(navigateTo);
  }

  function save(status: Contract["status"], go?: "list" | "view") {
    if (!c || !c.name.trim()) {
      alert("Please enter a contract name.");
      return;
    }
    const now = new Date().toISOString();
    const next: Contract = {
      ...c,
      status,
      updatedAt: now,
      effectiveAt: c.effectiveDate
        ? `${c.effectiveDate}T12:00:00.000Z`
        : c.effectiveAt,
    };
    if (go === "list") persist(next, "/contracts");
    else if (go === "view") persist(next, `/contracts/${next.id}`);
    else persist(next);
  }

  if (!c) {
    return (
      <div className="p-6 text-sm text-slate-500">
        {contractId ? "Contract not found." : "Loading…"}
        {contractId && (
          <Link href="/contracts" className="ml-2 text-[#002f93] font-semibold">
            Back to list
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-6 pb-28 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/contracts")}
          className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-lg font-bold text-slate-900">
          {contractId ? `Edit ${c.contractRef}` : "Create contract"}
        </h1>
      </div>

      {/* Header fields */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label required>Contract name</Label>
          <input
            className={inputCls}
            value={c.name}
            onChange={(e) => patch("name", e.target.value)}
          />
        </div>
        <div>
          <Label>Contract type</Label>
          <select
            className={selectCls}
            value={c.type}
            onChange={(e) => patch("type", e.target.value)}
          >
            {CONTRACT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Contract term</Label>
          <select
            className={selectCls}
            value={c.term}
            onChange={(e) => patch("term", e.target.value)}
          >
            {TERMS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Effective date</Label>
          <input
            type="date"
            className={inputCls}
            value={c.effectiveDate}
            onChange={(e) => patch("effectiveDate", e.target.value)}
          />
        </div>
      </div>

      {/* Fetch */}
      <ContractCollapsible title="Data fetch (CRM)" defaultOpen>
        <p className="text-xs text-slate-500 mb-3">
          Select a Closed Won opportunity with an approved quote. All four fields are required and must match that
          opportunity.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div>
            <Label required>Opportunity ID</Label>
            <SearchableSelect
              options={oppOptions}
              value={selOpp}
              onValueChange={setSelOpp}
              placeholder="Search opportunity…"
            />
          </div>
          <div>
            <Label required>Account name</Label>
            <SearchableSelect
              options={accountOptions}
              value={selAccount}
              onValueChange={setSelAccount}
            />
          </div>
          <div>
            <Label required>Contact name</Label>
            <SearchableSelect
              options={contactOptions}
              value={selContact}
              onValueChange={setSelContact}
            />
          </div>
          <div>
            <Label required>Quote ID</Label>
            <SearchableSelect
              options={quoteOptions}
              value={selQuote}
              onValueChange={setSelQuote}
              placeholder="Quote ref…"
            />
          </div>
        </div>
        {fetchErr && (
          <p className="text-xs text-red-600 mb-2 font-medium">{fetchErr}</p>
        )}
        <button
          type="button"
          onClick={handleFetch}
          className="px-4 py-2 rounded-lg bg-[#002f93] text-white text-sm font-semibold hover:bg-[#002a7d]"
        >
          Fetch data
        </button>
      </ContractCollapsible>

      {primeOpp && (
        <>
          <ContractCollapsible title="Account (from CRM)" defaultOpen>
            <PrimeAccountBlock account={primeAccount} opportunity={primeOpp} />
          </ContractCollapsible>
          <ContractCollapsible title="Contact (from CRM)" defaultOpen>
            <PrimeContactBlock contact={primeContact} opportunity={primeOpp} />
          </ContractCollapsible>
          {primeOpp.quoteData && (
            <ContractCollapsible title="Quote (from CRM)" defaultOpen>
              <PrimeQuoteBlock quoteData={primeOpp.quoteData} opportunity={primeOpp} />
            </ContractCollapsible>
          )}
        </>
      )}

      {/* Line items */}
      <ContractCollapsible title="Product / quote lines" defaultOpen>
        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="bg-slate-800 text-white text-[11px]">
                <th className="px-3 py-2 text-left">SKU</th>
                <th className="px-3 py-2 text-left">Product</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Price</th>
                <th className="px-3 py-2 text-right">Amount</th>
                <th className="px-3 py-2 text-left">Tier / notes</th>
              </tr>
            </thead>
            <tbody>
              {c.lineItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-500 text-xs">
                    Fetch data using a Closed Won opportunity with an approved quote, or leave empty.
                  </td>
                </tr>
              ) : (
                c.lineItems.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs">{row.sku || "—"}</td>
                    <td className="px-3 py-2">{row.productName}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{row.quantity}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{row.listPrice}</td>
                    <td className="px-3 py-2 text-right tabular-nums font-medium">{row.amount}</td>
                    <td className="px-3 py-2 text-xs text-slate-500">{row.tierPricingNote ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ContractCollapsible>

      <ContractCollapsible title="Payment terms">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>Payment method</Label>
            <input className={inputCls} value={c.paymentMethod} onChange={(e) => patch("paymentMethod", e.target.value)} />
          </div>
          <div>
            <Label>Payment due</Label>
            <input className={inputCls} value={c.paymentDue} onChange={(e) => patch("paymentDue", e.target.value)} />
          </div>
          <div>
            <Label>Advance payment</Label>
            <input className={inputCls} value={c.advancePayment} onChange={(e) => patch("advancePayment", e.target.value)} />
          </div>
          <div>
            <Label>Late payment penalty</Label>
            <input className={inputCls} value={c.latePaymentPenalty} onChange={(e) => patch("latePaymentPenalty", e.target.value)} />
          </div>
        </div>
      </ContractCollapsible>

      <ContractCollapsible title="Delivery terms">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>Delivery timeline</Label>
            <input className={inputCls} value={c.deliveryTimeline} onChange={(e) => patch("deliveryTimeline", e.target.value)} />
          </div>
          <div>
            <Label>Delivery method</Label>
            <input className={inputCls} value={c.deliveryMethod} onChange={(e) => patch("deliveryMethod", e.target.value)} />
          </div>
          <div>
            <Label>Shipping responsibility</Label>
            <select
              className={selectCls}
              value={c.shippingResponsibility}
              onChange={(e) =>
                patch("shippingResponsibility", e.target.value as Contract["shippingResponsibility"])
              }
            >
              <option value="Seller">Seller</option>
              <option value="Buyer">Buyer</option>
            </select>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="partial"
              checked={c.partialDeliveryAllowed}
              onChange={(e) => patch("partialDeliveryAllowed", e.target.checked)}
              className="rounded border-slate-300 accent-[#002f93]"
            />
            <label htmlFor="partial" className="text-sm text-slate-700">
              Partial delivery allowed
            </label>
          </div>
        </div>
      </ContractCollapsible>

      <ContractCollapsible title="Validity / expiry">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>Quote validity</Label>
            <input className={inputCls} value={c.quoteValidityDays} onChange={(e) => patch("quoteValidityDays", e.target.value)} />
          </div>
          <div>
            <Label>Price lock duration</Label>
            <input className={inputCls} value={c.priceLockDuration} onChange={(e) => patch("priceLockDuration", e.target.value)} />
          </div>
        </div>
      </ContractCollapsible>

      <ContractCollapsible title="Terms & conditions">
        <div className="space-y-3">
          <div>
            <Label>Return policy</Label>
            <textarea className={inputCls + " min-h-[72px]"} value={c.returnPolicy} onChange={(e) => patch("returnPolicy", e.target.value)} />
          </div>
          <div>
            <Label>Cancellation terms</Label>
            <textarea className={inputCls + " min-h-[72px]"} value={c.cancellationTerms} onChange={(e) => patch("cancellationTerms", e.target.value)} />
          </div>
          <div>
            <Label>Warranty</Label>
            <textarea className={inputCls + " min-h-[72px]"} value={c.warranty} onChange={(e) => patch("warranty", e.target.value)} />
          </div>
          <div>
            <Label>Liability limitations</Label>
            <textarea className={inputCls + " min-h-[72px]"} value={c.liabilityLimitations} onChange={(e) => patch("liabilityLimitations", e.target.value)} />
          </div>
        </div>
      </ContractCollapsible>

      <ContractCollapsible title="Special conditions">
        <div className="space-y-3">
          <div>
            <Label>Custom pricing notes</Label>
            <textarea className={inputCls + " min-h-[64px]"} value={c.customPricingNotes} onChange={(e) => patch("customPricingNotes", e.target.value)} />
          </div>
          <div>
            <Label>Discounts</Label>
            <textarea className={inputCls + " min-h-[64px]"} value={c.discounts} onChange={(e) => patch("discounts", e.target.value)} />
          </div>
          <div>
            <Label>Contract-specific agreements</Label>
            <textarea className={inputCls + " min-h-[64px]"} value={c.contractSpecificAgreements} onChange={(e) => patch("contractSpecificAgreements", e.target.value)} />
          </div>
        </div>
      </ContractCollapsible>

      <div className="sticky bottom-0 -mx-6 px-6 py-4 mt-4 bg-slate-100/95 border border-slate-200 rounded-xl flex flex-wrap gap-2 justify-end z-10">
        <button
          type="button"
          onClick={() => router.push("/contracts")}
          className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => save("draft")}
          className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => save("draft", "view")}
          className="px-4 py-2 rounded-lg border border-[#002f93] text-sm font-semibold text-[#002f93] hover:bg-[#002f93]/5"
        >
          Preview contract
        </button>
        <button
          type="button"
          onClick={() => save("pending_approval", "list")}
          className="px-4 py-2 rounded-lg bg-[#002f93] text-white text-sm font-semibold hover:bg-[#002a7d]"
        >
          Save & send for approval
        </button>
      </div>
    </div>
  );
}
