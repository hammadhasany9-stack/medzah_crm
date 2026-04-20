"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Mail,
  ClipboardList,
  Phone,
  MapPin,
  Globe,
  User,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CustomerIntakeRecord,
  getCustomerIntakeById,
  deleteCustomerIntake,
} from "@/lib/mock-data/customer-intake";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }) + " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

// ─── Field display ────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mt-6 mb-5">
      <span className="text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
        {title}
      </span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

function Field({ label, value, href }: { label: string; value?: string | null; href?: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      {value ? (
        href ? (
          <a href={href} className="text-sm font-medium text-[#002f93] hover:underline">
            {value}
          </a>
        ) : (
          <p className="text-sm font-medium text-slate-800">{value}</p>
        )
      ) : (
        <p className="text-sm text-slate-400">—</p>
      )}
    </div>
  );
}

// ─── Delete modal ─────────────────────────────────────────────────────────────

function DeleteModal({ name, onConfirm, onCancel }: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <Trash2 size={18} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Delete Record</h3>
            <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-5">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-800">{name}</span>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomerIntakeViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [record, setRecord] = useState<CustomerIntakeRecord | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "timeline">("overview");

  useEffect(() => {
    const found = getCustomerIntakeById(id);
    if (found) setRecord(found);
    else setNotFound(true);
  }, [id]);

  function handleDelete() {
    deleteCustomerIntake(id);
    router.push("/customer-intake");
  }

  // ── Loading / not-found states ─────────────────────────────────────────────

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
          <ClipboardList size={24} className="text-slate-400" />
        </div>
        <p className="text-base font-semibold text-slate-700">Record not found</p>
        <Link href="/customer-intake" className="text-sm font-semibold text-[#002f93] hover:underline">
          ← Back to Customer Intake
        </Link>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="w-8 h-8 rounded-full border-2 border-[#002f93] border-t-transparent animate-spin" />
      </div>
    );
  }

  const primaryContactName = [record.primaryContactFirstName, record.primaryContactLastName]
    .filter(Boolean)
    .join(" ") || null;

  const apName = [record.accountsPayableFirstName, record.accountsPayableLastName]
    .filter(Boolean)
    .join(" ") || null;

  const primaryAddress = [
    record.primaryAddressStreet,
    record.primaryAddressCity && record.primaryAddressState
      ? `${record.primaryAddressCity}, ${record.primaryAddressState} ${record.primaryAddressZipCode}`.trim()
      : record.primaryAddressCity || record.primaryAddressState,
  ]
    .filter(Boolean)
    .join("\n") || null;

  return (
    <div className="flex flex-col min-h-full">
      {/* Sub-header */}
      <div className="bg-white border-b border-slate-100 shadow-sm px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link
          href="/customer-intake"
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Customer Intake
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (record.email) {
                window.location.href = `mailto:${record.email}?subject=Customer Intake - ${record.customerName}`;
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-[#002f93] text-white rounded-lg hover:bg-[#002070] transition-colors"
          >
            <Mail size={14} />
            Send Email
          </button>
          <Link
            href={`/customer-intake/${id}/edit`}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Pencil size={14} />
            Edit
          </Link>
          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex gap-5 items-start">

        {/* Main panel */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">

          {/* Profile card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#EFF3FF] border-2 border-[#002f93]/20 flex items-center justify-center flex-shrink-0">
                <ClipboardList size={26} className="text-[#002f93]" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-slate-900 leading-tight">
                  {record.customerName}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-1.5">
                  {record.customerFor && (
                    <span className="text-sm text-slate-500">{record.customerFor}</span>
                  )}
                  {record.jobTitle && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="text-sm text-slate-500">{record.jobTitle}</span>
                    </>
                  )}
                  <span className="text-slate-300">·</span>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock size={11} />
                    Last updated {timeAgo(record.modifiedTime)}
                  </span>
                </div>

                {/* Quick-glance row */}
                <div className="flex flex-wrap gap-4 mt-3">
                  {record.email && (
                    <a
                      href={`mailto:${record.email}`}
                      className="flex items-center gap-1.5 text-sm text-[#002f93] hover:underline"
                    >
                      <Mail size={13} className="flex-shrink-0" />
                      {record.email}
                    </a>
                  )}
                  {record.primaryContactPhone && (
                    <span className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Phone size={13} className="text-slate-400 flex-shrink-0" />
                      {record.primaryContactPhone}
                    </span>
                  )}
                  {record.website && (
                    <a
                      href={`https://${record.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-[#002f93] hover:underline"
                    >
                      <Globe size={13} className="flex-shrink-0" />
                      {record.website}
                    </a>
                  )}
                  {primaryAddress && (
                    <span className="flex items-center gap-1.5 text-sm text-slate-600">
                      <MapPin size={13} className="text-slate-400 flex-shrink-0" />
                      {record.primaryAddressCity}
                      {record.primaryAddressCity && record.primaryAddressState ? ", " : ""}
                      {record.primaryAddressState}
                    </span>
                  )}
                </div>
              </div>

              {/* Owner badge */}
              <div className="flex-shrink-0 flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                <div className="w-7 h-7 rounded-full bg-[#002f93] flex items-center justify-center text-white text-xs font-bold">
                  {record.intakeOwner.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="text-xs text-slate-400 leading-none mb-0.5">Intake Owner</p>
                  <p className="text-xs font-semibold text-slate-700">{record.intakeOwner}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab bar + detail card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="flex items-center border-b border-slate-100 px-5">
              {(["overview", "timeline"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "py-3 px-4 text-sm font-semibold border-b-2 transition-colors capitalize",
                    activeTab === tab
                      ? "border-[#002f93] text-[#002f93]"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  )}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Overview tab */}
            {activeTab === "overview" && (
              <div className="px-6 pb-8">
                {/* ── Customer Intake Information ── */}
                <SectionHeader title="Customer Intake Information" />

                <div className="grid grid-cols-2 gap-x-10 gap-y-5">
                  <Field label="Customer For" value={record.customerFor} />
                  <Field label="Customer Intake Owner" value={record.intakeOwner} />

                  <Field label="Customer Name" value={record.customerName} />
                  <Field
                    label="Secondary Email"
                    value={record.secondaryEmail}
                    href={record.secondaryEmail ? `mailto:${record.secondaryEmail}` : undefined}
                  />

                  <Field label="Primary Contact First Name" value={record.primaryContactFirstName} />
                  <Field label="Modified By" value={`${record.intakeOwner}\n${formatDate(record.modifiedTime)}`} />

                  <Field label="Primary Contact Last Name" value={record.primaryContactLastName} />
                  <Field label="Medzah / Ditek Sales Rep" value={record.salesRep} />

                  <Field
                    label="Email"
                    value={record.email}
                    href={record.email ? `mailto:${record.email}` : undefined}
                  />
                  <div />

                  <Field label="Primary Contact Phone" value={record.primaryContactPhone} />
                  <div />

                  <Field label="Primary Contact Mobile" value={record.primaryContactMobile} />
                  <div />

                  <Field label="Website" value={record.website} href={record.website ? `https://${record.website}` : undefined} />
                  <div />
                </div>

                {/* ── Accounts Payable ── */}
                <SectionHeader title="Accounts Payable" />

                <div className="grid grid-cols-2 gap-x-10 gap-y-5">
                  <Field label="Accounts Payable First Name" value={record.accountsPayableFirstName} />
                  <div />
                  <Field label="Accounts Payable Last Name" value={record.accountsPayableLastName} />
                  <div />
                  <Field
                    label="Accounts Payable Email"
                    value={record.accountsPayableEmail}
                    href={record.accountsPayableEmail ? `mailto:${record.accountsPayableEmail}` : undefined}
                  />
                  <div />
                  <Field label="Accounts Payable Phone" value={record.accountsPayablePhone} />
                  <div />
                </div>

                {/* ── Address ── */}
                <SectionHeader title="Primary Address" />

                <div className="grid grid-cols-2 gap-x-10 gap-y-5">
                  <Field label="Street" value={record.primaryAddressStreet} />
                  <div />
                  <Field label="City" value={record.primaryAddressCity} />
                  <div />
                  <Field label="State" value={record.primaryAddressState} />
                  <div />
                  <Field label="Zip Code" value={record.primaryAddressZipCode} />
                  <div />
                </div>

                {/* ── Other Details ── */}
                <SectionHeader title="Other Details" />

                <div className="grid grid-cols-2 gap-x-10 gap-y-5">
                  <Field label="Order Method Preference" value={record.orderMethodPreference} />
                  <div />
                  <Field label="W9 or Tax Exempt" value={record.w9OrTaxExempt} />
                  <div />
                  <Field label="Job Title" value={record.jobTitle} />
                  <div />
                </div>
              </div>
            )}

            {/* Timeline tab */}
            {activeTab === "timeline" && (
              <div className="px-6 py-10 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Clock size={20} className="text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-500">No timeline activity yet</p>
                <p className="text-xs text-slate-400">Activity history will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-56 flex-shrink-0 flex flex-col gap-4">
          {/* Summary card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
              Summary
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Intake Owner</p>
                <div className="flex items-center gap-1.5">
                  <User size={12} className="text-slate-400" />
                  <p className="text-xs font-semibold text-slate-700">{record.intakeOwner}</p>
                </div>
              </div>
              {record.email && (
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Email</p>
                  <a
                    href={`mailto:${record.email}`}
                    className="text-xs font-medium text-[#002f93] hover:underline break-all"
                  >
                    {record.email}
                  </a>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Modified By</p>
                <p className="text-xs font-semibold text-slate-700">{record.intakeOwner}</p>
                <p className="text-xs text-slate-400">{formatDate(record.modifiedTime)}</p>
              </div>
            </div>
          </div>

          {/* Related list placeholder */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
              Related
            </p>
            <div className="space-y-2">
              {["Notes", "Attachments", "Activities"].map((item) => (
                <button
                  key={item}
                  className="w-full text-left text-xs text-slate-500 hover:text-[#002f93] py-1 transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delete modal */}
      {showDelete && (
        <DeleteModal
          name={record.customerName}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}
