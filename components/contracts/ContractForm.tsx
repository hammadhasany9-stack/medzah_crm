"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTenantRouter } from "@/components/providers/TenantProvider";
import { TenantLink } from "@/components/providers/TenantLink";
import { ArrowLeft, Download } from "lucide-react";
import { useCRMShell } from "@/components/shell/CRMShellContext";
import type { Contract, Opportunity } from "@/lib/types";
import {
  buildNewContract,
  customerSnapshotFromOpportunity,
  freightResponsibilityToShipping,
  lineItemsFromQuoteData,
  proposalSnapshotFromQuoteData,
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
import {
  CONTRACT_TEMPLATE_OPTIONS,
  findTemplateByLabel,
  openContractTemplateDownload,
} from "@/lib/contract-templates";
import {
  CARRIER_BILLING_OPTIONS,
  DELIVERY_CHARGES_OPTIONS,
  DELIVERY_LOCATIONS_OPTIONS,
  EXPECTED_DEMAND_OPTIONS,
  FREIGHT_RESPONSIBILITY_OPTIONS,
  PAYMENT_TERMS_OPTIONS,
} from "@/components/quotes/QuoteExtendedSummary";

const TERMS = ["3 months", "6 months", "1 year", "2 years", "3 years"];
const UPLOAD_WARN_BYTES = 4 * 1024 * 1024;

const inputCls =
  "w-full px-3 py-2 text-[13px] text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93]/30 focus:border-[#002f93] bg-white";
const selectCls =
  "w-full appearance-none px-3 py-2 text-[13px] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93]/30 focus:border-[#002f93] bg-white cursor-pointer";

function catalogIncludes(options: readonly string[], value: string): boolean {
  return options.some((o) => o === value);
}

function resolvedFreightDisplay(c: Contract): string {
  if (c.freightResponsibility.trim() !== "") return c.freightResponsibility;
  return c.shippingResponsibility === "Buyer" ? "Customer pays freight" : "We cover freight";
}

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
  const router = useTenantRouter();
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
  const contractFileInputRef = useRef<HTMLInputElement>(null);

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
        label: `${o.accountName} (${o.id})`,
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

  function handleContractTypeChange(label: string) {
    const tpl = findTemplateByLabel(label);
    setC((prev) =>
      prev
        ? {
            ...prev,
            type: label,
            contractTemplateFile: tpl ? tpl.fileName : prev.contractTemplateFile,
            updatedAt: new Date().toISOString(),
          }
        : null
    );
  }

  function handleContractUpload(file: File | null) {
    if (!file || !c) return;
    if (!/\.(docx?)$/i.test(file.name)) {
      window.alert("Please upload a .doc or .docx file.");
      return;
    }
    if (file.size > UPLOAD_WARN_BYTES) {
      window.alert(
        "This file is larger than 4 MB. Saving may fail in the browser storage quota; consider a smaller document."
      );
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setC((prev) =>
        prev
          ? {
              ...prev,
              contractUploadedFileName: file.name,
              contractUploadedDataUrl: dataUrl,
              updatedAt: new Date().toISOString(),
            }
          : null
      );
    };
    reader.readAsDataURL(file);
  }

  function clearContractUpload() {
    setC((prev) =>
      prev
        ? {
            ...prev,
            contractUploadedFileName: undefined,
            contractUploadedDataUrl: undefined,
            updatedAt: new Date().toISOString(),
          }
        : null
    );
    if (contractFileInputRef.current) contractFileInputRef.current.value = "";
  }

  function patchFreightResponsibility(fr: string) {
    setC((prev) =>
      prev
        ? {
            ...prev,
            freightResponsibility: fr,
            shippingResponsibility: freightResponsibilityToShipping(fr),
            updatedAt: new Date().toISOString(),
          }
        : null
    );
  }

  function patchCarrierBilling(method: string) {
    setC((prev) =>
      prev
        ? {
            ...prev,
            carrierBillingMethod: method,
            customerShippingAccountNumber:
              method === "Customer shipping account" ? prev.customerShippingAccountNumber : "",
            updatedAt: new Date().toISOString(),
          }
        : null
    );
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
    const proposalFields = proposalSnapshotFromQuoteData(opp.quoteData);
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
            ...proposalFields,
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
          <TenantLink href="/contracts" className="ml-2 text-[#002f93] font-semibold">
            Back to list
          </TenantLink>
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
          <div className="flex gap-2 items-center">
            <select
              className={`${selectCls} flex-1 min-w-0`}
              value={c.type}
              onChange={(e) => handleContractTypeChange(e.target.value)}
            >
              {!findTemplateByLabel(c.type) && c.type.trim() !== "" && (
                <option value={c.type}>{c.type}</option>
              )}
              {CONTRACT_TEMPLATE_OPTIONS.map((opt) => (
                <option key={opt.fileName} value={opt.label}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              aria-label="Download Word template for selected type"
              title="Download Word template for selected type"
              onClick={() => {
                if (
                  !openContractTemplateDownload({
                    type: c.type,
                    contractTemplateFile: c.contractTemplateFile,
                  })
                ) {
                  window.alert("Choose a catalog contract type above to download its template.");
                }
              }}
              className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              <Download size={16} className="text-slate-600 shrink-0" aria-hidden />
            </button>
          </div>
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

      <ContractCollapsible title="Commercial details" defaultOpen>
        <p className="text-xs text-slate-500 mb-3">
          Aligns with the opportunity proposal modal. Payment terms map to contract payment due; fetch overwrites these
          when quote data is pulled.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>Payment terms</Label>
            <select
              className={selectCls}
              value={c.paymentDue}
              onChange={(e) => patch("paymentDue", e.target.value)}
            >
              <option value="">—</option>
              {!catalogIncludes(PAYMENT_TERMS_OPTIONS, c.paymentDue) && c.paymentDue.trim() !== "" ? (
                <option value={c.paymentDue}>{c.paymentDue}</option>
              ) : null}
              {PAYMENT_TERMS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Expected demand</Label>
            <select
              className={selectCls}
              value={c.expectedDemand}
              onChange={(e) => patch("expectedDemand", e.target.value)}
            >
              <option value="">—</option>
              {!catalogIncludes(EXPECTED_DEMAND_OPTIONS, c.expectedDemand) &&
              c.expectedDemand.trim() !== "" ? (
                <option value={c.expectedDemand}>{c.expectedDemand}</option>
              ) : null}
              {EXPECTED_DEMAND_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </ContractCollapsible>

      <ContractCollapsible title="Logistics & Fulfilment" defaultOpen>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <Label>Delivery locations</Label>
            <select
              className={selectCls}
              value={c.deliveryLocations}
              onChange={(e) => patch("deliveryLocations", e.target.value)}
            >
              <option value="">—</option>
              {!catalogIncludes(DELIVERY_LOCATIONS_OPTIONS, c.deliveryLocations) &&
              c.deliveryLocations.trim() !== "" ? (
                <option value={c.deliveryLocations}>{c.deliveryLocations}</option>
              ) : null}
              {DELIVERY_LOCATIONS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          {c.deliveryLocations === "Multi-site" ? (
            <div>
              <Label>Number of delivery locations</Label>
              <input
                type="number"
                min={1}
                step={1}
                className={inputCls}
                value={c.deliveryLocationCount}
                onChange={(e) => patch("deliveryLocationCount", e.target.value)}
                placeholder="Quantity"
              />
            </div>
          ) : (
            <div className="hidden lg:block" aria-hidden />
          )}
          <div>
            <Label>Delivery timeline for first order</Label>
            <input
              type="date"
              className={inputCls}
              value={c.firstOrderDeliveryDate}
              onChange={(e) => patch("firstOrderDeliveryDate", e.target.value)}
            />
          </div>
        </div>
      </ContractCollapsible>

      <ContractCollapsible title="Shipping details" defaultOpen>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <Label>Freight responsibility</Label>
            <select
              className={selectCls}
              value={resolvedFreightDisplay(c)}
              onChange={(e) => patchFreightResponsibility(e.target.value)}
            >
              {!catalogIncludes(FREIGHT_RESPONSIBILITY_OPTIONS, resolvedFreightDisplay(c)) ? (
                <option value={resolvedFreightDisplay(c)}>{resolvedFreightDisplay(c)}</option>
              ) : null}
              {FREIGHT_RESPONSIBILITY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Delivery charges</Label>
            <select
              className={selectCls}
              value={c.deliveryCharges}
              onChange={(e) => patch("deliveryCharges", e.target.value)}
            >
              <option value="">—</option>
              {!catalogIncludes(DELIVERY_CHARGES_OPTIONS, c.deliveryCharges) &&
              c.deliveryCharges.trim() !== "" ? (
                <option value={c.deliveryCharges}>{c.deliveryCharges}</option>
              ) : null}
              {DELIVERY_CHARGES_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Carrier billing</Label>
            <select
              className={selectCls}
              value={c.carrierBillingMethod}
              onChange={(e) => patchCarrierBilling(e.target.value)}
            >
              <option value="">—</option>
              {!catalogIncludes(CARRIER_BILLING_OPTIONS, c.carrierBillingMethod) &&
              c.carrierBillingMethod.trim() !== "" ? (
                <option value={c.carrierBillingMethod}>{c.carrierBillingMethod}</option>
              ) : null}
              {CARRIER_BILLING_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          {c.carrierBillingMethod === "Customer shipping account" ? (
            <div>
              <Label>Customer shipping account #</Label>
              <input
                className={inputCls}
                value={c.customerShippingAccountNumber}
                onChange={(e) => patch("customerShippingAccountNumber", e.target.value)}
                placeholder="Account number"
              />
            </div>
          ) : (
            <div className="hidden lg:block" aria-hidden />
          )}
        </div>
      </ContractCollapsible>

      <ContractCollapsible title="Payment terms">
        <p className="text-xs text-slate-500 mb-3">
          Payment terms (e.g. Net 30) are edited under Commercial details. Fetch replaces them from the quote proposal.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>Payment method</Label>
            <input className={inputCls} value={c.paymentMethod} onChange={(e) => patch("paymentMethod", e.target.value)} />
          </div>
          <div>
            <Label>Advance payment</Label>
            <input className={inputCls} value={c.advancePayment} onChange={(e) => patch("advancePayment", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Late payment penalty</Label>
            <input className={inputCls} value={c.latePaymentPenalty} onChange={(e) => patch("latePaymentPenalty", e.target.value)} />
          </div>
        </div>
      </ContractCollapsible>

      <ContractCollapsible title="Delivery terms">
        <p className="text-xs text-slate-500 mb-3">
          Freight responsibility is under Shipping details (proposal). Fetch overwrites delivery timeline and method from the quote where applicable.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>Delivery timeline</Label>
            <input className={inputCls} value={c.deliveryTimeline} onChange={(e) => patch("deliveryTimeline", e.target.value)} />
          </div>
          <div>
            <Label>Delivery method</Label>
            <input className={inputCls} value={c.deliveryMethod} onChange={(e) => patch("deliveryMethod", e.target.value)} />
          </div>
          <div className="flex items-center gap-2 pt-6 sm:col-span-2">
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

      <ContractCollapsible title="Upload contract">
        <p className="text-xs text-slate-500 mb-3">
          Optional. When uploaded, this file is used for Download contract (view screen and list). Otherwise the selected
          contract type template from the library is opened.
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <input
            ref={contractFileInputRef}
            type="file"
            accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="block w-full text-[13px] text-slate-700 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#002f93] file:text-white hover:file:bg-[#002a7d]"
            onChange={(e) => handleContractUpload(e.target.files?.[0] ?? null)}
          />
          {c.contractUploadedFileName && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-600 truncate max-w-[240px]" title={c.contractUploadedFileName}>
                {c.contractUploadedFileName}
              </span>
              <button
                type="button"
                onClick={clearContractUpload}
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          )}
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
