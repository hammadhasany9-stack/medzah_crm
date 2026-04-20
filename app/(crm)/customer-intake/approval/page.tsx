"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Eye,
  Trash2,
  ClipboardList,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  X,
  ChevronDown as ChevronDownSmall,
  Mail,
  User,
  ArrowLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRangePicker, DateRange } from "@/components/accounts/DateRangePicker";
import {
  CustomerIntakeRecord,
  IntakeApprovalStatus,
  loadCustomerIntakes,
  deleteCustomerIntake,
  approveCustomerIntakeApproval,
  rejectCustomerIntakeApproval,
  sendCustomerIntakeFormAgain,
  INTAKE_OWNERS,
} from "@/lib/mock-data/customer-intake";

type SortField = "customerName" | "email" | "intakeOwner" | "modifiedTime";
type SortDir = "asc" | "desc";
type ApprovalTab = "all" | IntakeApprovalStatus;

const APPROVAL_STATUS_CONFIG: Record<
  IntakeApprovalStatus,
  { label: string; cls: string; dot: string }
> = {
  pending: {
    label: "Pending",
    cls: "bg-amber-50 text-amber-800 border border-amber-200",
    dot: "bg-amber-500",
  },
  approved: {
    label: "Approved",
    cls: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-500",
  },
};

function ApprovalStatusBadge({ status }: { status: IntakeApprovalStatus }) {
  const cfg = APPROVAL_STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
        cfg.cls
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

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

function OwnerFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#002f93] transition-colors"
      >
        {value === "" ? "All" : value}
        <ChevronDownSmall size={12} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-20 bg-white rounded-xl shadow-lg border border-slate-100 py-1 min-w-[160px]">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className={cn(
                "w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 transition-colors",
                value === "" ? "font-semibold text-[#002f93]" : "text-slate-600"
              )}
            >
              All
            </button>
            {INTAKE_OWNERS.map((owner) => (
              <button
                key={owner}
                type="button"
                onClick={() => {
                  onChange(owner);
                  setOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 transition-colors",
                  value === owner ? "font-semibold text-[#002f93]" : "text-slate-600"
                )}
              >
                {owner}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

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
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
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

function formatModifiedTime(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }) +
    " " +
    d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  );
}

function isInApprovalQueue(r: CustomerIntakeRecord): boolean {
  return r.intakeApprovalStatus === "pending" || r.intakeApprovalStatus === "approved";
}

const APPROVAL_TABS: { id: ApprovalTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
];

export default function CustomerIntakeApprovalPage() {
  const [records, setRecords] = useState<CustomerIntakeRecord[]>([]);
  const [search, setSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [dateLabel, setDateLabel] = useState("All Time");
  const [approvalTab, setApprovalTab] = useState<ApprovalTab>("all");
  const [sortField, setSortField] = useState<SortField>("modifiedTime");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    setRecords(loadCustomerIntakes());
  }, []);

  function refresh() {
    setRecords(loadCustomerIntakes());
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  const queueRecords = useMemo(() => records.filter(isInApprovalQueue), [records]);

  const filtered = useMemo(() => {
    return queueRecords
      .filter((r) => {
        const q = search.toLowerCase();
        const matchesSearch =
          !q ||
          r.customerName.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.intakeOwner.toLowerCase().includes(q);

        const matchesOwner = !ownerFilter || r.intakeOwner === ownerFilter;

        const matchesApproval =
          approvalTab === "all" || r.intakeApprovalStatus === approvalTab;

        const modified = new Date(r.modifiedTime);
        const matchesDate =
          !dateRange.start && !dateRange.end
            ? true
            : dateRange.start && dateRange.end
              ? modified >= dateRange.start && modified <= dateRange.end
              : dateRange.start
                ? modified >= dateRange.start
                : true;

        return matchesSearch && matchesOwner && matchesApproval && matchesDate;
      })
      .sort((a, b) => {
        let av: string;
        let bv: string;
        if (sortField === "modifiedTime") {
          av = a.modifiedTime;
          bv = b.modifiedTime;
        } else {
          av = a[sortField];
          bv = b[sortField];
        }
        const cmp = av.localeCompare(bv);
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [queueRecords, search, ownerFilter, approvalTab, dateRange, sortField, sortDir]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((r) => r.id)));
    }
  }

  function handleDeleteConfirmed(id: string) {
    deleteCustomerIntake(id);
    refresh();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setDeleteConfirmId(null);
  }

  function handleApprove(id: string) {
    if (approveCustomerIntakeApproval(id)) refresh();
  }

  function handleReject(id: string) {
    if (!window.confirm("Reject this intake approval request?")) return;
    if (rejectCustomerIntakeApproval(id)) refresh();
  }

  function handleSendFormAgain(id: string) {
    window.alert(
      "The form will be returned for revision. The submitter can send it for approval again from Customer Intake (demo)."
    );
    if (sendCustomerIntakeFormAgain(id)) refresh();
  }

  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < filtered.length;

  const thCls = (field: SortField) =>
    cn(
      "px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer select-none hover:text-slate-700 transition-colors",
      sortField === field && "text-[#002f93]"
    );

  const isFiltered = !!(
    search ||
    ownerFilter ||
    approvalTab !== "all" ||
    dateRange.start ||
    dateRange.end
  );

  return (
    <div className="flex flex-col gap-5 p-6 min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/customer-intake"
            className="w-9 h-9 rounded-lg flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Customer intake approvals</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Pending and approved intakes sent from Customer Intake.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex items-center gap-3 flex-wrap">
        <DateRangePicker
          value={dateRange}
          label={dateLabel}
          onChange={(range, label) => {
            setDateRange(range);
            setDateLabel(label);
          }}
        />

        <div className="w-px h-5 bg-slate-200" />

        <div className="relative flex-1 max-w-sm min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search Customer Intake"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-8 py-1.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002f93]/30 focus:border-[#002f93] transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="w-px h-5 bg-slate-200" />

        <div className="flex items-center gap-1 flex-wrap">
          {APPROVAL_TABS.map((tab) => {
            const count =
              tab.id === "all"
                ? queueRecords.length
                : queueRecords.filter((r) => r.intakeApprovalStatus === tab.id).length;
            const active = approvalTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setApprovalTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                  active
                    ? "bg-[#002f93] text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold",
                    active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-800">
            {filtered.length} Record{filtered.length !== 1 ? "s" : ""}
            {isFiltered && (
              <span className="ml-1.5 text-slate-400 font-normal text-xs">(filtered)</span>
            )}
          </p>
          {isFiltered && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setOwnerFilter("");
                setApprovalTab("all");
                setDateRange({ start: null, end: null });
                setDateLabel("All Time");
              }}
              className="text-xs text-[#002f93] font-semibold hover:underline"
            >
              Clear filters
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

                <th className={thCls("customerName")} onClick={() => handleSort("customerName")}>
                  <span className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5">
                      Customer Name{" "}
                      <SortIcon field="customerName" sortField={sortField} sortDir={sortDir} />
                    </span>
                    <span
                      onClick={(e) => e.stopPropagation()}
                      className="normal-case tracking-normal font-normal"
                    >
                      <OwnerFilter value={ownerFilter} onChange={setOwnerFilter} />
                    </span>
                  </span>
                </th>

                <th className={thCls("email")} onClick={() => handleSort("email")}>
                  <span className="flex items-center gap-1.5">
                    Email <SortIcon field="email" sortField={sortField} sortDir={sortDir} />
                  </span>
                </th>

                <th className={thCls("intakeOwner")} onClick={() => handleSort("intakeOwner")}>
                  <span className="flex items-center gap-1.5">
                    Customer Intake Owner{" "}
                    <SortIcon field="intakeOwner" sortField={sortField} sortDir={sortDir} />
                  </span>
                </th>

                <th className={thCls("modifiedTime")} onClick={() => handleSort("modifiedTime")}>
                  <span className="flex items-center gap-1.5">
                    Modified Time{" "}
                    <SortIcon field="modifiedTime" sortField={sortField} sortDir={sortDir} />
                  </span>
                </th>

                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Status
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
                        <ClipboardList size={20} className="text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-500">No approval records</p>
                      <p className="text-xs text-slate-400">
                        Send intakes for approval from Customer Intake when onboarding is complete
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((record) => {
                  const st = record.intakeApprovalStatus;
                  if (!st) return null;
                  return (
                    <tr
                      key={record.id}
                      className={cn(
                        "group transition-colors hover:bg-slate-50/70",
                        selectedIds.has(record.id) && "bg-[#EFF3FF]/50"
                      )}
                    >
                      <td className="w-10 pl-5 pr-2 py-3.5">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(record.id)}
                          onChange={() => toggleSelect(record.id)}
                          className="w-4 h-4 rounded border-slate-300 accent-[#002f93] cursor-pointer"
                        />
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#EFF3FF] flex items-center justify-center flex-shrink-0">
                            <ClipboardList size={13} className="text-[#002f93]" />
                          </div>
                          <span className="text-sm font-semibold text-slate-800">
                            {record.customerName}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Mail size={12} className="text-slate-400 flex-shrink-0" />
                          <a
                            href={`mailto:${record.email}`}
                            className="hover:text-[#002f93] hover:underline transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {record.email}
                          </a>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <User size={12} className="text-slate-400 flex-shrink-0" />
                          {record.intakeOwner}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="text-sm text-slate-600">
                          {formatModifiedTime(record.modifiedTime)}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <ApprovalStatusBadge status={st} />
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Link
                            href={`/customer-intake/${record.id}`}
                            title="View"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50"
                          >
                            <Eye size={13} />
                            View
                          </Link>
                          {st === "pending" && (
                            <>
                              <button
                                type="button"
                                title="Approve"
                                onClick={() => handleApprove(record.id)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                              >
                                <CheckCircle size={13} />
                                Approve
                              </button>
                              <button
                                type="button"
                                title="Reject"
                                onClick={() => handleReject(record.id)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-red-700 border border-red-200 bg-red-50 hover:bg-red-100"
                              >
                                <XCircle size={13} />
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            title="Send form again"
                            onClick={() => handleSendFormAgain(record.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 border border-slate-200 bg-white hover:bg-slate-50"
                          >
                            <RotateCcw size={13} />
                            Send form again
                          </button>
                          <button
                            type="button"
                            title="Delete"
                            onClick={() => setDeleteConfirmId(record.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Showing{" "}
              <span className="font-semibold text-slate-600">{filtered.length}</span> of{" "}
              <span className="font-semibold text-slate-600">{queueRecords.length}</span> in queue
            </p>
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-3">
                <p className="text-xs font-semibold text-[#002f93]">{selectedIds.size} selected</p>
                <button
                  type="button"
                  onClick={() => {
                    Array.from(selectedIds).forEach((id) => deleteCustomerIntake(id));
                    refresh();
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

      {deleteConfirmId && (
        <DeleteModal
          name={records.find((r) => r.id === deleteConfirmId)?.customerName ?? ""}
          onConfirm={() => handleDeleteConfirmed(deleteConfirmId)}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}
    </div>
  );
}
