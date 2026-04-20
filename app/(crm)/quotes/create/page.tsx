"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ChevronDown, Plus, Trash2,
  Upload, Calendar, CalendarDays, CheckCircle2,
} from "lucide-react";
import { useCRMShell } from "@/components/shell/CRMShellContext";
import { generateNextQuoteId } from "@/lib/mock-data/quote-ids";
import { Opportunity, QuoteData, QuoteItem } from "@/lib/types";
import type { ProductCatalogItem } from "@/lib/mock-data/products";
import { QuoteProductNamePicker } from "@/components/quotes/QuoteProductNamePicker";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2, 9); }

function addDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y.slice(2)}`;
}

function emptyItem(): QuoteItem {
  return { id: uid(), productName: "", quantity: "", listPrice: "", amount: "", description: "" };
}

function computeSubtotal(items: QuoteItem[]): number {
  return items.reduce((s, it) => {
    const qty   = parseFloat(it.quantity) || 0;
    const price = parseFloat(it.listPrice.replace(/[^0-9.]/g, "")) || 0;
    return s + qty * price;
  }, 0);
}

function computeGrandTotal(items: QuoteItem[], discount: string, tax: string, adjustment: string): string {
  const sub  = computeSubtotal(items);
  const disc = parseFloat(discount.replace(/[^0-9.]/g, "")) || 0;
  const taxV = parseFloat(tax.replace(/[^0-9.]/g, ""))      || 0;
  const adj  = parseFloat(adjustment.replace(/[^0-9.]/g, "")) || 0;
  return (sub - disc + taxV + adj).toFixed(2);
}

// ─── Static option lists ──────────────────────────────────────────────────────

const ACCOUNT_NAMES         = ["Lumina Architecture", "Meridian Healthcare Group", "High Pointe Surgery Center", "Vantage Rehabilitation Services", "Capstone Medical", "Other"];
const QUOTE_STAGES          = ["Draft", "Needs Analysis", "Value Proposition", "Delivered", "On Hold", "Denied"];
const CONTACT_NAMES         = ["Alara Kalila", "Dr. Priya Sharma", "Josh Stoke", "Marcus Webb", "Dr. Aisha Nkemdirim", "Other"];
const SHIPPING_METHODS      = ["Standard Shipping", "Express Shipping", "Overnight Delivery", "Freight", "Customer Pickup"];
const SUBMITTAL_METHODS     = ["Email", "Portal", "Phone", "Fax", "EDI"];
const BUSINESS_TYPES        = ["New Business", "Existing Business", "Renewal", "Expansion", "B2B", "B2C"];
const URGENCY_OPTIONS       = ["High", "Medium", "Low"];
const BILLING_CITIES        = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Dallas"];
const BILLING_STATES        = ["New York", "California", "Texas", "Florida", "Illinois", "Ohio"];
const COUNTRIES             = ["United States", "Canada", "United Kingdom", "Australia"];
const TEAM_MEMBERS          = ["Amanda", "David Walsh", "Denise", "Mike"];
const AVATAR_COLORS         = ["bg-purple-100 text-purple-700", "bg-blue-100 text-blue-700", "bg-pink-100 text-pink-700", "bg-amber-100 text-amber-700"];

// ─── Shared field primitives ──────────────────────────────────────────────────

const inputCls  = (err?: boolean) =>
  `w-full px-3 py-2 text-[13px] text-slate-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93]/30 focus:border-[#002f93] transition-colors bg-white placeholder:text-slate-300
  ${err ? "border-red-400 bg-red-50" : "border-slate-200"}`;

const selectCls = (err?: boolean) =>
  `w-full appearance-none px-3 py-2 text-[13px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93]/30 focus:border-[#002f93] transition-colors bg-white cursor-pointer pr-8
  ${err ? "border-red-400 bg-red-50 text-slate-800" : "border-slate-200 text-slate-800"}`;

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function SelectWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}

function SectionDivider({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4 mt-1">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{children}</p>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

// ─── Quote Items Table ────────────────────────────────────────────────────────

function QuoteItemsTable({ items, onChange }: { items: QuoteItem[]; onChange: (v: QuoteItem[]) => void }) {
  function updateItem(id: string, field: keyof QuoteItem, value: string) {
    onChange(items.map((it) => {
      if (it.id !== id) return it;
      const updated = { ...it, [field]: value };
      if (field === "quantity" || field === "listPrice") {
        const qty   = parseFloat(updated.quantity) || 0;
        const price = parseFloat(updated.listPrice.replace(/[^0-9.]/g, "")) || 0;
        updated.amount = (qty * price).toFixed(2);
      }
      return updated;
    }));
  }

  function removeItem(id: string) {
    if (items.length === 1) return;
    onChange(items.filter((it) => it.id !== id));
  }

  function applyCatalogProduct(id: string, p: ProductCatalogItem) {
    onChange(
      items.map((it) => {
        if (it.id !== id) return it;
        const qtyStr = it.quantity.trim() ? it.quantity : "1";
        const q = parseFloat(qtyStr) || 1;
        const listPrice = p.price.toFixed(2);
        return {
          ...it,
          productName: `${p.productName} (${p.sku})`,
          quantity: qtyStr,
          listPrice,
          amount: (q * p.price).toFixed(2),
        };
      })
    );
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="grid grid-cols-[36px_1fr_100px_110px_110px_36px] bg-slate-800 text-white">
        <div className="px-2 py-2.5 text-[11px] font-bold text-center">S.No</div>
        <div className="px-3 py-2.5 text-[11px] font-bold">Product Name (SKU)</div>
        <div className="px-3 py-2.5 text-[11px] font-bold">Quantity</div>
        <div className="px-3 py-2.5 text-[11px] font-bold">List Price</div>
        <div className="px-3 py-2.5 text-[11px] font-bold">Amount</div>
        <div className="w-9" />
      </div>

      {items.map((item, idx) => (
        <div key={item.id} className="border-t border-slate-100">
          <div className="grid grid-cols-[36px_1fr_100px_110px_110px_36px] items-start py-2 bg-white">
            <div className="flex items-center justify-center pt-2.5 text-[12px] text-slate-500 font-semibold">{idx + 1}</div>
            <div className="px-2 space-y-1">
              <QuoteProductNamePicker
                value={item.productName}
                onValueChange={(v) => updateItem(item.id, "productName", v)}
                onSelectCatalog={(p) => applyCatalogProduct(item.id, p)}
                placeholder="Search or pick a product"
                inputClassName="w-full pl-7 pr-7 py-1.5 text-[12px] border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#002f93]/30 bg-slate-50 placeholder:text-slate-400"
              />
              <textarea
                value={item.description}
                onChange={(e) => updateItem(item.id, "description", e.target.value)}
                placeholder="Add Description"
                rows={2}
                className="w-full px-2 py-1.5 text-[12px] border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#002f93]/30 bg-slate-50 placeholder:text-slate-400 resize-none"
              />
            </div>
            <div className="px-2 pt-1">
              <input
                value={item.quantity}
                onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                placeholder="Enter Quantity"
                className="w-full px-2 py-1.5 text-[12px] border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#002f93]/30 bg-slate-50 placeholder:text-slate-400"
              />
            </div>
            <div className="px-2 pt-1">
              <input
                value={item.listPrice}
                onChange={(e) => updateItem(item.id, "listPrice", e.target.value)}
                placeholder="Enter Price"
                className="w-full px-2 py-1.5 text-[12px] border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#002f93]/30 bg-slate-50 placeholder:text-slate-400"
              />
            </div>
            <div className="px-2 pt-1">
              <input
                value={item.amount}
                readOnly
                placeholder="Enter Price"
                className="w-full px-2 py-1.5 text-[12px] border border-slate-200 rounded-md bg-slate-100 text-slate-600 cursor-not-allowed"
              />
            </div>
            <div className="flex items-start justify-center pt-2">
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                disabled={items.length === 1}
                className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      ))}

      <div className="border-t border-slate-100 px-3 py-2.5 bg-slate-50">
        <button
          type="button"
          onClick={() => onChange([...items, emptyItem()])}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-[#002f93] hover:text-[#001f6b] transition-colors"
        >
          <Plus size={13} />
          Add Row
        </button>
      </div>
    </div>
  );
}

// ─── Next Action Overlay ──────────────────────────────────────────────────────

function NextActionOverlay({
  followUpDate,
  onDateChange,
  onConfirm,
}: {
  followUpDate: string;
  onDateChange: (v: string) => void;
  onConfirm: () => void;
}) {
  const dateRef = useRef<HTMLInputElement>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] mx-4 overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center border-b border-slate-100">
          <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 size={22} className="text-emerald-500" />
          </div>
          <h2 className="text-[18px] font-bold text-slate-900">Quote Saved!</h2>
          <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">
            Your quote has been created. Set your next follow-up action below.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          <p className="text-[15px] font-bold text-slate-900 text-center">Your Next Action</p>

          {/* Follow-up date */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-[12px] text-slate-500">Follow up on:</p>
            <div className="flex items-center gap-3">
              <span className="text-[18px] font-bold text-slate-900">{formatDate(followUpDate)}</span>
              <button
                type="button"
                onClick={() => dateRef.current?.showPicker()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              >
                <CalendarDays size={12} />
                Change date
              </button>
              <input
                ref={dateRef}
                type="date"
                value={followUpDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => onDateChange(e.target.value)}
                className="absolute opacity-0 w-0 h-0 pointer-events-none"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Default: 2 days from today. You can change this above.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex justify-center">
          <button
            type="button"
            onClick={onConfirm}
            className="px-10 py-2.5 text-[13px] font-semibold rounded-xl bg-slate-900 text-white hover:bg-black transition-colors"
          >
            Confirm &amp; Go to Quotes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreateQuotePage() {
  const router = useRouter();
  const { setOpportunities, opportunities } = useCRMShell();

  // ── Form fields ─────────────────────────────────────────────────────────────
  const [subject,              setSubject]              = useState("");
  const [accountName,          setAccountName]          = useState("");
  const [opportunityOwner,     setOpportunityOwner]     = useState("Katie Allen");
  const [opportunityName,      setOpportunityName]      = useState("");
  const [quoteStage,           setQuoteStage]           = useState("");
  const [validDate,            setValidDate]            = useState("");
  const [contactName,          setContactName]          = useState("");
  const [shippingMethod,       setShippingMethod]       = useState("");
  const [customerPO,           setCustomerPO]           = useState("");
  const [orderSubmittalMethod, setOrderSubmittalMethod] = useState("");
  const [orderNotes,           setOrderNotes]           = useState("");
  const [businessType,         setBusinessType]         = useState("");
  const [urgency,              setUrgency]              = useState("");

  // Address
  const [billingStreet,  setBillingStreet]  = useState("");
  const [billingCity,    setBillingCity]    = useState("");
  const [billingState,   setBillingState]   = useState("");
  const [billingCode,    setBillingCode]    = useState("");
  const [billingCountry, setBillingCountry] = useState("");
  const [shippingStreet,  setShippingStreet]  = useState("");
  const [shippingCity,    setShippingCity]    = useState("");
  const [shippingState,   setShippingState]   = useState("");
  const [shippingCode,    setShippingCode]    = useState("");
  const [shippingCountry, setShippingCountry] = useState("");

  // Items + totals
  const [items,      setItems]      = useState<QuoteItem[]>([emptyItem()]);
  const [discount,   setDiscount]   = useState("");
  const [tax,        setTax]        = useState("");
  const [adjustment, setAdjustment] = useState("");

  // Team
  const [teamSelected, setTeamSelected] = useState<string[]>([...TEAM_MEMBERS]);

  // Description
  const [description, setDescription] = useState("");

  // Validation + overlay
  const [errors,    setErrors]    = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showNextAction, setShowNextAction] = useState(false);
  const [followUpDate,   setFollowUpDate]   = useState(addDays(2));

  const grandTotal = computeGrandTotal(items, discount, tax, adjustment);
  const subtotal   = computeSubtotal(items).toFixed(2);

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate() {
    const errs: Record<string, boolean> = {};
    if (!subject.trim())     errs["subject"]     = true;
    if (!accountName.trim()) errs["accountName"] = true;
    if (!businessType)       errs["businessType"] = true;
    if (!urgency)            errs["urgency"]     = true;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Save handlers ────────────────────────────────────────────────────────────
  function handleSave() {
    setSubmitted(true);
    if (!validate()) return;
    setShowNextAction(true);
  }

  function handleSaveAndNew() {
    setSubmitted(true);
    if (!validate()) return;
    commitQuote(followUpDate);
    // Reset form for new quote
    setSubject(""); setAccountName(""); setOpportunityName(""); setQuoteStage("");
    setValidDate(""); setContactName(""); setShippingMethod(""); setCustomerPO("");
    setOrderSubmittalMethod(""); setOrderNotes(""); setBusinessType(""); setUrgency("");
    setBillingStreet(""); setBillingCity(""); setBillingState(""); setBillingCode(""); setBillingCountry("");
    setShippingStreet(""); setShippingCity(""); setShippingState(""); setShippingCode(""); setShippingCountry("");
    setItems([emptyItem()]); setDiscount(""); setTax(""); setAdjustment("");
    setDescription(""); setFollowUpDate(addDays(2));
    setErrors({}); setSubmitted(false);
  }

  function commitQuote(followUp: string) {
    const now = new Date();
    const createdDate = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}/${String(now.getFullYear()).slice(2)} ; ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const quoteData: QuoteData = {
      subject, accountName, businessType, urgency,
      opportunityOwner, opportunityName, quoteStage, validDate,
      contactName, shippingMethod, customerPO, orderSubmittalMethod, orderNotes,
      billingStreet, billingCity, billingState, billingCode, billingCountry,
      shippingStreet, shippingCity, shippingState, shippingCode, shippingCountry,
      items,
      subtotal, discount, tax, adjustment, grandTotal,
      termsAndConditions: "",
      description,
      followUpDate: followUp,
      teamForApproval: teamSelected,
      quoteId: generateNextQuoteId(opportunities),
    };

    const opp: Opportunity = {
      id:               `opp-${uid()}`,
      opportunityRef:   `P-${Math.floor(10000 + Math.random() * 90000)}`,
      opportunityName:  opportunityName || subject || "New Quote",
      accountName,
      businessType,
      closingDate:      validDate || "",
      contactName,
      contactEmail:     "",
      contactPhone:     "",
      pipeline:         "Medzah Sales Pipeline",
      expectedRevenue:  grandTotal,
      amount:           grandTotal,
      campaignSource:   "",
      description,
      note:             orderNotes,
      leadSource:       "Direct",
      createdDate,
      leadPriority:     "Hot",
      opportunityStage: "Proposal/Price Quote",
      assignedTo:       opportunityOwner,
      companyName:      accountName,
      quoteStatus:      "pending",
      quoteData,
      activities: [{
        id:          `act-${uid()}`,
        type:        "created",
        title:       "Quote Created",
        description: `Quote "${subject}" created by ${opportunityOwner}`,
        timestamp:   "TODAY",
      }],
    };

    setOpportunities((prev) => {
      const next = [opp, ...prev];
      try {
        localStorage.setItem("crmOpportunities", JSON.stringify(next));
      } catch { /* ignore */ }
      return next;
    });
  }

  function handleNextActionConfirm() {
    commitQuote(followUpDate);
    setShowNextAction(false);
    router.push("/quotes");
  }

  function toggleTeamMember(name: string) {
    setTeamSelected((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">

      {/* ── Sticky top bar ── */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push("/quotes")}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="text-base font-bold text-slate-900">Create Quote</span>
        </div>

        {/* Right — action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#002f93] text-white hover:bg-[#001f6b] transition-colors"
          >
            Save
          </button>
          <button
            onClick={() => router.push("/quotes")}
            className="px-5 py-2 rounded-lg text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAndNew}
            className="px-5 py-2 rounded-lg text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Save and New
          </button>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">

          {/* Validation banner */}
          {submitted && Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-[12px] text-red-600 font-medium">
              Please fill in all required fields (Subject, Account Name, Business Type, Urgency).
            </div>
          )}

          {/* ── QUOTE INFORMATION ── */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 pt-5 pb-2">
              <SectionDivider>Quote Information</SectionDivider>
            </div>
            <div className="px-6 pb-6 grid grid-cols-2 gap-x-8 gap-y-4">

              {/* Row 1 */}
              <div>
                <Label required>Subject</Label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter subject"
                  className={inputCls(submitted && errors["subject"])}
                />
              </div>
              <div>
                <Label required>Account Name</Label>
                <SelectWrap>
                  <select
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className={selectCls(submitted && errors["accountName"])}
                  >
                    <option value="">Select account</option>
                    {ACCOUNT_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </SelectWrap>
              </div>

              {/* Row 2 */}
              <div>
                <Label>Opportunity Owner</Label>
                <input
                  value={opportunityOwner}
                  onChange={(e) => setOpportunityOwner(e.target.value)}
                  className={inputCls()}
                />
              </div>
              <div>
                <Label>Opportunity Name</Label>
                <input
                  value={opportunityName}
                  onChange={(e) => setOpportunityName(e.target.value)}
                  placeholder="Enter opportunity name"
                  className={inputCls()}
                />
              </div>

              {/* Row 3 */}
              <div>
                <Label>Quote Stage</Label>
                <SelectWrap>
                  <select value={quoteStage} onChange={(e) => setQuoteStage(e.target.value)} className={selectCls()}>
                    <option value="">Select Quote stage</option>
                    {QUOTE_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </SelectWrap>
              </div>
              <div>
                <Label>Valid Date</Label>
                <div className="relative">
                  <input
                    type="date"
                    value={validDate}
                    onChange={(e) => setValidDate(e.target.value)}
                    className={inputCls()}
                  />
                  <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Row 4 */}
              <div>
                <Label>Contact Name</Label>
                <SelectWrap>
                  <select value={contactName} onChange={(e) => setContactName(e.target.value)} className={selectCls()}>
                    <option value="">Select contact</option>
                    {CONTACT_NAMES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </SelectWrap>
              </div>
              <div>
                <Label>Shipping Method</Label>
                <SelectWrap>
                  <select value={shippingMethod} onChange={(e) => setShippingMethod(e.target.value)} className={selectCls()}>
                    <option value="">Select shipping method</option>
                    {SHIPPING_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </SelectWrap>
              </div>

              {/* Row 5 */}
              <div>
                <Label>Customer PO</Label>
                <input value={customerPO} onChange={(e) => setCustomerPO(e.target.value)} placeholder="Enter amount" className={inputCls()} />
              </div>
              <div>
                <Label>Order Submittal Method</Label>
                <SelectWrap>
                  <select value={orderSubmittalMethod} onChange={(e) => setOrderSubmittalMethod(e.target.value)} className={selectCls()}>
                    <option value="">Select submittal method</option>
                    {SUBMITTAL_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </SelectWrap>
              </div>

              {/* Row 6 */}
              <div>
                <Label>Order Notes</Label>
                <input value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} placeholder="Add a note" className={inputCls()} />
              </div>
              <div>
                <Label required>Business Type</Label>
                <SelectWrap>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className={selectCls(submitted && errors["businessType"])}
                  >
                    <option value="">Select Business</option>
                    {BUSINESS_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </SelectWrap>
              </div>

              {/* Row 7 */}
              <div>
                <Label>Spread Sheet Upload</Label>
                <label className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors bg-white">
                  <Upload size={13} className="text-slate-400 flex-shrink-0" />
                  <span className="text-[13px] text-slate-400">Choose file to upload</span>
                  <input type="file" accept=".xlsx,.xls,.csv" className="sr-only" />
                </label>
              </div>
              <div>
                <Label required>Urgency</Label>
                <SelectWrap>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className={selectCls(submitted && errors["urgency"])}
                  >
                    <option value="">Select Urgency</option>
                    {URGENCY_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </SelectWrap>
              </div>
            </div>
          </div>

          {/* ── ADDRESS INFORMATION ── */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 pt-5 pb-2">
              <SectionDivider>Address Information</SectionDivider>
            </div>
            <div className="px-6 pb-6 grid grid-cols-2 gap-x-8 gap-y-4">

              {/* Billing left / Shipping right */}
              <div>
                <Label>Billing Street</Label>
                <input value={billingStreet}   onChange={(e) => setBillingStreet(e.target.value)}   placeholder="Enter Street"  className={inputCls()} />
              </div>
              <div>
                <Label>Shipping Street</Label>
                <input value={shippingStreet} onChange={(e) => setShippingStreet(e.target.value)} placeholder="Enter Shipping Street" className={inputCls()} />
              </div>

              <div>
                <Label>Billing City</Label>
                <SelectWrap>
                  <select value={billingCity} onChange={(e) => setBillingCity(e.target.value)} className={selectCls()}>
                    <option value="">Enter City</option>
                    {BILLING_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </SelectWrap>
              </div>
              <div>
                <Label>Shipping City</Label>
                <SelectWrap>
                  <select value={shippingCity} onChange={(e) => setShippingCity(e.target.value)} className={selectCls()}>
                    <option value="">Enter City</option>
                    {BILLING_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </SelectWrap>
              </div>

              <div>
                <Label>Billing State</Label>
                <SelectWrap>
                  <select value={billingState} onChange={(e) => setBillingState(e.target.value)} className={selectCls()}>
                    <option value="">Enter State</option>
                    {BILLING_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </SelectWrap>
              </div>
              <div>
                <Label>Shipping State</Label>
                <SelectWrap>
                  <select value={shippingState} onChange={(e) => setShippingState(e.target.value)} className={selectCls()}>
                    <option value="">Enter State</option>
                    {BILLING_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </SelectWrap>
              </div>

              <div>
                <Label>Billing Code</Label>
                <input value={billingCode}   onChange={(e) => setBillingCode(e.target.value)}   placeholder="Enter amount" className={inputCls()} />
              </div>
              <div>
                <Label>Shipping Code</Label>
                <input value={shippingCode} onChange={(e) => setShippingCode(e.target.value)} placeholder="Enter amount" className={inputCls()} />
              </div>

              <div>
                <Label>Billing Country</Label>
                <SelectWrap>
                  <select value={billingCountry} onChange={(e) => setBillingCountry(e.target.value)} className={selectCls()}>
                    <option value="">Enter Country</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </SelectWrap>
              </div>
              <div>
                <Label>Shipping Country</Label>
                <SelectWrap>
                  <select value={shippingCountry} onChange={(e) => setShippingCountry(e.target.value)} className={selectCls()}>
                    <option value="">Enter Country</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </SelectWrap>
              </div>
            </div>
          </div>

          {/* ── QUOTE ITEMS ── */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 pt-5 pb-2">
              <SectionDivider>Quote Items</SectionDivider>
            </div>
            <div className="px-6 pb-6 space-y-3">
              <QuoteItemsTable items={items} onChange={setItems} />

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5">
                  {[
                    { label: "Subtotal ($)", value: `$${subtotal}`, editable: false },
                    { label: "Discount ($)", value: discount,   editable: true,  set: setDiscount   },
                    { label: "Tax ($)",      value: tax,        editable: true,  set: setTax        },
                    { label: "Adjustment",   value: adjustment, editable: true,  set: setAdjustment },
                  ].map(({ label, value, editable, set }) => (
                    <div key={label} className="flex justify-between items-center gap-3">
                      <span className="text-[12px] text-slate-600">{label}</span>
                      {editable && set ? (
                        <input
                          value={value}
                          onChange={(e) => set(e.target.value)}
                          placeholder="$0"
                          className="w-28 px-2 py-1 text-[12px] text-right border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#002f93]/30 bg-slate-50"
                        />
                      ) : (
                        <span className="text-[12px] font-semibold text-slate-700">{value}</span>
                      )}
                    </div>
                  ))}
                  <div className="border-t border-slate-200 pt-1.5 flex justify-between items-center">
                    <span className="text-[12px] font-bold text-slate-700">Grand Total ($)</span>
                    <span className="text-[14px] font-bold text-slate-900">${grandTotal}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── SEND FOR APPROVAL ── */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 pt-5 pb-2">
              <SectionDivider>Send for Approval</SectionDivider>
            </div>
            <div className="px-6 pb-5 flex items-center gap-8 flex-wrap">
              {TEAM_MEMBERS.map((name, i) => (
                <label key={name} className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={teamSelected.includes(name)}
                    onChange={() => toggleTeamMember(name)}
                    className="w-4 h-4 rounded accent-[#002f93] cursor-pointer"
                  />
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${AVATAR_COLORS[i]}`}>
                    {name[0]}
                  </div>
                  <span className="text-[13px] text-slate-700 font-medium">{name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ── DESCRIPTION ── */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 pt-5 pb-2">
              <SectionDivider>Description</SectionDivider>
            </div>
            <div className="px-6 pb-6">
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add description"
                className="w-full px-3 py-2.5 text-[13px] text-slate-800 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#002f93]/30 focus:border-[#002f93] placeholder:text-slate-300 leading-relaxed bg-white"
              />
            </div>
          </div>

          <div className="h-4" />
        </div>
      </div>

      {/* ── Next Action Overlay ── */}
      {showNextAction && (
        <NextActionOverlay
          followUpDate={followUpDate}
          onDateChange={setFollowUpDate}
          onConfirm={handleNextActionConfirm}
        />
      )}
    </div>
  );
}
