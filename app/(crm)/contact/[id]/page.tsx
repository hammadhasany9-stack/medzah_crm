"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Users,
  UserCircle2,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ContactRecord,
  getContactById,
  deleteContact,
  loadContacts,
} from "@/lib/mock-data/contacts";

// ─── Status / type styling ────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  Customer: "bg-emerald-100 text-emerald-700",
  Partner: "bg-blue-100 text-blue-700",
  Prospect: "bg-amber-100 text-amber-700",
  Lead: "bg-violet-100 text-violet-700",
  Vendor: "bg-slate-100 text-slate-600",
  Other: "bg-slate-100 text-slate-500",
};

// ─── Field display helpers ────────────────────────────────────────────────────

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

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={cn("text-sm", value ? "text-slate-800 font-medium" : "text-slate-400")}>
        {value || "—"}
      </p>
    </div>
  );
}

function AddressBlock({
  street,
  city,
  state,
  code,
  country,
}: {
  street: string;
  city: string;
  state: string;
  code: string;
  country: string;
}) {
  const parts = [
    street,
    city && state ? `${city}, ${state} ${code}` : city || state,
    country,
  ].filter(Boolean);
  if (!parts.length) return <p className="text-sm text-slate-400">—</p>;
  return (
    <div className="text-sm text-slate-800 font-medium space-y-0.5">
      {parts.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

// ─── Delete confirmation modal ────────────────────────────────────────────────

function DeleteModal({
  name,
  onConfirm,
  onCancel,
}: {
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
            <h3 className="text-base font-bold text-slate-900">Delete Contact</h3>
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

export default function ContactViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [contact, setContact] = useState<ContactRecord | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const found = getContactById(id);
    if (found) {
      setContact(found);
    } else {
      setNotFound(true);
    }
  }, [id]);

  function handleDelete() {
    deleteContact(id);
    router.push("/contact");
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Users size={24} className="text-slate-400" />
        </div>
        <p className="text-base font-semibold text-slate-700">Contact not found</p>
        <Link href="/contact" className="text-sm font-semibold text-[#002f93] hover:underline">
          ← Back to Contacts
        </Link>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="w-8 h-8 rounded-full border-2 border-[#002f93] border-t-transparent animate-spin" />
      </div>
    );
  }

  const fullName = `${contact.firstName} ${contact.lastName}`.trim();
  const initials = `${contact.firstName.charAt(0)}${contact.lastName.charAt(0)}`.toUpperCase();
  const createdDate = new Date(contact.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex flex-col min-h-full">
      {/* Sub-header */}
      <div className="bg-white border-b border-slate-100 shadow-sm px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link
          href="/contact"
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Contacts
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/contact/${id}/edit`}
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
      <div className="flex-1 p-6">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          {/* Profile header */}
          <div className="flex items-start gap-4 mb-2">
            <div className="w-16 h-16 rounded-full bg-[#EFF3FF] border-2 border-[#002f93]/20 flex items-center justify-center flex-shrink-0">
              {initials ? (
                <span className="text-xl font-bold text-[#002f93]">{initials}</span>
              ) : (
                <UserCircle2 size={32} className="text-[#002f93]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900">{fullName}</h1>
                {contact.contactType && (
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mt-0.5",
                      TYPE_COLORS[contact.contactType] ?? "bg-slate-100 text-slate-500"
                    )}
                  >
                    {contact.contactType}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                {contact.title && (
                  <span className="text-sm text-slate-500">{contact.title}</span>
                )}
                {contact.department && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className="text-sm text-slate-500">{contact.department}</span>
                  </>
                )}
                {contact.accountName && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className="text-sm text-slate-500">{contact.accountName}</span>
                  </>
                )}
                <span className="text-slate-300">·</span>
                <span className="text-sm text-slate-400">Created {createdDate}</span>
              </div>

              {/* Quick contact row */}
              <div className="flex items-center gap-5 mt-3 flex-wrap">
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-1.5 text-sm text-[#002f93] hover:underline"
                  >
                    <Mail size={13} className="text-slate-400" />
                    {contact.email}
                  </a>
                )}
                {contact.phone && (
                  <span className="flex items-center gap-1.5 text-sm text-slate-600">
                    <Phone size={13} className="text-slate-400" />
                    {contact.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── CONTACT INFORMATION ── */}
          <SectionHeader title="Contact Information" />

          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            <Field label="Contact ID" value={contact.id} />
            <Field label="Contact Owner" value={contact.contactOwner} />
            <Field label="First Name" value={contact.firstName} />
            <Field label="Last Name" value={contact.lastName} />
            <Field label="Contact Type" value={contact.contactType} />
            <Field label="Email" value={contact.email} />
            <Field label="Phone" value={contact.phone} />
            <Field label="Other Phone" value={contact.otherPhone} />
            <Field label="Home Phone" value={contact.homePhone} />
            <Field label="Mobile" value={contact.mobile} />
            <Field label="Fax" value={contact.fax} />
            <Field label="Account Name" value={contact.accountName} />
            <Field label="Department" value={contact.department} />
            <Field label="Title" value={contact.title} />
          </div>

          {/* ── ADDRESS INFORMATION ── */}
          <SectionHeader title="Address Information" />

          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <MapPin size={13} className="text-slate-400" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Mailing Address
                </p>
              </div>
              <AddressBlock
                street={contact.mailingStreet}
                city={contact.mailingCity}
                state={contact.mailingState}
                code={contact.mailingCode}
                country={contact.mailingCountry}
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <MapPin size={13} className="text-slate-400" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Other Address
                </p>
              </div>
              <AddressBlock
                street={contact.otherStreet}
                city={contact.otherCity}
                state={contact.otherState}
                code={contact.otherCode}
                country={contact.otherCountry}
              />
            </div>
          </div>

          {/* ── DESCRIPTION ── */}
          <SectionHeader title="Description" />

          <p className={cn("text-sm", contact.description ? "text-slate-700" : "text-slate-400")}>
            {contact.description || "No description provided."}
          </p>
        </div>
      </div>

      {/* Delete confirmation */}
      {showDelete && (
        <DeleteModal
          name={fullName}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}
