"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  Users,
  Mail,
  Phone,
  Building2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRangePicker, DateRange } from "@/components/accounts/DateRangePicker";
import {
  ContactRecord,
  loadContacts,
  saveContacts,
  deleteContact,
} from "@/lib/mock-data/contacts";
import { loadAccounts } from "@/lib/mock-data/accounts";

// ─── Types ────────────────────────────────────────────────────────────────────

type SortField = "id" | "firstName" | "phone" | "email" | "accountName";
type SortDir = "asc" | "desc";

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({
  field,
  sortField,
  sortDir,
}: {
  field: SortField;
  sortField: SortField;
  sortDir: SortDir;
}) {
  if (field !== sortField) return <ChevronsUpDown size={13} className="text-slate-300" />;
  return sortDir === "asc" ? (
    <ChevronUp size={13} className="text-[#002f93]" />
  ) : (
    <ChevronDown size={13} className="text-[#002f93]" />
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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const pathname = usePathname();
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [accountIdMap, setAccountIdMap] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [dateLabel, setDateLabel] = useState("All Time");
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (pathname !== "/contact") return;
    setContacts(loadContacts());
    const map: Record<string, string> = {};
    loadAccounts().forEach((a) => {
      map[a.name] = a.id;
    });
    setAccountIdMap(map);
  }, [pathname]);

  useEffect(() => {
    if (contacts.length > 0) saveContacts(contacts);
  }, [contacts]);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  const filtered = useMemo(() => {
    return contacts
      .filter((c) => {
        const q = search.toLowerCase();
        const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
        const matchesSearch =
          !q ||
          fullName.includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.accountName.toLowerCase().includes(q);

        const created = new Date(c.createdAt);
        const matchesDate =
          !dateRange.start && !dateRange.end
            ? true
            : dateRange.start && dateRange.end
            ? created >= dateRange.start && created <= dateRange.end
            : dateRange.start
            ? created >= dateRange.start
            : true;

        return matchesSearch && matchesDate;
      })
      .sort((a, b) => {
        let av: string;
        let bv: string;
        if (sortField === "firstName") {
          av = `${a.firstName} ${a.lastName}`;
          bv = `${b.firstName} ${b.lastName}`;
        } else {
          av = (a[sortField] as string) ?? "";
          bv = (b[sortField] as string) ?? "";
        }
        const cmp = av.localeCompare(bv);
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [contacts, search, dateRange, sortField, sortDir]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((c) => c.id)));
    }
  }

  function handleDeleteConfirmed(id: string) {
    deleteContact(id);
    setContacts(loadContacts());
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setDeleteConfirmId(null);
  }

  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < filtered.length;

  const thCls = (field: SortField) =>
    cn(
      "px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer select-none hover:text-slate-700 transition-colors",
      sortField === field && "text-[#002f93]"
    );

  return (
    <div className="flex flex-col gap-5 p-6 min-h-full">
      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex items-center gap-3">
        <DateRangePicker
          value={dateRange}
          label={dateLabel}
          onChange={(range, label) => {
            setDateRange(range);
            setDateLabel(label);
          }}
        />

        <div className="w-px h-5 bg-slate-200" />

        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search Contacts"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-8 py-1.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002f93]/30 focus:border-[#002f93] transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-800">
            {filtered.length} Contact{filtered.length !== 1 ? "s" : ""}
            {(search || dateRange.start || dateRange.end) && (
              <span className="ml-1.5 text-slate-400 font-normal text-xs">(filtered)</span>
            )}
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs text-[#002f93] font-semibold hover:underline"
            >
              Clear search
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="w-10 pl-5 pr-2 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-slate-300 accent-[#002f93] cursor-pointer"
                  />
                </th>

                <th className={thCls("id")} onClick={() => handleSort("id")}>
                  <span className="flex items-center gap-1.5">
                    Contact ID{" "}
                    <SortIcon field="id" sortField={sortField} sortDir={sortDir} />
                  </span>
                </th>

                <th className={thCls("firstName")} onClick={() => handleSort("firstName")}>
                  <span className="flex items-center gap-1.5">
                    Contact Name{" "}
                    <SortIcon field="firstName" sortField={sortField} sortDir={sortDir} />
                  </span>
                </th>

                <th className={thCls("phone")} onClick={() => handleSort("phone")}>
                  <span className="flex items-center gap-1.5">
                    Phone{" "}
                    <SortIcon field="phone" sortField={sortField} sortDir={sortDir} />
                  </span>
                </th>

                <th className={thCls("email")} onClick={() => handleSort("email")}>
                  <span className="flex items-center gap-1.5">
                    Email{" "}
                    <SortIcon field="email" sortField={sortField} sortDir={sortDir} />
                  </span>
                </th>

                <th className={thCls("accountName")} onClick={() => handleSort("accountName")}>
                  <span className="flex items-center gap-1.5">
                    Account{" "}
                    <SortIcon field="accountName" sortField={sortField} sortDir={sortDir} />
                  </span>
                </th>

                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Users size={20} className="text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-500">No contacts found</p>
                      <p className="text-xs text-slate-400">
                        Try adjusting your search or date range
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((contact) => (
                  <tr
                    key={contact.id}
                    className={cn(
                      "group transition-colors hover:bg-slate-50/70",
                      selectedIds.has(contact.id) && "bg-[#EFF3FF]/50"
                    )}
                  >
                    <td className="w-10 pl-5 pr-2 py-3.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(contact.id)}
                        onChange={() => toggleSelect(contact.id)}
                        className="w-4 h-4 rounded border-slate-300 accent-[#002f93] cursor-pointer"
                      />
                    </td>

                    {/* Contact ID */}
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                        {contact.id}
                      </span>
                    </td>

                    {/* Contact Name */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#EFF3FF] flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-[#002f93]">
                            {contact.firstName.charAt(0)}
                            {contact.lastName.charAt(0)}
                          </span>
                        </div>
                        <Link
                          href={`/contact/${contact.id}`}
                          className="text-sm font-semibold text-slate-800 hover:text-[#002f93] hover:underline transition-colors"
                        >
                          {contact.firstName} {contact.lastName}
                        </Link>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Phone size={12} className="text-slate-400 flex-shrink-0" />
                        {contact.phone || "—"}
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3.5">
                      {contact.email ? (
                        <div className="flex items-center gap-1.5">
                          <Mail size={12} className="text-slate-400 flex-shrink-0" />
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-sm text-[#002f93] hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {contact.email}
                          </a>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>

                    {/* Account Name */}
                    <td className="px-4 py-3.5">
                      {contact.accountName ? (
                        accountIdMap[contact.accountName] ? (
                          <Link
                            href={`/account/${accountIdMap[contact.accountName]}`}
                            className="flex items-center gap-1.5 text-sm text-[#002f93] hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Building2 size={12} className="text-slate-400 flex-shrink-0" />
                            {contact.accountName}
                          </Link>
                        ) : (
                          <div className="flex items-center gap-1.5 text-sm text-slate-600">
                            <Building2 size={12} className="text-slate-400 flex-shrink-0" />
                            {contact.accountName}
                          </div>
                        )
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/contact/${contact.id}`}
                          title="View"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        >
                          <Eye size={14} />
                        </Link>
                        <Link
                          href={`/contact/${contact.id}/edit`}
                          title="Edit"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          title="Delete"
                          onClick={() => setDeleteConfirmId(contact.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Showing{" "}
              <span className="font-semibold text-slate-600">{filtered.length}</span> of{" "}
              <span className="font-semibold text-slate-600">{contacts.length}</span> contacts
            </p>
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-3">
                <p className="text-xs font-semibold text-[#002f93]">
                  {selectedIds.size} selected
                </p>
                <button
                  onClick={() => {
                    Array.from(selectedIds).forEach((id) => deleteContact(id));
                    setContacts(loadContacts());
                    setSelectedIds(new Set());
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline"
                >
                  <Trash2 size={11} />
                  Delete selected
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirmId && (
        <DeleteModal
          name={
            (() => {
              const c = contacts.find((x) => x.id === deleteConfirmId);
              return c ? `${c.firstName} ${c.lastName}` : "";
            })()
          }
          onConfirm={() => handleDeleteConfirmed(deleteConfirmId)}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}
    </div>
  );
}
